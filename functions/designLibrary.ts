// GhostSites Design Library v2 — Archetype-Specific Templates with Real Interactions
// Each archetype gets a UNIQUE HTML structure, not just different colors

export const COLOR_PALETTES = [
  // EDITORIAL / SOFT LUXURY
  { id: 1, name: "Cream Ink", mood_tags: ["Editorial", "Soft Luxury"], archetypes: ["Editorial", "Soft Luxury"], primary: "#F5F1E8", secondary: "#1A1A1A", accent: "#C04F2E", background: "#FAF6ED", text: "#1A1A1A", muted: "#6B6B6B" },
  { id: 2, name: "Sage Linen", mood_tags: ["Soft Luxury", "Warm Local"], archetypes: ["Soft Luxury", "Warm Local"], primary: "#D4DDC9", secondary: "#4A5240", accent: "#E8B86D", background: "#F2F0E8", text: "#2C2E27", muted: "#7A7D70" },
  { id: 3, name: "Bone & Rust", mood_tags: ["Editorial", "Warm Local"], archetypes: ["Editorial", "Warm Local"], primary: "#EFE9DD", secondary: "#2D2A26", accent: "#B5462C", background: "#F8F4EA", text: "#2D2A26", muted: "#8B8377" },
  { id: 4, name: "Champagne Noir", mood_tags: ["Soft Luxury"], archetypes: ["Soft Luxury"], primary: "#ECE4D4", secondary: "#0F0F0F", accent: "#C4A573", background: "#F5EFE2", text: "#1C1C1C", muted: "#6E665A" },
  { id: 5, name: "Dusty Rose", mood_tags: ["Soft Luxury", "Editorial"], archetypes: ["Soft Luxury", "Editorial"], primary: "#E8D5CC", secondary: "#3E2E2A", accent: "#A05A4F", background: "#F2E5DD", text: "#3E2E2A", muted: "#8C7872" },
  { id: 6, name: "Olive Press", mood_tags: ["Editorial", "Warm Local"], archetypes: ["Editorial", "Warm Local"], primary: "#C8C5A0", secondary: "#2A2D1F", accent: "#6B7A3F", background: "#EDEAD0", text: "#2A2D1F", muted: "#797B65" },
  { id: 7, name: "Porcelain Blue", mood_tags: ["Soft Luxury", "Bold Minimal"], archetypes: ["Soft Luxury", "Bold Minimal"], primary: "#DCE4E8", secondary: "#1F2937", accent: "#4A6B7A", background: "#F1F5F7", text: "#1F2937", muted: "#6E7A82" },
  { id: 8, name: "Terracotta Cream", mood_tags: ["Warm Local", "Soft Luxury"], archetypes: ["Warm Local", "Soft Luxury"], primary: "#F0E5D3", secondary: "#3A2C24", accent: "#C9663D", background: "#F8F1E3", text: "#3A2C24", muted: "#8C7B6E" },
  // BRUTALIST / BOLD MINIMAL
  { id: 9, name: "Concrete Acid", mood_tags: ["Brutalist"], archetypes: ["Brutalist"], primary: "#2A2A2A", secondary: "#F5F5F5", accent: "#D4FF00", background: "#1A1A1A", text: "#FFFFFF", muted: "#888888" },
  { id: 10, name: "Pure Brutalist", mood_tags: ["Brutalist", "Bold Minimal"], archetypes: ["Brutalist", "Bold Minimal"], primary: "#FFFFFF", secondary: "#000000", accent: "#FF3D00", background: "#FFFFFF", text: "#000000", muted: "#444444" },
  { id: 11, name: "Steel Yellow", mood_tags: ["Brutalist"], archetypes: ["Brutalist"], primary: "#1F1F1F", secondary: "#FAFAFA", accent: "#FFD600", background: "#2C2C2C", text: "#FAFAFA", muted: "#999999" },
  { id: 12, name: "Riso Pink", mood_tags: ["Brutalist", "Retro"], archetypes: ["Brutalist", "Retro"], primary: "#FFE5DC", secondary: "#1A1A1A", accent: "#FF4F8B", background: "#FFF1EC", text: "#1A1A1A", muted: "#6E6E6E" },
  { id: 13, name: "Cyber Lime", mood_tags: ["Modern Tech", "Brutalist"], archetypes: ["Modern Tech", "Brutalist"], primary: "#0A0A0A", secondary: "#FFFFFF", accent: "#C6FF3D", background: "#1A1A1A", text: "#FFFFFF", muted: "#777777" },
  { id: 14, name: "Print Black", mood_tags: ["Bold Minimal", "Editorial"], archetypes: ["Bold Minimal", "Editorial"], primary: "#FFFFFF", secondary: "#0A0A0A", accent: "#E63946", background: "#FFFFFF", text: "#0A0A0A", muted: "#555555" },
  { id: 15, name: "Industrial Orange", mood_tags: ["Brutalist"], archetypes: ["Brutalist"], primary: "#1C1C1C", secondary: "#F0F0F0", accent: "#FF5A1F", background: "#232323", text: "#F0F0F0", muted: "#888888" },
  { id: 16, name: "Mono Slab", mood_tags: ["Bold Minimal"], archetypes: ["Bold Minimal"], primary: "#F2F2F2", secondary: "#1A1A1A", accent: "#4A4A4A", background: "#FAFAFA", text: "#1A1A1A", muted: "#707070" },
  // RETRO / WARM LOCAL
  { id: 17, name: "Diner Red", mood_tags: ["Retro", "Warm Local"], archetypes: ["Retro", "Warm Local"], primary: "#E63946", secondary: "#F1FAEE", accent: "#1D3557", background: "#F8E9D6", text: "#1D3557", muted: "#6E7A82" },
  { id: 18, name: "70s Mustard", mood_tags: ["Retro"], archetypes: ["Retro"], primary: "#D4A24C", secondary: "#2B1810", accent: "#6B3410", background: "#F2E4C9", text: "#2B1810", muted: "#8C6E4E" },
  { id: 19, name: "Neon Diner", mood_tags: ["Retro"], archetypes: ["Retro"], primary: "#FFB30F", secondary: "#2D1B69", accent: "#FF006E", background: "#FFF8E1", text: "#2D1B69", muted: "#8E7BA8" },
  { id: 20, name: "Vintage Cola", mood_tags: ["Retro", "Warm Local"], archetypes: ["Retro", "Warm Local"], primary: "#B8312F", secondary: "#F5E6D3", accent: "#2C1810", background: "#FAEFE0", text: "#2C1810", muted: "#8C6E5C" },
  { id: 21, name: "Sunset Adobe", mood_tags: ["Warm Local", "Retro"], archetypes: ["Warm Local", "Retro"], primary: "#E8845A", secondary: "#3A1F1A", accent: "#F4D29C", background: "#FBF1E4", text: "#3A1F1A", muted: "#8C5E50" },
  { id: 22, name: "90s Grunge", mood_tags: ["Retro", "Brutalist"], archetypes: ["Retro", "Brutalist"], primary: "#2C2C2C", secondary: "#F5F5DC", accent: "#8B0000", background: "#1F1F1F", text: "#F5F5DC", muted: "#888878" },
  { id: 23, name: "Pinball Pop", mood_tags: ["Retro"], archetypes: ["Retro"], primary: "#FF4081", secondary: "#1A1A2E", accent: "#FFD60A", background: "#2D2D44", text: "#F5F5F5", muted: "#9999AA" },
  { id: 24, name: "Diner Mint", mood_tags: ["Retro", "Warm Local"], archetypes: ["Retro", "Warm Local"], primary: "#88D8B0", secondary: "#2C3E50", accent: "#F08080", background: "#F2F8F4", text: "#2C3E50", muted: "#6E7E8E" },
  // MODERN TECH
  { id: 25, name: "Mesh Indigo", mood_tags: ["Modern Tech"], archetypes: ["Modern Tech"], primary: "#6366F1", secondary: "#0F172A", accent: "#C7D2FE", background: "#1E1B4B", text: "#F1F5F9", muted: "#94A3B8" },
  { id: 26, name: "Glass Coral", mood_tags: ["Modern Tech", "Bold Minimal"], archetypes: ["Modern Tech", "Bold Minimal"], primary: "#FF6B6B", secondary: "#1A1A2E", accent: "#4ECDC4", background: "#16162C", text: "#F8F8FF", muted: "#8E8EAA" },
  { id: 27, name: "Cyber Mint", mood_tags: ["Modern Tech"], archetypes: ["Modern Tech"], primary: "#0A0E27", secondary: "#00F5D4", accent: "#FF006E", background: "#131638", text: "#F8F8FF", muted: "#8E92B0" },
  { id: 28, name: "Soft Tech", mood_tags: ["Modern Tech", "Soft Luxury"], archetypes: ["Modern Tech", "Soft Luxury"], primary: "#E8EAF6", secondary: "#1A237E", accent: "#7C4DFF", background: "#F5F6FA", text: "#1A237E", muted: "#7E84A8" },
  { id: 29, name: "Plasma", mood_tags: ["Modern Tech", "Brutalist"], archetypes: ["Modern Tech", "Brutalist"], primary: "#0F0F23", secondary: "#F0F0F5", accent: "#FF3D71", background: "#1A1A2E", text: "#F0F0F5", muted: "#8E8EAA" },
  // PHOTO-FIRST / MUTED
  { id: 30, name: "Film Grain", mood_tags: ["Photo-First", "Editorial"], archetypes: ["Photo-First", "Editorial"], primary: "#1F1F1F", secondary: "#F5F5F5", accent: "#C4A573", background: "#1F1F1F", text: "#F5F5F5", muted: "#888888" },
  { id: 31, name: "Documentary", mood_tags: ["Photo-First"], archetypes: ["Photo-First"], primary: "#FAFAFA", secondary: "#1A1A1A", accent: "#2D2D2D", background: "#FAFAFA", text: "#1A1A1A", muted: "#6E6E6E" },
  { id: 32, name: "Cinematic Blue", mood_tags: ["Photo-First", "Modern Tech"], archetypes: ["Photo-First", "Modern Tech"], primary: "#0A1929", secondary: "#E3F2FD", accent: "#FFA726", background: "#0F1F2E", text: "#E3F2FD", muted: "#6E7E8E" },
  { id: 33, name: "Gallery White", mood_tags: ["Photo-First", "Bold Minimal"], archetypes: ["Photo-First", "Bold Minimal"], primary: "#FFFFFF", secondary: "#1A1A1A", accent: "#C4A573", background: "#FFFFFF", text: "#1A1A1A", muted: "#888888" },
  // WARM LOCAL / NEIGHBORHOOD
  { id: 34, name: "Brick Bakery", mood_tags: ["Warm Local"], archetypes: ["Warm Local"], primary: "#C2461F", secondary: "#F4E8D4", accent: "#2C1810", background: "#F8F1E3", text: "#2C1810", muted: "#8C6E5C" },
  { id: 35, name: "Garden Green", mood_tags: ["Warm Local", "Soft Luxury"], archetypes: ["Warm Local", "Soft Luxury"], primary: "#4A6B3F", secondary: "#F2E8D5", accent: "#C9863D", background: "#F8F1E3", text: "#2A3D24", muted: "#7A7B65" },
  { id: 36, name: "Honey Oak", mood_tags: ["Warm Local"], archetypes: ["Warm Local"], primary: "#D4A24C", secondary: "#3D2817", accent: "#8B6F47", background: "#F4E8D0", text: "#3D2817", muted: "#8E7560" },
  { id: 37, name: "Clay Earth", mood_tags: ["Warm Local", "Editorial"], archetypes: ["Warm Local", "Editorial"], primary: "#BC6C25", secondary: "#283618", accent: "#FEFAE0", background: "#FEFAE0", text: "#283618", muted: "#6B6E50" },
  { id: 38, name: "Bistro Burgundy", mood_tags: ["Warm Local", "Editorial"], archetypes: ["Warm Local", "Editorial"], primary: "#6A1B1A", secondary: "#F2E8D5", accent: "#C9863D", background: "#F8F1E3", text: "#2C1810", muted: "#8C6E5C" },
  // EDITORIAL / MAGAZINE
  { id: 39, name: "Times Serif", mood_tags: ["Editorial"], archetypes: ["Editorial"], primary: "#FFFFFF", secondary: "#1A1A1A", accent: "#B91C1C", background: "#FAFAFA", text: "#1A1A1A", muted: "#6E6E6E" },
  { id: 40, name: "Manuscript", mood_tags: ["Editorial", "Soft Luxury"], archetypes: ["Editorial", "Soft Luxury"], primary: "#F8F4ED", secondary: "#1F1611", accent: "#8B4513", background: "#FAF6ED", text: "#1F1611", muted: "#7E6E5C" },
];

export const TYPOGRAPHY_PAIRS = [
  // EDITORIAL / LUXURY
  { id: 1, name: "Fraunces + Inter", archetypes: ["Editorial", "Soft Luxury"], heading_font: "Fraunces", body_font: "Inter", mood: "refined modern serif + clean sans", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  { id: 2, name: "Playfair Display + Manrope", archetypes: ["Editorial", "Soft Luxury"], heading_font: "Playfair Display", body_font: "Manrope", mood: "high-contrast serif + geometric sans", google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  { id: 3, name: "Cormorant + Work Sans", archetypes: ["Soft Luxury", "Editorial"], heading_font: "Cormorant", body_font: "Work Sans", mood: "elegant serif + warm sans", google_fonts: "Cormorant:ital,wght@0,300..700;1,300..700&family=Work+Sans:wght@300;400;500;600" },
  { id: 4, name: "DM Serif Display + DM Sans", archetypes: ["Editorial"], heading_font: "DM Serif Display", body_font: "DM Sans", mood: "strong display serif + neutral sans", google_fonts: "DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700" },
  { id: 5, name: "Lora + Nunito Sans", archetypes: ["Soft Luxury", "Warm Local"], heading_font: "Lora", body_font: "Nunito Sans", mood: "soft serif + rounded sans", google_fonts: "Lora:ital,wght@0,400..700;1,400..700&family=Nunito+Sans:ital,opsz,wght@0,6..12,300..700;1,6..12,300..700" },
  { id: 6, name: "EB Garamond + Karla", archetypes: ["Editorial", "Soft Luxury"], heading_font: "EB Garamond", body_font: "Karla", mood: "old-style serif + humanist sans", google_fonts: "EB+Garamond:ital,wght@0,400..800;1,400..800&family=Karla:ital,wght@0,300..700;1,300..700" },
  { id: 7, name: "Instrument Serif + Sohne", archetypes: ["Editorial", "Soft Luxury"], heading_font: "Instrument Serif", body_font: "Inter", mood: "classic serif + premium sans", google_fonts: "Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600" },
  { id: 8, name: "Crimson Pro + Jost", archetypes: ["Editorial", "Warm Local"], heading_font: "Crimson Pro", body_font: "Jost", mood: "elegant reading serif + modern geometric", google_fonts: "Crimson+Pro:ital,wght@0,200..900;1,200..900&family=Jost:ital,wght@0,100..900;1,100..900" },
  // BRUTALIST / BOLD
  { id: 9, name: "Space Grotesk + JetBrains Mono", archetypes: ["Brutalist", "Modern Tech"], heading_font: "Space Grotesk", body_font: "JetBrains Mono", mood: "geometric sans + mono", google_fonts: "Space+Grotesk:wght@300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800" },
  { id: 10, name: "Archivo Black + Inter", archetypes: ["Brutalist", "Bold Minimal"], heading_font: "Archivo Black", body_font: "Inter", mood: "heavy display + clean body", google_fonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  { id: 11, name: "Anton + Roboto Mono", archetypes: ["Brutalist", "Retro"], heading_font: "Anton", body_font: "Roboto Mono", mood: "condensed display + mono", google_fonts: "Anton&family=Roboto+Mono:ital,wght@0,100..700;1,100..700" },
  { id: 12, name: "Bebas Neue + Manrope", archetypes: ["Bold Minimal", "Brutalist"], heading_font: "Bebas Neue", body_font: "Manrope", mood: "tall caps + neutral sans", google_fonts: "Bebas+Neue&family=Manrope:wght@300;400;500;600" },
  { id: 13, name: "Oswald + Source Sans 3", archetypes: ["Brutalist", "Bold Minimal"], heading_font: "Oswald", body_font: "Source Sans 3", mood: "condensed sans + readable body", google_fonts: "Oswald:wght@200..700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900" },
  // MODERN TECH
  { id: 14, name: "Geist + Geist Mono", archetypes: ["Modern Tech"], heading_font: "Inter", body_font: "JetBrains Mono", mood: "modern sans + matched mono", google_fonts: "Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500" },
  { id: 15, name: "Inter + IBM Plex Mono", archetypes: ["Modern Tech"], heading_font: "Inter", body_font: "IBM Plex Mono", mood: "utility sans + technical mono", google_fonts: "Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700" },
  { id: 16, name: "General Sans + JetBrains Mono", archetypes: ["Modern Tech", "Bold Minimal"], heading_font: "Syne", body_font: "JetBrains Mono", mood: "clean sans + mono", google_fonts: "Syne:wght@400..800&family=JetBrains+Mono:wght@300;400;500" },
  { id: 17, name: "Plus Jakarta Sans + Fira Code", archetypes: ["Modern Tech"], heading_font: "Plus Jakarta Sans", body_font: "Fira Code", mood: "modern humanist + code", google_fonts: "Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Fira+Code:wght@300..700" },
  // WARM LOCAL / RETRO
  { id: 18, name: "Recoleta + Inter", archetypes: ["Warm Local", "Soft Luxury"], heading_font: "Fraunces", body_font: "Inter", mood: "friendly slab + clean body", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  { id: 19, name: "Crete Round + Lato", archetypes: ["Warm Local", "Retro"], heading_font: "Crete Round", body_font: "Lato", mood: "old-style slab + warm humanist", google_fonts: "Crete+Round:ital@0;1&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400" },
  { id: 20, name: "Abril Fatface + Raleway", archetypes: ["Retro", "Warm Local"], heading_font: "Abril Fatface", body_font: "Raleway", mood: "bold display + elegant body", google_fonts: "Abril+Fatface&family=Raleway:ital,wght@0,300..700;1,300..700" },
  { id: 21, name: "Playfair + Lato", archetypes: ["Warm Local", "Editorial"], heading_font: "Playfair Display", body_font: "Lato", mood: "classic serif + warm body", google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400" },
  // RETRO / NOSTALGIC
  { id: 22, name: "Teko + Barlow", archetypes: ["Retro", "Brutalist"], heading_font: "Teko", body_font: "Barlow", mood: "condensed retro + readable sans", google_fonts: "Teko:wght@300..700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400" },
  { id: 23, name: "Italiana + Karla", archetypes: ["Retro", "Soft Luxury"], heading_font: "Italiana", body_font: "Karla", mood: "elegant display + humanist body", google_fonts: "Italiana&family=Karla:ital,wght@0,300..700;1,300..700" },
  { id: 24, name: "Black Han Sans + Noto Sans", archetypes: ["Brutalist", "Bold Minimal"], heading_font: "Black Han Sans", body_font: "Noto Sans", mood: "ultra-bold + neutral", google_fonts: "Black+Han+Sans&family=Noto+Sans:ital,wght@0,100..900;1,100..900" },
  { id: 25, name: "Lilita One + Nunito", archetypes: ["Retro", "Warm Local"], heading_font: "Lilita One", body_font: "Nunito", mood: "chunky display + rounded body", google_fonts: "Lilita+One&family=Nunito:ital,wght@0,200..900;1,200..900" },
];

export const LAYOUT_VARIANTS = [
  { id: "SPLIT_HERO", name: "Split Hero", description: "Left text column, right image. 50/50 grid." },
  { id: "CENTERED_HERO", name: "Centered Hero", description: "Text only, massive type, centered, no hero image." },
  { id: "OFFSET_HERO", name: "Offset Hero", description: "Text left, small inset image bottom-right, asymmetric." },
  { id: "FULL_BLEED_HERO", name: "Full Bleed Hero", description: "Image fills viewport, overlay text bottom-left." },
  { id: "MAGAZINE_GRID", name: "Magazine Grid", description: "Multiple sections visible immediately, editorial grid." },
  { id: "SIDEBAR_NAV", name: "Sidebar Nav", description: "Vertical sidebar nav left, scrolling content right." },
  { id: "SCROLL_FLOW", name: "Scroll Flow", description: "No nav at top, sections flow continuously, jump links footer." },
  { id: "ASYMMETRIC_STACK", name: "Asymmetric Stack", description: "Sections offset alternating left/right, generous gaps." },
];

export const MICRO_INTERACTIONS = [
  "HOVER_LIFT",
  "MARQUEE",
  "PARALLAX",
  "CUSTOM_CURSOR",
  "SCROLL_REVEAL",
  "STICKY_HEADER",
  "TEXT_SCRAMBLE",
  "IMAGE_REVEAL",
  "MAGNETIC_BUTTONS",
];

export const IMAGERY_TREATMENTS = [
  "DUOTONE",
  "FULL_COLOR",
  "BLACK_WHITE",
  "GRAIN_OVERLAY",
  "CLEAN",
];

// Archetype to palette mapping
export const ARCHETYPE_PALETTE_MAP: Record<string, number[]> = {
  "Editorial": [1, 3, 6, 14, 39, 40, 37, 38],
  "Soft Luxury": [2, 4, 5, 7, 8, 28, 35, 40],
  "Brutalist": [9, 10, 11, 12, 13, 15, 22, 23, 29],
  "Modern Tech": [13, 25, 26, 27, 28, 29, 32],
  "Warm Local": [2, 3, 6, 8, 17, 20, 21, 24, 34, 35, 36, 37, 38],
  "Bold Minimal": [7, 10, 14, 16, 33],
  "Photo-First": [30, 31, 32, 33],
  "Retro": [12, 17, 18, 19, 20, 21, 22, 23, 24],
};

// Archetype to typography mapping
export const ARCHETYPE_TYPOGRAPHY_MAP: Record<string, number[]> = {
  "Editorial": [1, 2, 3, 4, 6, 7, 8],
  "Soft Luxury": [1, 2, 3, 5, 6, 7, 23],
  "Brutalist": [9, 10, 11, 12, 13, 22, 24],
  "Modern Tech": [9, 14, 15, 16, 17],
  "Warm Local": [5, 6, 18, 19, 20, 21, 25],
  "Bold Minimal": [10, 12, 13, 16, 24],
  "Photo-First": [1, 3, 4, 7, 8],
  "Retro": [11, 19, 20, 22, 23, 25],
};

// Archetype to layout variants mapping
export const ARCHETYPE_LAYOUT_MAP: Record<string, string[]> = {
  "Editorial": ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW", "ASYMMETRIC_STACK"],
  "Soft Luxury": ["CENTERED_HERO", "SPLIT_HERO", "OFFSET_HERO", "SCROLL_FLOW"],
  "Brutalist": ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID", "SIDEBAR_NAV"],
  "Modern Tech": ["SPLIT_HERO", "SIDEBAR_NAV", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local": ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW", "ASYMMETRIC_STACK"],
  "Bold Minimal": ["CENTERED_HERO", "OFFSET_HERO", "SPLIT_HERO", "MAGAZINE_GRID"],
  "Photo-First": ["FULL_BLEED_HERO", "MAGAZINE_GRID", "SPLIT_HERO", "OFFSET_HERO"],
  "Retro": ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID", "SPLIT_HERO"],
};

// Archetype to micro-interaction mapping
export const ARCHETYPE_INTERACTIONS_MAP: Record<string, string[]> = {
  "Editorial": ["SCROLL_REVEAL", "STICKY_HEADER", "IMAGE_REVEAL"],
  "Soft Luxury": ["SCROLL_REVEAL", "PARALLAX", "MAGNETIC_BUTTONS"],
  "Brutalist": ["CUSTOM_CURSOR", "TEXT_SCRAMBLE", "MARQUEE"],
  "Modern Tech": ["TEXT_SCRAMBLE", "CUSTOM_CURSOR", "MAGNETIC_BUTTONS"],
  "Warm Local": ["SCROLL_REVEAL", "MARQUEE", "HOVER_LIFT"],
  "Bold Minimal": ["SCROLL_REVEAL", "HOVER_LIFT", "MAGNETIC_BUTTONS"],
  "Photo-First": ["PARALLAX", "IMAGE_REVEAL", "SCROLL_REVEAL"],
  "Retro": ["MARQUEE", "HOVER_LIFT", "SCROLL_REVEAL"],
};

// Archetype to imagery treatment mapping
export const ARCHETYPE_IMAGERY_MAP: Record<string, string[]> = {
  "Editorial": ["GRAIN_OVERLAY", "BLACK_WHITE", "CLEAN"],
  "Soft Luxury": ["CLEAN", "DUOTONE", "FULL_COLOR"],
  "Brutalist": ["BLACK_WHITE", "DUOTONE", "GRAIN_OVERLAY"],
  "Modern Tech": ["DUOTONE", "BLACK_WHITE", "CLEAN"],
  "Warm Local": ["FULL_COLOR", "CLEAN", "GRAIN_OVERLAY"],
  "Bold Minimal": ["BLACK_WHITE", "CLEAN", "DUOTONE"],
  "Photo-First": ["FULL_COLOR", "GRAIN_OVERLAY", "CLEAN"],
  "Retro": ["GRAIN_OVERLAY", "DUOTONE", "BLACK_WHITE"],
};

// ── Industry-specific section recommendations ──────────────────────────────
export const INDUSTRY_SECTIONS: Record<string, string[]> = {
  "restaurant": ["Hero", "Menu", "Story", "Gallery", "Reservations", "Reviews", "Hours", "Contact"],
  "bar": ["Hero", "Drinks", "Atmosphere", "Events", "Reviews", "Contact"],
  "cafe": ["Hero", "Menu", "Story", "Gallery", "Reviews", "Hours", "Contact"],
  "bakery": ["Hero", "Specialties", "Gallery", "Story", "Reviews", "Hours", "Contact"],
  "salon": ["Hero", "Services", "Gallery", "Stylists", "Reviews", "Book", "Contact"],
  "barber": ["Hero", "Services", "Gallery", "Reviews", "Book", "Contact"],
  "spa": ["Hero", "Treatments", "Gallery", "Reviews", "Book", "Contact"],
  "tattoo": ["Hero", "Artists", "Gallery", "Process", "Reviews", "Book", "Contact"],
  "gym": ["Hero", "Classes", "Trainers", "Membership", "Reviews", "Contact"],
  "mechanic": ["Hero", "Services", "Process", "Reviews", "Contact"],
  "auto": ["Hero", "Services", "Process", "Reviews", "Contact"],
  "photographer": ["Hero", "Portfolio", "Services", "Reviews", "Contact"],
  "lawyer": ["Hero", "Practice Areas", "Results", "About", "Reviews", "Contact"],
  "accounting": ["Hero", "Services", "About", "Reviews", "Contact"],
  "dental": ["Hero", "Services", "Team", "Reviews", "Book", "Contact"],
  "medical": ["Hero", "Services", "Team", "Reviews", "Book", "Contact"],
  "boutique": ["Hero", "Collections", "Story", "Reviews", "Contact"],
  "default": ["Hero", "About", "Services", "Gallery", "Reviews", "Hours", "Contact"],
};

export function pickDesignTokens(archetype: string, existingFingerprints: string[]): {
  palette: typeof COLOR_PALETTES[0];
  typography: typeof TYPOGRAPHY_PAIRS[0];
  layout: string;
  microInteractions: string[];
  imageryTreatment: string;
  sectionOrder: string[];
  fingerprint: string;
} {
  const validPalettes = ARCHETYPE_PALETTE_MAP[archetype] || ARCHETYPE_PALETTE_MAP["Warm Local"];
  const validTypography = ARCHETYPE_TYPOGRAPHY_MAP[archetype] || ARCHETYPE_TYPOGRAPHY_MAP["Warm Local"];
  const validLayouts = ARCHETYPE_LAYOUT_MAP[archetype] || ARCHETYPE_LAYOUT_MAP["Warm Local"];
  const validInteractions = ARCHETYPE_INTERACTIONS_MAP[archetype] || ARCHETYPE_INTERACTIONS_MAP["Warm Local"];
  const validImagery = ARCHETYPE_IMAGERY_MAP[archetype] || ARCHETYPE_IMAGERY_MAP["Warm Local"];

  const baseSections = ["About", "Services", "Reviews", "Photos", "Hours", "Contact"];

  let attempts = 0;
  while (attempts < 20) {
    const paletteId = validPalettes[Math.floor(Math.random() * validPalettes.length)];
    const typographyId = validTypography[Math.floor(Math.random() * validTypography.length)];
    const layout = validLayouts[Math.floor(Math.random() * validLayouts.length)];
    
    // Shuffle sections
    const shuffled = [...baseSections].sort(() => Math.random() - 0.5);
    const sectionOrder = shuffled;
    
    const fingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}-${sectionOrder.join(",")}`;
    
    if (!existingFingerprints.includes(fingerprint)) {
      const palette = COLOR_PALETTES.find(p => p.id === paletteId)!;
      const typography = TYPOGRAPHY_PAIRS.find(t => t.id === typographyId)!;
      
      // Pick 2-3 micro-interactions
      const shuffledInteractions = [...validInteractions].sort(() => Math.random() - 0.5);
      const microInteractions = shuffledInteractions.slice(0, 2 + Math.floor(Math.random() * 2));
      
      // Pick imagery treatment
      const imageryTreatment = validImagery[Math.floor(Math.random() * validImagery.length)];
      
      return { palette, typography, layout, microInteractions, imageryTreatment, sectionOrder, fingerprint };
    }
    attempts++;
  }
  
  // Fallback: just return without uniqueness check
  const paletteId = validPalettes[0];
  const typographyId = validTypography[0];
  const layout = validLayouts[0];
  const sectionOrder = baseSections;
  const fingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}-${Date.now()}`;
  const palette = COLOR_PALETTES.find(p => p.id === paletteId)!;
  const typography = TYPOGRAPHY_PAIRS.find(t => t.id === typographyId)!;
  
  return {
    palette, typography, layout,
    microInteractions: validInteractions.slice(0, 2),
    imageryTreatment: validImagery[0],
    sectionOrder,
    fingerprint,
  };
}

// ── Get industry-specific sections based on category ──────────────────────
export function getIndustrySections(category: string): string[] {
  const cat = category.toLowerCase();
  for (const [key, sections] of Object.entries(INDUSTRY_SECTIONS)) {
    if (cat.includes(key)) return sections;
  }
  return INDUSTRY_SECTIONS["default"];
}
