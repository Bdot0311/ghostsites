export const env = {
  isProduction: process.env.NODE_ENV === "production",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? "",
};
