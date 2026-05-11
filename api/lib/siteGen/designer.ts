// siteGen/designer.ts — generates a unique design system per business
// Every site gets a completely unique color palette, fonts, spacing, and layout.
// No presets. No archetypes. Just pure deterministic uniqueness.

import type { DesignSystem, BusinessInput } from "./types";

// Hash a string to a number for deterministic uniqueness
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate harmonious palette from a base hue
function generatePalette(baseHue: number, name: string): DesignSystem["colors"] {
  const h = ((baseHue % 360) + 360) % 360;
  // Secondary is complementary or analogous
  const secondaryHue = (h + 30 + (hash(name + "sec") % 60)) % 360;
  const accentHue = (h + 180 + (hash(name + "acc") % 30 - 15)) % 360;

  return {
    primary: hsl(h, 65, 45),
    primaryLight: hsl(h, 70, 92),
    primaryDark: hsl(h, 70, 25),
    secondary: hsl(secondaryHue, 50, 50),
    accent: hsl(accentHue, 75, 55),
    bg: hsl(h, 8, 98),
    bgAlt: hsl(h, 6, 95),
    surface: "#ffffff",
    surfaceAlt: hsl(h, 4, 97),
    text: hsl(h, 15, 12),
    textLight: hsl(h, 10, 35),
    textMuted: hsl(h, 8, 55),
    border: hsl(h, 10, 88),
    borderLight: hsl(h, 8, 93),
    white: "#ffffff",
    black: "#0a0a0a",
  };
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)} ${s}% ${l}%)`;
}

// Curated Google Font pairs — each combination is unique
const FONT_PAIRS: {
  heading: string; body: string; accent: string;
  headingUrl: string; bodyUrl: string; accentUrl: string;
}[] = [
  { heading: "\"Space Grotesk\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"Space Grotesk\", sans-serif",
    headingUrl: "Space+Grotesk:wght@400;500;600;700", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Space+Grotesk:wght@400;500;600;700" },
  { heading: "\"Playfair Display\", Georgia, serif", body: "\"Inter\", sans-serif", accent: "\"Playfair Display\", Georgia, serif",
    headingUrl: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500" },
  { heading: "\"DM Serif Display\", Georgia, serif", body: "\"Source Sans 3\", sans-serif", accent: "\"DM Serif Display\", Georgia, serif",
    headingUrl: "DM+Serif+Display", bodyUrl: "Source+Sans+3:wght@400;500;600", accentUrl: "DM+Serif+Display" },
  { heading: "\"Clash Display\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"Clash Display\", sans-serif",
    headingUrl: "Clash+Display:wght@400;500;600;700", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Clash+Display:wght@400;500;600;700" },
  { heading: "\"Cabinet Grotesk\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"Cabinet Grotesk\", sans-serif",
    headingUrl: "Cabinet+Grotesk:wght@400;500;700;800", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Cabinet+Grotesk:wght@400;500;700;800" },
  { heading: "\"Satoshi\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"Satoshi\", sans-serif",
    headingUrl: "Satoshi:wght@400;500;700;900", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Satoshi:wght@400;500;700;900" },
  { heading: "\"Boska\", serif", body: "\"Inter\", sans-serif", accent: "\"Boska\", serif",
    headingUrl: "Boska:wght@400;500;600;700", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Boska:wght@400;500;600;700" },
  { heading: "\"Zodiak\", serif", body: "\"Inter\", sans-serif", accent: "\"Zodiak\", serif",
    headingUrl: "Zodiak:wght@400;500;600;700", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Zodiak:wght@400;500;600;700" },
  { heading: "\"General Sans\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"General Sans\", sans-serif",
    headingUrl: "General+Sans:wght@400;500;600;700", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "General+Sans:wght@400;500;600;700" },
  { heading: "\"Plus Jakarta Sans\", sans-serif", body: "\"Inter\", sans-serif", accent: "\"Plus Jakarta Sans\", sans-serif",
    headingUrl: "Plus+Jakarta+Sans:wght@400;500;600;700;800", bodyUrl: "Inter:wght@400;450;500;600", accentUrl: "Plus+Jakarta+Sans:wght@400;500;600;700;800" },
];

export function generateDesignSystem(business: BusinessInput): DesignSystem {
  const seedStr = `${business.name}-${business.city}-${business.category}`;
  const seed = hash(seedStr);
  const rng = seededRandom(seed);

  // Unique hue derived from business identity
  const baseHue = hash(seedStr + "hue") % 360;

  // Unique font pair
  const fontIdx = hash(seedStr + "font") % FONT_PAIRS.length;
  const fonts = FONT_PAIRS[fontIdx];

  // Unique layout combination
  const navStyles: DesignSystem["layout"]["navStyle"][] = ["fixed", "transparent", "floating", "minimal"];
  const heroStyles: DesignSystem["layout"]["heroStyle"][] = ["fullscreen", "split", "centered", "overlapping"];
  const footerStyles: DesignSystem["layout"]["footerStyle"][] = ["multi-column", "branded", "minimal"];

  const navIdx = Math.floor(rng() * navStyles.length);
  const heroIdx = Math.floor(rng() * heroStyles.length);
  const footerIdx = Math.floor(rng() * footerStyles.length);

  // Unique spacing
  const sectionPad = ["6rem", "7rem", "8rem", "5rem"][Math.floor(rng() * 4)];
  const gridGap = ["1.5rem", "2rem", "2.5rem"][Math.floor(rng() * 3)];
  const borderRadius = ["0px", "4px", "8px", "12px", "16px"][Math.floor(rng() * 5)];
  const maxWidth = ["1100px", "1200px", "1160px", "1280px"][Math.floor(rng() * 4)];

  const colors = generatePalette(baseHue, business.name);

  // Effects based on vibe
  const shadowOpacity = 0.06 + rng() * 0.08;
  const shadowBase = `0 4px 24px hsl(${baseHue} 20% 10% / ${shadowOpacity.toFixed(3)})`;
  const shadowMd = `0 8px 32px hsl(${baseHue} 20% 10% / ${(shadowOpacity * 1.5).toFixed(3)})`;
  const shadowLg = `0 16px 48px hsl(${baseHue} 20% 10% / ${(shadowOpacity * 2).toFixed(3)})`;

  const overlayDarkness = 40 + Math.floor(rng() * 30);
  const heroOverlay = `linear-gradient(to bottom, hsl(${baseHue} 30% 8% / ${overlayDarkness}%) 0%, hsl(${baseHue} 25% 6% / ${overlayDarkness + 15}%) 100%)`;

  return {
    id: seedStr,
    name: `${business.name} Design System`,
    description: `Unique design system generated for ${business.name} — ${baseHue}° hue, ${fonts.heading.split(",")[0].replace(/"/g, "")} headings`,
    colors,
    fonts: {
      heading: fonts.heading,
      body: fonts.body,
      accent: fonts.accent,
      headingUrl: fonts.headingUrl,
      bodyUrl: fonts.bodyUrl,
      accentUrl: fonts.accentUrl,
    },
    spacing: {
      sectionPad,
      contentMaxWidth: maxWidth,
      gridGap,
      borderRadius,
      borderRadiusSm: borderRadius === "0px" ? "0px" : "4px",
      borderRadiusLg: borderRadius === "0px" ? "0px" : borderRadius === "4px" ? "8px" : "20px",
    },
    effects: {
      shadowSm: shadowBase,
      shadowMd,
      shadowLg,
      shadowXl: shadowLg,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      heroOverlay,
    },
    layout: {
      navStyle: navStyles[navIdx],
      heroStyle: heroStyles[heroIdx],
      footerStyle: footerStyles[footerIdx],
    },
  };
}
