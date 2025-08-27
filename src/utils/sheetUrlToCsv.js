// Convierte una URL de Google Sheets en la URL de exportación CSV
export function sheetUrlToCsv(url) {
  const match = url.match(/\/d\/([\w-]+)/);
  if (!match) return null;
  const id = match[1];
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
}

