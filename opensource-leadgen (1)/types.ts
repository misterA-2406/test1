export interface Lead {
  name: string;
  phone: string;
  website: string;
  email: string; // Often inferred or empty from Maps, but we try to fetch it
  instagram?: string;
  linkedin?: string;
  rating: number;
  reviewCount: number;
  address: string;
  googleMapsLink?: string;
  type: string;
  recommendedServiceId?: string;
}

export interface ServiceOffer {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  color: string;
}

export type SearchParams = {
  niche: string;
  location: string;
  count: number;
};

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: Lead[];
  hasSearched: boolean;
}

export interface AppSettings {
  geminiKey: string;
  openaiKey: string;
  claudeKey: string;
  grokKey: string;
  pitchModel: 'gemini' | 'openai' | 'claude' | 'grok';
}

export interface HistoryItem {
  id: string;
  date: string;
  params: SearchParams;
  leads: Lead[];
}