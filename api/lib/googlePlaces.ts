import { env } from "./env";

const GOOGLE_PLACES_API_KEY = env.googlePlacesApiKey;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
  photos?: { photo_reference: string }[];
  opening_hours?: { weekday_text?: string[] };
  editorial_summary?: { overview?: string };
  business_status?: string;
}

interface SearchResponse {
  status: string;
  results?: Array<{ place_id: string; name?: string }>;
  error_message?: string;
}

interface DetailsResponse {
  result?: PlaceResult;
  status: string;
}

export async function searchPlaces(
  query: string,
  city: string,
  maxResults: number = 20,
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    // Return mock data if no API key
    return generateMockPlaces(query, city);
  }

  try {
    // Step 1: Text search
    const searchUrl = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(
      `${query} in ${city}`,
    )}&key=${GOOGLE_PLACES_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as SearchResponse;

    if (searchData.status !== "OK" || !searchData.results) {
      console.warn("Google Places search failed:", searchData.status);
      return generateMockPlaces(query, city);
    }

    const results = searchData.results.slice(0, maxResults);

    // Step 2: Get details for each place
    const detailed = await Promise.all(
      results.map(async (place: { place_id: string }) => {
        try {
          const detailsUrl = `${BASE_URL}/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours,editorial_summary,business_status,types&key=${GOOGLE_PLACES_API_KEY}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = (await detailsRes.json()) as DetailsResponse;
          return detailsData.result ?? (place as PlaceResult);
        } catch {
          return place as PlaceResult;
        }
      }),
    );

    return detailed.filter(Boolean);
  } catch (err) {
    console.warn("Google Places error, using mock data:", err);
    return generateMockPlaces(query, city);
  }
}

export function assessWebsiteQuality(website?: string): "none" | "poor" | "basic" | "good" {
  if (!website) return "none";
  const w = website.toLowerCase();
  if (w.includes("facebook") || w.includes("yelp")) return "none";
  if (w.includes("weebly") || w.includes("wix") || w.includes("squarespace") || w.includes("wordpress")) {
    return "basic";
  }
  return "good";
}

function generateMockPlaces(query: string, city: string): PlaceResult[] {
  const categories: Record<string, string[]> = {
    cafe: ["Brew & Bloom", "The Daily Grind", "Morning Light Coffee", "Urban Roast", "Sip & Savor"],
    restaurant: ["The Copper Table", "Harbor Bistro", "Saffron Kitchen", "Woodfire Grill", "Market Street Eatery"],
    salon: ["Luxe Hair Studio", "Shear Elegance", "Bella Vista Salon", "The Color Bar", "Mane Attraction"],
    gym: ["Iron House Fitness", "Peak Performance", "Vital Strength", "Metro Fit Club", "Elevate Training"],
    plumber: ["Flow Right Plumbing", "Rapid Rooter", "AquaFix Pros", "Drain Masters", "Pipe Perfection"],
    dentist: ["Bright Smile Dental", "Harborview Dentistry", "Gentle Care Dental", "Premier Dental Group", "Smile Craft Dental"],
    roofer: ["Summit Roofing", "Shield Roofing Co", "Apex Roofers", "Guardian Roofing", "Skyline Roof Systems"],
    photographer: ["Lens & Light Studio", "Captured Moments", "Focus Frame Photography", "Shuttercraft", "Visionary Images"],
    lawyer: ["Harrison & Associates", "Summit Legal Group", "Justice Partners LLP", "The Law Office of Robert Cole", "Metro Legal Advisors"],
    bakery: ["Sweet Crumb Bakery", "Butter & Flour", "The Golden Oven", "Crust & Crumb", "Sugar & Spice Bakeshop"],
  };

  const cat = query.toLowerCase();
  let names: string[] = [];
  for (const [key, val] of Object.entries(categories)) {
    if (cat.includes(key)) {
      names = val;
      break;
    }
  }
  if (names.length === 0) {
    names = [`${query} Pro`, `${city} ${query}`, `Elite ${query}`, `${query} Solutions`, `Premier ${query}`];
  }

  return names.map((name, i) => ({
    place_id: `mock_${i}`,
    name,
    formatted_address: `${100 + i * 50} Main St, ${city}`,
    rating: 3.2 + Math.random() * 1.8,
    user_ratings_total: Math.floor(10 + Math.random() * 200),
    types: ["local_business"],
    website: i % 2 === 0 ? undefined : `http://old-${name.toLowerCase().replace(/\s+/g, "-")}.weebly.com`,
    business_status: "OPERATIONAL",
  }));
}
