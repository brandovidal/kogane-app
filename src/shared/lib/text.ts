// Lowercase without accents, to search "credito" and find "Crédito"
export const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
