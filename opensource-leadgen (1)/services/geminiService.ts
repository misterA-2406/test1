import { GoogleGenAI } from "@google/genai";
import { Lead, AppSettings } from '../types';

// Helper to get client with dynamic key
const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Logic to determine the best service to pitch
const determineRecommendation = (lead: Partial<Lead>): string => {
  // 1. No Website -> Needs a website immediately (Primary trigger for 'Build')
  if (!lead.website || lead.website === '' || lead.website === 'N/A') {
    return 'build'; // New Website Build
  }
  
  // 2. Website Exists + Very Low Rating (< 4.0) -> Needs Reputation Management
  if ((lead.rating || 0) < 4.0) {
    return 'care'; // Monthly Care / Reputation Fix
  }

  // 3. Website Exists + Decent Rating -> Pitch an Audit/Optimization
  // This ensures we don't just spam 'Care' or 'Build'
  return 'check'; // Website Check
};

export const fetchLeads = async (
  apiKey: string,
  niche: string, 
  location: string, 
  count: number,
  onProgress?: (msg: string) => void
): Promise<Lead[]> => {
  try {
    const ai = getAiClient(apiKey);
    
    if (onProgress) onProgress("Initializing AI scraper...");

    // Using Gemini 2.5 Flash for speed and tool capabilities
    const modelId = "gemini-2.5-flash";

    const prompt = `
      Task: Find exactly ${count} existing businesses in the category "${niche}" located in "${location}".
      
      Execution Steps:
      1.  **Search Maps**: Use 'googleMaps' to find businesses matching the criteria.
      2.  **Verify Website**: Check if the Maps result includes a website.
      3.  **Deep Search (CRITICAL)**: If a business DOES NOT have a website on Maps, you MUST use 'googleSearch' to search for: "${niche} ${location} [Business Name] official website".
      4.  **Socials**: If no website is found, look for Instagram or Facebook pages using 'googleSearch'.
      
      Data Requirements:
      - **Name**: Exact business name.
      - **Phone**: Local phone number (or 'N/A').
      - **Website**: The official URL. If absolutely none exists after searching, return "".
      - **Address**: Full street address.
      - **Rating**: Google Maps rating (0-5).
      - **Reviews**: Number of reviews.
      - **Email**: Try to find a public contact email (info@, contact@) via search.
      
      Output Format:
      Return ONLY a JSON array. No markdown, no text explanations.
      
      Example JSON:
      [
        {
          "name": "Joe's Plumbing",
          "phone": "555-0123",
          "website": "https://joesplumbing.com",
          "instagram": "https://instagram.com/joesplumbing",
          "linkedin": "",
          "email": "hello@joesplumbing.com",
          "rating": 4.8,
          "reviewCount": 124,
          "address": "123 Main St, Austin, TX",
          "type": "Plumber"
        }
      ]
    `;

    if (onProgress) onProgress("Scanning Maps & Web (this takes 10-20s)...");

    // Enable BOTH Maps and Search to ensure data density
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        // We set a slightly higher temperature to encourage tool usage creativity
        temperature: 0.4
      }
    });

    if (onProgress) onProgress("Processing results...");

    let jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data received. The AI model might be busy, please try again.");
    }

    // Clean up potential markdown formatting (```json ... ```)
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Attempt to extract just the array part if there is extra text
    const start = jsonText.indexOf('[');
    const end = jsonText.lastIndexOf(']');
    
    if (start !== -1 && end !== -1) {
      jsonText = jsonText.substring(start, end + 1);
    }

    let leads: Lead[];
    try {
      leads = JSON.parse(jsonText) as Lead[];
    } catch (e) {
      console.error("Failed to parse JSON:", jsonText);
      throw new Error("AI returned invalid data structure. Please try again.");
    }

    // Post-process to ensure data quality and assign recommendations
    const cleanLeads = leads.map(lead => {
      const cleanedLead = {
        ...lead,
        type: lead.type || niche,
        phone: lead.phone || 'N/A',
        website: lead.website || '', // Empty string implies no website found
        instagram: lead.instagram || '',
        linkedin: lead.linkedin || '',
        email: lead.email || '',
        rating: lead.rating || 0,
        reviewCount: lead.reviewCount || 0,
        googleMapsLink: lead.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`
      };

      // Assign smart recommendation based on the NEW logic
      cleanedLead.recommendedServiceId = determineRecommendation(cleanedLead);

      return cleanedLead;
    });

    return cleanLeads;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide user-friendly error messages
    if (error.message.includes("API Key")) {
      throw new Error("Invalid API Key. Please check your settings.");
    }
    if (error.message.includes("500") || error.message.includes("Internal")) {
      throw new Error("Google AI is temporarily overloaded. Please try searching for a smaller count (e.g., 10) or try again in a moment.");
    }
    
    throw new Error(error.message || "Failed to fetch leads. Please check your network and API key.");
  }
};

const getPitchPrompt = (serviceName: string, lead: Lead) => `
  Write a highly personalized cold outreach email to "${lead.name}".
  
  Sender's Service Offer: "${serviceName}"
  
  Target Business Details:
  - Name: ${lead.name}
  - Type: ${lead.type}
  - Location: ${lead.address}
  - Website: ${lead.website ? lead.website : "NO WEBSITE (This is the main pain point!)"}
  - Rating: ${lead.rating} stars (${lead.reviewCount} reviews)
  
  INSTRUCTIONS:
  1. Subject Line: Catchy, short, and relevant to their business/location.
  2. Opening: Mention you found them searching for ${lead.type} in ${lead.address.split(',')[0]}. Prove you aren't a bot by mentioning their rating or review count.
  3. The Hook:
     - If they have NO website: Focus on how much business they are losing to competitors.
     - If they have a website but we are selling "Website Check": Mention that their site could convert better.
     - If they have low ratings and we are selling "Monthly Care": Focus on reputation management.
  4. Call to Action: Low friction (e.g., "Can I send over a quick video?").
  
  Tone: Professional, helpful, concise. NOT salesy or spammy.
  Length: Under 150 words.
`;

const fetchOpenAICompat = async (apiKey: string, baseUrl: string, model: string, prompt: string) => {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to generate pitch with external provider");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
};

export const generatePitch = async (settings: AppSettings, serviceName: string, lead: Lead): Promise<string> => {
    const prompt = getPitchPrompt(serviceName, lead);
    
    // 1. OpenAI (GPT-4o)
    if (settings.pitchModel === 'openai' && settings.openaiKey) {
       return fetchOpenAICompat(settings.openaiKey, "https://api.openai.com/v1", "gpt-4o", prompt);
    }
    
    // 2. Grok (xAI)
    if (settings.pitchModel === 'grok' && settings.grokKey) {
       return fetchOpenAICompat(settings.grokKey, "https://api.x.ai/v1", "grok-beta", prompt);
    }

    // 3. Fallback to Gemini
    // Ensure we have Gemini key if we fall back
    if (!settings.geminiKey) {
      throw new Error("Gemini API Key is missing for pitch generation.");
    }
    const ai = getAiClient(settings.geminiKey);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text || "Could not generate pitch.";
}