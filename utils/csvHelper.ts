import { Lead } from "../types";

export const downloadCSV = (data: Lead[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Name",
    "Type",
    "Phone",
    "Email",
    "Website",
    "Rating",
    "Reviews",
    "Address",
    "Maps Link"
  ];

  const csvRows = [
    headers.join(","), // header row
    ...data.map(row => {
      const values = [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.type.replace(/"/g, '""')}"`,
        `"${row.phone.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.website.replace(/"/g, '""')}"`,
        row.rating,
        row.reviewCount,
        `"${row.address.replace(/"/g, '""')}"`,
        `"${row.googleMapsLink || ''}"`
      ];
      return values.join(",");
    })
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};