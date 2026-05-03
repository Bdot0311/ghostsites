import { createClientFromRequest } from "npm:@base44/sdk";

const MINI_APP_URL = 'https://untitled-app-37d87fa3.base44.app';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 1000, model = 'claude-haiku-4-5'): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  return (await res.json()).content[0].text;
}

function parseJSON(text: string) {
  const greedy = text.match(/\{[\s\S]*\}/);
  if (greedy) { try { return JSON.parse(greedy[0]); } catch (_) {} }
  const blocks = [...text.matchAll(/\{[^{}]*\}/g)].reverse();
  for (const m of blocks) { try { return JSON.parse(m[0]); } catch (_) {} }
  throw new Error('No valid JSON in Claude response');
}

// Follow the Google Places photo redirect server-side to get the public
// lh3.googleusercontent.com CDN URL — works in any browser without an API key.
async function resolvePhotoUrl(placesUrl: string): Promise<string | null> {
  try {
    const url = placesUrl.replace(/maxWidthPx=\d+/, 'maxWidthPx=900');
    const resp = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(7000) });
    if (!resp.ok) return null;
    // After redirect, resp.url is the public CDN URL with no API key required
    const cdn = resp.url;
    return cdn.includes('googleusercontent') || cdn.includes('gstatic') ? cdn : null;
  } catch (_) { return null; }
}

// Detect websites that are low-quality / placeholder / social-only
const LOW_QUALITY_PATTERNS = [
  /facebook\.com/i, /instagram\.com/i, /yelp\.com/i, /google\.com\/maps/i,
  /wix\.com/i, /weebly\.com/i, /godaddy\.com\/(sites|websitebuilder)/i,
  /site123\.com/i, /jimdo\.com/i, /yola\.com/i, /webnode\.com/i,
  /vistaprint\.com/i, /yellowpages\.com/i, /angieslist\.com/i,
  /thumbtack\.com/i, /homeadvisor\.com/i, /nextdoor\.com/i,
  /squarespace\.com\/preview/i, /wordpress\.com\//i,
];
function isLowQualityWebsite(url: string): boolean {
  return LOW_QUALITY_PATTERNS.some(p => p.test(url));
}

// Scrape a business's existing website to extract email and owner name
async function enrichFromWebsite(websiteUrl: string): Promise<{ email?: string; owner_name?: string }> {
  try {
    const resp = await fetch(websiteUrl, {
      redirect: 'follow', signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhostSites/1.0; +https://ghostsites.io)' },
    });
    if (!resp.ok) return {};
    const html = await resp.text();
    const emailMatches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const email = emailMatches.find(e =>
      !e.match(/noreply|no-reply|example|test@|@sentry|\.png|\.jpg|\.gif|wix|wordpress/i)
    );
    const ownerMatch = html.match(
      /(?:owner|founder|proprietor|president|ceo|by)[:\s,]+([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i
    );
    return { email, owner_name: ownerMatch?.[1] };
  } catch (_) { return {}; }
}

// ── Design system ────────────────────────────────────────────────────────────

const COLOR_PALETTES: Record<number, { name: string; bg: string; text: string; accent: string; muted: string; surface: string }> = {
  1:  { name: "Cream Ink",        bg: "#FAF6ED", text: "#1A1A1A", accent: "#C04F2E", muted: "#6B6B6B", surface: "#F0E8D4" },
  2:  { name: "Sage Linen",       bg: "#F2F0E8", text: "#2C2E27", accent: "#5C7A4E", muted: "#7A7D70", surface: "#E6E3D6" },
  3:  { name: "Slate Blue",       bg: "#F0F4F8", text: "#1E2A3A", accent: "#3B6FBA", muted: "#6E7E90", surface: "#E3EAF2" },
  4:  { name: "Champagne Noir",   bg: "#F5EFE2", text: "#1C1C1C", accent: "#C4A573", muted: "#6E665A", surface: "#EDE4CE" },
  5:  { name: "Forest Fog",       bg: "#EDF2EE", text: "#1A2E1A", accent: "#4A7C59", muted: "#6B7D6B", surface: "#E0E9E2" },
  6:  { name: "Dusty Rose",       bg: "#F8F0F0", text: "#2C1A1A", accent: "#B05070", muted: "#8C6E6E", surface: "#F0E2E2" },
  7:  { name: "Navy Linen",       bg: "#F0F2F8", text: "#0F1F3D", accent: "#C4832D", muted: "#6E7A8C", surface: "#E3E6F0" },
  8:  { name: "Terracotta Cream", bg: "#F8F1E3", text: "#3A2C24", accent: "#C9663D", muted: "#8C7B6E", surface: "#EEE4D0" },
  9:  { name: "Concrete Acid",    bg: "#1A1A1A", text: "#FFFFFF", accent: "#D4FF00", muted: "#888888", surface: "#252525" },
  10: { name: "Pure Brutalist",   bg: "#FFFFFF", text: "#000000", accent: "#FF3D00", muted: "#444444", surface: "#F2F2F2" },
  11: { name: "Steel Yellow",     bg: "#2C2C2C", text: "#FAFAFA", accent: "#FFD600", muted: "#999999", surface: "#383838" },
  12: { name: "Ink & Copper",     bg: "#1C1A18", text: "#F5F0E8", accent: "#C87941", muted: "#8A7D6E", surface: "#2A2724" },
  13: { name: "Old Paper",        bg: "#EDE0C4", text: "#2A1F0E", accent: "#8B3A1A", muted: "#7A6A52", surface: "#E2D4B4" },
  14: { name: "Chalk & Cobalt",   bg: "#F4F7FF", text: "#0A1A3A", accent: "#1A4FCC", muted: "#5E6E8C", surface: "#E8EEFF" },
  15: { name: "Olive & Cream",    bg: "#F5F2E4", text: "#2A2A1A", accent: "#7A8C3A", muted: "#7A7A5A", surface: "#EAE6D4" },
  16: { name: "Espresso",         bg: "#1E1410", text: "#F5EFE0", accent: "#D4884A", muted: "#8A7060", surface: "#2A1E18" },
  17: { name: "Diner Red",        bg: "#F8E9D6", text: "#1D3557", accent: "#E63946", muted: "#6E7A82", surface: "#F0DCC0" },
  18: { name: "70s Mustard",      bg: "#F2E4C9", text: "#2B1810", accent: "#8B4A0A", muted: "#8C6E4E", surface: "#E8D8B4" },
  19: { name: "Bubblegum",        bg: "#FFF0F5", text: "#2A0A1A", accent: "#E0407A", muted: "#8C6070", surface: "#FFE2EE" },
  20: { name: "Mint Condition",   bg: "#F0FAF5", text: "#0A2A1A", accent: "#2A8A5A", muted: "#5A8A6A", surface: "#E0F4EA" },
  21: { name: "Matte Black",      bg: "#111111", text: "#EEEEEE", accent: "#FFFFFF", muted: "#777777", surface: "#1E1E1E" },
  22: { name: "Desert Sand",      bg: "#F5E8D0", text: "#2A1A0A", accent: "#C87A3A", muted: "#8A7050", surface: "#EAD8BA" },
  23: { name: "Lilac Noir",       bg: "#1A1228", text: "#F0ECF8", accent: "#B08AE0", muted: "#8A7AA0", surface: "#241A38" },
  24: { name: "Rust & Stone",     bg: "#F2ECE4", text: "#2A1A12", accent: "#B04A20", muted: "#8A7060", surface: "#E6DDD2" },
  25: { name: "Mesh Indigo",      bg: "#1E1B4B", text: "#F1F5F9", accent: "#C7D2FE", muted: "#94A3B8", surface: "#282462" },
  34: { name: "Brick Bakery",     bg: "#F8F1E3", text: "#2C1810", accent: "#C2461F", muted: "#8C6E5C", surface: "#EEE4D0" },
  35: { name: "Garden Green",     bg: "#F8F1E3", text: "#2A3D24", accent: "#5A8A3A", muted: "#7A7B65", surface: "#EEE4D0" },
  39: { name: "Times Serif",      bg: "#FAFAFA", text: "#1A1A1A", accent: "#B91C1C", muted: "#6E6E6E", surface: "#F0F0F0" },
};

const TYPOGRAPHY_PAIRS: Record<number, { name: string; heading: string; body: string; gfonts: string }> = {
  1:  { name: "Fraunces + Inter",          heading: "Fraunces",          body: "Inter",           gfonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  2:  { name: "Playfair + Manrope",        heading: "Playfair Display",  body: "Manrope",         gfonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  3:  { name: "Libre Baskerville + Lato",  heading: "Libre Baskerville", body: "Lato",            gfonts: "Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700" },
  4:  { name: "Oswald + Source Sans",      heading: "Oswald",            body: "Source Sans 3",   gfonts: "Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600" },
  5:  { name: "Bebas + Open Sans",         heading: "Bebas Neue",        body: "Open Sans",       gfonts: "Bebas+Neue&family=Open+Sans:wght@300;400;600" },
  6:  { name: "Montserrat + Merriweather", heading: "Montserrat",        body: "Merriweather",    gfonts: "Montserrat:wght@400;600;700;800&family=Merriweather:ital,wght@0,300;0,400;1,300" },
  7:  { name: "Raleway + Merriweather",    heading: "Raleway",           body: "Merriweather",    gfonts: "Raleway:wght@300;400;600;700&family=Merriweather:ital,wght@0,300;0,400;1,300" },
  8:  { name: "Anton + Roboto",            heading: "Anton",             body: "Roboto",          gfonts: "Anton&family=Roboto:wght@300;400;500" },
  9:  { name: "Space Grotesk + DM Sans",   heading: "Space Grotesk",     body: "DM Sans",         gfonts: "Space+Grotesk:wght@300..700&family=DM+Sans:wght@300;400;500;600" },
  10: { name: "Archivo Black + Inter",     heading: "Archivo Black",     body: "Inter",           gfonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  11: { name: "Black Han + Nunito",        heading: "Black Han Sans",    body: "Nunito",          gfonts: "Black+Han+Sans&family=Nunito:wght@300;400;600" },
  12: { name: "Ultra + Crimson",           heading: "Ultra",             body: "Crimson Text",    gfonts: "Ultra&family=Crimson+Text:ital,wght@0,400;0,600;1,400" },
  13: { name: "Barlow Condensed + Karla",  heading: "Barlow Condensed",  body: "Karla",           gfonts: "Barlow+Condensed:wght@400;600;700;800&family=Karla:wght@300;400;500" },
  14: { name: "DM Serif + Work Sans",      heading: "DM Serif Display",  body: "Work Sans",       gfonts: "DM+Serif+Display:ital@0;1&family=Work+Sans:wght@300;400;500;600" },
  18: { name: "Fraunces + Inter Warm",     heading: "Fraunces",          body: "Inter",           gfonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  20: { name: "Abril + Raleway",           heading: "Abril Fatface",     body: "Raleway",         gfonts: "Abril+Fatface&family=Raleway:wght@300;400;600" },
};

const ARCHETYPE_PALETTE_MAP: Record<string, number[]> = {
  "Editorial":    [1, 3, 7, 39, 14],
  "Soft Luxury":  [2, 4, 6, 19, 20],
  "Brutalist":    [9, 10, 11, 21],
  "Modern Tech":  [25, 9, 14, 3],
  "Warm Local":   [8, 17, 34, 35, 22, 15],
  "Bold Minimal": [10, 39, 1, 21, 12],
  "Photo-First":  [39, 1, 2, 3, 7],
  "Retro":        [17, 18, 13, 22, 16],
  "Classic":      [7, 3, 39, 14],
  "Rustic":       [8, 22, 24, 16, 13],
};
const ARCHETYPE_TYPOGRAPHY_MAP: Record<string, number[]> = {
  "Editorial":    [1, 2, 3, 7, 14],
  "Soft Luxury":  [1, 2, 7, 12, 14, 20],
  "Brutalist":    [9, 10, 5, 8, 13],
  "Modern Tech":  [9, 10, 13, 4],
  "Warm Local":   [18, 20, 1, 3, 7, 6],
  "Bold Minimal": [10, 9, 4, 5, 8],
  "Photo-First":  [1, 2, 7, 14, 3],
  "Retro":        [20, 18, 11, 12, 4, 6],
  "Classic":      [3, 7, 1, 14, 2],
  "Rustic":       [18, 12, 3, 6, 7],
};
const ARCHETYPE_LAYOUT_MAP: Record<string, string[]> = {
  "Editorial":    ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
  "Soft Luxury":  ["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Brutalist":    ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
  "Modern Tech":  ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local":   ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Bold Minimal": ["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Photo-First":  ["FULL_BLEED_HERO", "MAGAZINE_GRID", "SPLIT_HERO"],
  "Retro":        ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
  "Classic":      ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Rustic":       ["FULL_BLEED_HERO", "SCROLL_FLOW", "ASYMMETRIC_STACK"],
};

const ARCHETYPE_HINTS: Record<string, string> = {
  "Editorial":    "cultured, ink-and-paper, editorial flair",
  "Soft Luxury":  "refined elegance, effortless quality, understated",
  "Brutalist":    "raw confidence, bold, unapologetic directness",
  "Warm Local":   "neighborhood warmth, community pride, genuine",
  "Bold Minimal": "striking simplicity, confident restraint",
  "Photo-First":  "imagery-led, visual storytelling",
  "Retro":        "nostalgic warmth, handcrafted energy, timeless",
  "Classic":      "trusted authority, timeless professionalism",
  "Rustic":       "artisan soul, honest craft, earthy authenticity",
  "Modern Tech":  "clean precision, forward-thinking, modern",
};

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function stars(n: number): string { return '★'.repeat(Math.min(5, Math.max(1, Math.round(n || 5)))); }

function hexToRgb(hex: string): string {
  const m = hex.replace('#', '').match(/.{2}/g) || ['0', '0', '0'];
  return m.slice(0, 3).map(x => parseInt(x, 16)).join(',');
}

// ── Server-side HTML builder ──────────────────────────────────────────────────
// Claude writes COPY ONLY (small JSON). This function builds the complete HTML.

// deno-lint-ignore no-explicit-any
function buildHtml(
  business: any,
  copy: { headline: string; tagline: string; about_1: string; about_2: string; services: { name: string; desc: string; price?: string; icon?: string }[] },
  pal: { name: string; bg: string; text: string; accent: string; muted: string; surface: string },
  typo: { name: string; heading: string; body: string; gfonts: string },
  photos: string[]
): string {
  const heroPhoto = photos[0] || '';
  const aboutPhoto = photos[1] || '';
  const galleryPhotos = photos.slice(2);

  const heroBg = heroPhoto
    ? `background: linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.70) 100%), url('${heroPhoto}') center/cover no-repeat;`
    : `background: linear-gradient(145deg, ${pal.accent} 0%, ${pal.bg} 60%, ${pal.surface} 100%);`;

  const heroColor    = heroPhoto ? '#fff' : pal.text;
  const heroSubColor = heroPhoto ? 'rgba(255,255,255,0.86)' : pal.muted;
  const badgeBg      = heroPhoto ? 'rgba(255,255,255,0.14)' : pal.surface;
  const badgeBorder  = heroPhoto ? 'rgba(255,255,255,0.28)' : pal.accent + '55';
  const badgeColor   = heroPhoto ? '#fff' : pal.text;
  const bgRgb        = hexToRgb(pal.bg);
  const isDark       = parseInt(pal.bg.replace('#','').slice(0,2), 16) < 80;
  const revBg        = isDark ? pal.surface : '#0f0f0f';
  const revText      = isDark ? pal.text    : '#ffffff';
  const revSubRgb    = revText === '#ffffff' ? '255,255,255' : '0,0,0';

  const phone    = (business.phone as string) || '';
  const phoneTel = phone.replace(/\D/g, '');
  const rating   = business.rating || 5;
  const revCount = business.review_count || 0;

  const serviceCards = (copy.services || []).slice(0, 6).map(s => `
      <div class="svc-card">
        <div class="svc-icon">${s.icon || '✦'}</div>
        <h3 class="svc-name">${s.name}</h3>
        <p class="svc-desc">${s.desc}</p>
        ${s.price ? `<div class="svc-price">${s.price}</div>` : ''}
      </div>`).join('');

  const reviewCards = ((business.top_reviews || []) as { text: string; author: string; rating: number }[])
    .slice(0, 3).map(r => `
      <div class="rev-card">
        <div class="rev-stars">${stars(r.rating)}</div>
        <blockquote>"${(r.text || '').slice(0, 220)}"</blockquote>
        <cite>— ${r.author}</cite>
      </div>`).join('') || `
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <blockquote>"Fantastic service — couldn't recommend them more highly."</blockquote>
        <cite>— Happy Customer</cite>
      </div>`;

  const hoursRaw   = (business.hours as string) || '';
  const hoursLines = hoursRaw.split(/,(?=[A-Z])/).map((h: string) => h.trim()).filter(Boolean);
  const hoursHtml  = hoursLines.length > 0
    ? hoursLines.map((h: string) => {
        const idx = h.search(/:\s/);
        if (idx > 0) {
          const day = h.slice(0, idx);
          const time = h.slice(idx + 2);
          return `<li><span>${day}</span><span>${time}</span></li>`;
        }
        return `<li><span colspan="2">${h}</span></li>`;
      }).join('\n          ')
    : '<li><span>Hours</span><span>Call for info</span></li>';

  const aboutPhotoHtml = aboutPhoto
    ? `<div class="about-img"><img src="${aboutPhoto}" alt="${business.name}" loading="lazy"></div>`
    : '';

  const galleryHtml = galleryPhotos.length > 0 ? `
  <section class="gallery-sec">
    <div class="wrap">
      <h2>Our Work</h2>
      <div class="gal-grid">
        ${galleryPhotos.map(u => `<div class="gal-item"><img src="${u}" alt="${business.name}" loading="lazy"></div>`).join('\n        ')}
      </div>
    </div>
  </section>` : '';

  // Use “ / ” as unicode escapes so no raw quote chars in the template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${business.name} | ${business.city}</title>
  <meta name="description" content="${business.category} in ${business.city}${business.state ? ', ' + business.state : ''}. ${copy.tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${typo.gfonts}&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.bg};color:${pal.text};line-height:1.75;font-size:1.0625rem;-webkit-font-smoothing:antialiased}
    a{color:inherit;text-decoration:none}
    img{display:block;max-width:100%;height:auto}
    h1,h2,h3{font-family:'${typo.heading}',Georgia,serif;line-height:1.1}
    .wrap{max-width:1200px;margin:0 auto;padding:0 2rem}
    section{padding:6rem 0}

    /* NAV */
    .nav{position:sticky;top:0;z-index:200;background:rgba(${bgRgb},0.93);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(0,0,0,0.08);padding:1.1rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
    .nav-brand{font-family:'${typo.heading}',serif;font-size:1.2rem;font-weight:700}
    .nav-phone{font-size:.95rem;font-weight:700;color:${pal.accent};padding:.5rem 1.25rem;border:2px solid ${pal.accent};border-radius:50px;transition:background .2s,color .2s;white-space:nowrap}
    .nav-phone:hover{background:${pal.accent};color:#fff}

    /* HERO */
    .hero{min-height:100vh;${heroBg}display:flex;flex-direction:column;justify-content:flex-end;padding:0 0 5rem}
    .hero-inner{max-width:1200px;margin:0 auto;padding:0 2rem;width:100%}
    .hero-badge{display:inline-flex;align-items:center;gap:.4rem;background:${badgeBg};border:1px solid ${badgeBorder};color:${badgeColor};font-size:.82rem;font-weight:600;padding:.4rem 1rem;border-radius:50px;margin-bottom:1.5rem;backdrop-filter:blur(8px)}
    .hero h1{font-size:clamp(3rem,8.5vw,7rem);font-weight:900;line-height:1.0;letter-spacing:-.03em;color:${heroColor};max-width:16ch;margin-bottom:1.25rem;${heroPhoto ? 'text-shadow:0 2px 24px rgba(0,0,0,.45)' : ''}}
    .hero-sub{font-size:clamp(1.05rem,2vw,1.3rem);color:${heroSubColor};max-width:50ch;margin-bottom:2.25rem;line-height:1.6}
    .hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
    .btn-primary{display:inline-flex;align-items:center;gap:.5rem;background:${pal.accent};color:#fff;font-size:1.05rem;font-weight:700;padding:.9rem 2rem;border-radius:50px;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 20px rgba(0,0,0,.28)}
    .btn-primary:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,.38)}
    .btn-ghost{display:inline-flex;align-items:center;gap:.35rem;color:${heroPhoto ? '#fff' : pal.text};font-size:.95rem;font-weight:600;border-bottom:2px solid ${heroPhoto ? 'rgba(255,255,255,.45)' : pal.accent};padding-bottom:.1rem;transition:border-color .2s}
    .btn-ghost:hover{border-color:${heroPhoto ? '#fff' : pal.text}}

    /* ABOUT */
    .about-sec{background:${pal.surface}}
    .about-grid{display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center${!aboutPhoto ? ';max-width:780px' : ''}}
    .about-sec h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:1.4rem}
    .about-sec p{color:${pal.muted};margin-bottom:1rem;font-size:1.0625rem}
    .about-stats{display:flex;gap:2.5rem;margin-top:2rem;padding-top:2rem;border-top:1px solid rgba(0,0,0,.08);flex-wrap:wrap}
    .stat .num{font-family:'${typo.heading}',serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1}
    .stat .lbl{font-size:.75rem;color:${pal.muted};margin-top:.25rem;text-transform:uppercase;letter-spacing:.07em}
    .about-img img{width:100%;height:420px;object-fit:cover;border-radius:14px;box-shadow:0 16px 64px rgba(0,0,0,.18)}

    /* SERVICES */
    .svc-sec h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:.75rem}
    .svc-intro{color:${pal.muted};margin-bottom:3rem;max-width:54ch;font-size:1.05rem}
    .svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .svc-card{background:${pal.surface};border-radius:12px;padding:2rem;border-left:4px solid ${pal.accent};box-shadow:0 2px 16px rgba(0,0,0,.07);transition:transform .25s ease,box-shadow .25s ease}
    .svc-card:hover{transform:translateY(-6px);box-shadow:0 16px 48px rgba(0,0,0,.14)}
    .svc-icon{font-size:1.8rem;margin-bottom:1rem}
    .svc-name{font-family:'${typo.heading}',serif;font-size:1.15rem;font-weight:700;margin-bottom:.5rem}
    .svc-desc{color:${pal.muted};font-size:.9375rem;line-height:1.65}
    .svc-price{margin-top:.9rem;font-weight:700;color:${pal.accent};font-size:.875rem}

    /* GALLERY */
    .gallery-sec{background:${pal.surface}}
    .gallery-sec h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:2rem}
    .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
    .gal-item{overflow:hidden;border-radius:10px;aspect-ratio:4/3}
    .gal-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
    .gal-item:hover img{transform:scale(1.06)}

    /* REVIEWS */
    .rev-sec{background:${revBg}}
    .rev-sec h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:.5rem;color:${revText}}
    .rev-sub{color:rgba(${revSubRgb},.42);margin-bottom:3rem;font-size:1rem}
    .rev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
    .rev-card{background:rgba(${revSubRgb},.07);border:1px solid rgba(${revSubRgb},.11);border-radius:12px;padding:2rem;position:relative;transition:background .2s}
    .rev-card:hover{background:rgba(${revSubRgb},.12)}
    .rev-stars{color:${pal.accent};font-size:1.05rem;letter-spacing:.05em;margin-bottom:1.2rem}
    .rev-card blockquote{color:rgba(${revSubRgb},.82);font-style:italic;line-height:1.7;font-size:1rem;margin-bottom:1.2rem;padding-left:.5rem}
    .rev-card blockquote::before{content:'“';font-size:5rem;color:${pal.accent};opacity:.22;position:absolute;top:.4rem;left:1.1rem;font-family:Georgia,serif;line-height:1;pointer-events:none}
    .rev-card cite{color:${pal.accent};font-weight:600;font-style:normal;font-size:.875rem}

    /* CONTACT */
    .contact-sec h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:3rem}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
    .hours-label{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${pal.muted};margin-bottom:1rem}
    .hours-list{list-style:none}
    .hours-list li{display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;border-bottom:1px solid rgba(0,0,0,.07);font-size:.9375rem;gap:1rem}
    .hours-list li span:first-child{color:${pal.muted}}
    .hours-list li span:last-child{font-weight:600;text-align:right}
    .cinfo{display:flex;flex-direction:column;gap:1.5rem}
    .cinfo-item strong{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:${pal.muted};margin-bottom:.3rem}
    .cinfo-item span{font-size:1.0625rem;font-weight:500}
    .cta-call{display:inline-flex;align-items:center;gap:.6rem;background:${pal.accent};color:#fff;font-size:1.15rem;font-weight:800;padding:1rem 2.5rem;border-radius:50px;box-shadow:0 4px 24px rgba(0,0,0,.22);transition:transform .2s,box-shadow .2s;margin-top:2rem}
    .cta-call:hover{transform:translateY(-3px);box-shadow:0 10px 40px rgba(0,0,0,.32)}

    /* FOOTER */
    footer{background:#0d0d0d;color:rgba(255,255,255,.38);padding:3rem 2rem}
    .foot-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:2rem;flex-wrap:wrap}
    .foot-brand{font-family:'${typo.heading}',serif;font-size:1.05rem;font-weight:700;color:rgba(255,255,255,.75)}
    .foot-note{font-size:.75rem}

    @media(max-width:768px){
      section{padding:4rem 0}
      .hero h1{font-size:clamp(2.5rem,11vw,4rem)}
      .about-grid,.contact-grid{grid-template-columns:1fr}
      .about-stats{gap:1.5rem}
      .nav{padding:.9rem 1.25rem}
    }
  </style>
</head>
<body>

<nav class="nav">
  <span class="nav-brand">${business.name}</span>
  <a href="tel:${phoneTel}" class="nav-phone">📞 ${phone || 'Call Us'}</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">⭐ ${rating} · ${revCount} Google Reviews</div>
    <h1>${copy.headline}</h1>
    <p class="hero-sub">${copy.tagline}</p>
    <div class="hero-ctas">
      <a href="tel:${phoneTel}" class="btn-primary">📞 Call ${phone || 'Now'}</a>
      <a href="#services" class="btn-ghost">See our work →</a>
    </div>
  </div>
</section>

<section class="about-sec">
  <div class="wrap">
    <div class="about-grid">
      <div>
        <h2>${business.name}</h2>
        <p>${copy.about_1}</p>
        <p>${copy.about_2}</p>
        <div class="about-stats">
          <div class="stat"><div class="num">${rating}★</div><div class="lbl">Google Rating</div></div>
          <div class="stat"><div class="num">${revCount}+</div><div class="lbl">Reviews</div></div>
          <div class="stat"><div class="num">${business.city}</div><div class="lbl">Location</div></div>
        </div>
      </div>
      ${aboutPhotoHtml}
    </div>
  </div>
</section>

<section class="svc-sec" id="services">
  <div class="wrap">
    <h2>What We Offer</h2>
    <p class="svc-intro">Services from ${business.name} — ${business.city}${business.state ? ', ' + business.state : ''}.</p>
    <div class="svc-grid">
      ${serviceCards}
    </div>
  </div>
</section>

${galleryHtml}

<section class="rev-sec">
  <div class="wrap">
    <h2>What Customers Say</h2>
    <p class="rev-sub">Real words from real people</p>
    <div class="rev-grid">
      ${reviewCards}
    </div>
  </div>
</section>

<section class="contact-sec">
  <div class="wrap">
    <h2>Find Us</h2>
    <div class="contact-grid">
      <div>
        <p class="hours-label">Hours</p>
        <ul class="hours-list">
          ${hoursHtml}
        </ul>
      </div>
      <div class="cinfo">
        ${business.address ? `<div class="cinfo-item"><strong>Address</strong><span>${business.address}</span></div>` : ''}
        <div class="cinfo-item"><strong>Phone</strong><span>${phone || 'Call for info'}</span></div>
        ${business.email ? `<div class="cinfo-item"><strong>Email</strong><span>${business.email}</span></div>` : ''}
        <a href="tel:${phoneTel}" class="cta-call">Call Now →</a>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="foot-inner">
    <span class="foot-brand">${business.name}</span>
    <span class="foot-note">Built as a free preview — not affiliated with ${business.name}</span>
  </div>
</footer>

</body>
</html>`;
}

// ── analyzePersonality ───────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function analyzePersonality(business: any, apiKey: string, db: any) {
  const reviewsText = (business.top_reviews || []).slice(0, 5)
    .map((r: { author: string; text: string; rating: number }, i: number) =>
      `[${i+1}] ${r.author} (${r.rating}/5): "${r.text.slice(0, 120)}"`).join('\n');

  const system = `You are a brand strategist for LOCAL SERVICE BUSINESSES. Output JSON only. No explanation.

Pick ONE archetype from this list based on the business vibe in the reviews:
- Barbers/men's grooming → Retro OR Classic OR Bold Minimal
- Salons/nail/lash/beauty → Soft Luxury OR Retro OR Editorial
- Tattoo studios → Brutalist OR Editorial
- Spas/massage → Soft Luxury OR Editorial
- Cafes/bakeries/coffee → Warm Local OR Rustic OR Retro
- Diners/family restaurants → Warm Local OR Retro
- Upscale restaurants/bars → Editorial OR Classic OR Photo-First
- Gyms/boxing/fitness → Bold Minimal OR Brutalist
- Auto/mechanics → Rustic OR Retro OR Bold Minimal
- Accounting/law/medical → Classic OR Editorial
- Landscaping/trades → Warm Local OR Rustic
- Photographers/galleries → Photo-First OR Editorial
- Breweries/wine → Editorial OR Retro OR Classic
- Boutiques/clothing → Soft Luxury OR Photo-First

JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Classic","tone_of_voice":"one owner-voice sentence referencing the city","key_differentiator":"the one specific thing customers keep praising","best_review_quote":{"text":"verbatim quote","author":"Name L."},"avoid":["x","y"]}`;

  const user = `${business.name} | ${business.category} | ${business.city}${business.state ? ', ' + business.state : ''}
Rating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)
Reviews:\n${reviewsText || 'None'}`;

  const profile = parseJSON(await callClaude(apiKey, system, user, 600, 'claude-haiku-4-5'));
  await db.Business.update(business.id, { personality_profile: profile });
  return profile;
}

// ── generateSite ─────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function generateSite(business: any, profile: any, apiKey: string, db: any) {
  const existingSites = await db.GeneratedSite.list();
  const usedFPs = new Set(
    (existingSites as { design_fingerprint: string }[]).map(s => s.design_fingerprint).filter(Boolean)
  );

  const rawArchetype = (profile.design_archetype || 'Warm Local').trim();
  const archetype = rawArchetype.split(/\s+/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const validPalettes  = ARCHETYPE_PALETTE_MAP[archetype]  || ARCHETYPE_PALETTE_MAP['Warm Local'];
  const validTypo      = ARCHETYPE_TYPOGRAPHY_MAP[archetype]|| ARCHETYPE_TYPOGRAPHY_MAP['Warm Local'];
  const validLayouts   = ARCHETYPE_LAYOUT_MAP[archetype]   || ARCHETYPE_LAYOUT_MAP['Warm Local'];

  let paletteId = validPalettes[0], typoId = validTypo[0], layout = validLayouts[0];
  let fingerprint = `${archetype}-${paletteId}-${typoId}-${layout}`;
  let found = false;

  outer: for (const p of shuffle(validPalettes)) {
    for (const t of shuffle(validTypo)) {
      for (const l of shuffle(validLayouts)) {
        const fp = `${archetype}-${p}-${t}-${l}`;
        if (!usedFPs.has(fp)) { paletteId = p; typoId = t; layout = l; fingerprint = fp; found = true; break outer; }
      }
    }
  }
  if (!found) {
    paletteId = pickRandom(validPalettes); typoId = pickRandom(validTypo); layout = pickRandom(validLayouts);
    fingerprint = `${archetype}-${paletteId}-${typoId}-${layout}-${Date.now()}`;
  }

  const pal  = COLOR_PALETTES[paletteId]  || COLOR_PALETTES[8];
  const typo = TYPOGRAPHY_PAIRS[typoId]   || TYPOGRAPHY_PAIRS[1];

  // Resolve Google Places photo URLs to public CDN URLs (server-side, no CORS)
  const resolvedPhotos: string[] = [];
  for (const url of (business.photos || []).slice(0, 4)) {
    const cdn = await resolvePhotoUrl(url as string);
    if (cdn) resolvedPhotos.push(cdn);
  }

  // Ask Claude ONLY for copy (small Haiku call, ~2k tokens max)
  const reviewSnippets = ((business.top_reviews || []) as { text: string; author: string; rating: number }[])
    .slice(0, 3).map(r => `"${r.text.slice(0, 120)}" — ${r.author}`).join(' | ');

  const copyJson = await callClaude(apiKey, 'Output valid JSON only. No explanation. No markdown.', `
Write website copy for this local business.
Name: ${business.name}
Type: ${business.category}
City: ${business.city}${business.state ? ', ' + business.state : ''}
Archetype: ${archetype} (${ARCHETYPE_HINTS[archetype] || 'authentic'})
Owner voice: ${profile.tone_of_voice || ''}
Unique value: ${profile.key_differentiator || ''}
Keywords: ${(profile.personality_keywords || []).join(', ')}
Avoid: ${(profile.avoid || []).join(', ')}
Customer reviews: ${reviewSnippets || '(none)'}

Return JSON:
{
  "headline": "4-8 word hero headline capturing this shop's unique soul — NOT generic, references city or personality",
  "tagline": "one sentence, owner voice, mentions the city or neighborhood",
  "about_1": "2-3 sentences, owner voice, warm, mentions city/neighborhood",
  "about_2": "2-3 sentences, references something specific a customer praised",
  "services": [
    {"name":"service name","desc":"1-2 sentence description","price":"$XX–$XX","icon":"emoji"},
    {"name":"service name","desc":"1-2 sentence description","price":"$XX–$XX","icon":"emoji"},
    {"name":"service name","desc":"1-2 sentence description","price":"$XX–$XX","icon":"emoji"},
    {"name":"service name","desc":"1-2 sentence description","price":"$XX–$XX","icon":"emoji"},
    {"name":"service name","desc":"1-2 sentence description","price":"$XX–$XX","icon":"emoji"}
  ]
}`, 2000, 'claude-haiku-4-5');

  const copy = parseJSON(copyJson);

  // Build full HTML server-side — no Claude needed for structure/CSS
  const html = buildHtml(business, copy, pal, typo, resolvedPhotos);

  const site = await db.GeneratedSite.create({
    business_id: business.id, full_html: html, subdomain_url: '',
    design_archetype: archetype, color_palette_id: paletteId, typography_pair_id: typoId,
    layout_variant: layout, section_order: ['About','Services','Reviews','Hours','Contact'],
    micro_interactions: [], imagery_treatment: resolvedPhotos.length > 0 ? 'PHOTO' : 'CLEAN',
    design_fingerprint: fingerprint,
    hero_copy: copy.headline || '', about_copy: '', services_copy: '', cta_copy: '',
    generated_at: new Date().toISOString(), view_count: 0,
  });

  const previewUrl = `${MINI_APP_URL}/SitePreview?id=${site.id}`;
  await db.GeneratedSite.update(site.id, { subdomain_url: previewUrl });
  await db.Business.update(business.id, { status: 'site_generated' });
  return { site_id: site.id, subdomain_url: previewUrl, archetype, palette: pal.name, typography: typo.name, layout };
}

// ── writeEmail ───────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function writeEmail(business: any, profile: any, site: Record<string, unknown>, apiKey: string, db: any) {
  const ownerName   = (business.owner_name as string) || 'there';
  const hasWebsite  = !!(business.current_website_url);
  const websiteNote = hasWebsite
    ? `They currently have a low-quality website at ${business.current_website_url} that looks outdated and isn't helping them get customers.`
    : `They have NO website, so people searching for "${business.category}" in ${business.city} can't find them online.`;
  const bestQuote   = (profile.best_review_quote || {}) as { text?: string; author?: string };

  const email = parseJSON(await callClaude(apiKey, 'Output JSON only: {"subject":"...","body":"..."}', `
Write a 4-point cold outreach email from a web designer to a local business owner.
The email must feel personal, specific, and low-pressure — not a mass blast.

Business: ${business.name} (${business.category} in ${business.city})
Owner: ${ownerName}
Web presence: ${websiteNote}
Best customer review: "${bestQuote.text || ''}" — ${bestQuote.author || ''}
Mockup URL: ${site.subdomain_url}

4-point structure (80-95 words total in body — SHORT):
1. OPENER — one specific sentence about ${business.name} that shows you actually looked them up. Reference their reviews, their specialty, their reputation in ${business.city}. NOT generic.
2. PAIN — one sentence: what ${hasWebsite ? 'their outdated site' : 'having no web presence'} is costing them right now. Make it feel real.
3. SOLUTION — "I put together a free mockup of what your site could look like:" then on its own line: ${site.subdomain_url}
4. CTA — one casual sentence inviting a 15-minute call. No pressure. No exclamation marks.

Sign off: — Alex

Subject line: ≤6 words, lowercase, specific to ${business.name} — not generic`, 600, 'claude-haiku-4-5'));

  const campaign = await db.EmailCampaign.create({
    business_id: business.id, site_id: site.site_id,
    subject: email.subject,
    body: `${email.body}\n\n---\nTo opt out, reply "unsubscribe".`,
    status: 'draft', send_attempts: 0,
    created_at: new Date().toISOString(),
  });
  return { campaign_id: campaign.id, subject: email.subject };
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const { city, category, business_id } = body;
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // ── Single business mode ──────────────────────────────────────────────────
    if (business_id) {
      const business = await db.Business.get(business_id);
      if (!business) return Response.json({ error: 'Business not found' }, { status: 404 });
      const profile = await analyzePersonality(business, apiKey, db);
      const site    = await generateSite(business, profile, apiKey, db);
      const email   = await writeEmail(business, profile, site, apiKey, db);
      return Response.json({ success: true, business_id, site, email });
    }

    // ── Campaign mode ─────────────────────────────────────────────────────────
    if (!city || !category) return Response.json({ error: 'Provide city + category or business_id' }, { status: 400 });
    const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!KEY) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });

    const campaign = await db.Campaign.create({
      query: `${category} in ${city}`, city, category,
      status: 'scraping', businesses_found: 0, sites_generated: 0, emails_sent: 0,
    });

    // Scrape Google Places
    const allPlaces: Record<string, unknown>[] = [];
    let nextToken: string | undefined;
    let pg = 0;
    do {
      const payload: Record<string, unknown> = { textQuery: `${category} in ${city}`, maxResultCount: 20 };
      if (nextToken) payload.pageToken = nextToken;
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.businessStatus,nextPageToken',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.text();
        await db.Campaign.update(campaign.id, { status: 'error', error_message: `Places API: ${e}` });
        return Response.json({ error: `Places API error: ${e}` }, { status: 500 });
      }
      const d = await r.json();
      if (d.places) allPlaces.push(...d.places);
      nextToken = d.nextPageToken;
      pg++;
      if (nextToken) await new Promise(res => setTimeout(res, 1500));
    } while (nextToken && pg < 3);

    // Filter: include businesses with NO website OR with a low-quality website
    const queue: Record<string, unknown>[] = [];
    for (const pl of allPlaces) {
      if (pl.businessStatus === 'PERMANENTLY_CLOSED') continue;

      const websiteUri = pl.websiteUri as string | undefined;
      const hasWebsite = !!websiteUri;
      const websiteIsLowQuality = hasWebsite && isLowQualityWebsite(websiteUri!);
      // Skip if they have a real website
      if (hasWebsite && !websiteIsLowQuality) continue;

      const websiteQuality = !hasWebsite ? 'none' : 'low_quality';

      let reviews: { author: string; text: string; rating: number }[] = [];
      try {
        const dr = await fetch(`https://places.googleapis.com/v1/places/${pl.id}`, {
          headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'reviews' },
        });
        if (dr.ok) {
          const dd = await dr.json();
          reviews = (dd.reviews || []).slice(0, 5).map((rv: Record<string, unknown>) => ({
            author: (rv.authorAttribution as Record<string, string>)?.displayName ?? 'Anonymous',
            text:   (rv.text as Record<string, string>)?.text ?? '',
            rating: (rv.rating as number) ?? 5,
          }));
        }
      } catch (_) { /* skip */ }

      const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 4)
        .map(p => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=900&key=${KEY}`);

      const fullAddr  = (pl.formattedAddress as string) ?? '';
      const addrParts = fullAddr.split(',');
      const street    = addrParts.slice(0, -3).join(',').trim() || addrParts[0]?.trim() || '';
      const stateCode = addrParts.slice(-2, -1)[0]?.trim().split(' ')[0] ?? '';

      queue.push({
        name: (pl.displayName as Record<string, string>)?.text ?? 'Unknown',
        category, address: street, city, state: stateCode,
        phone: (pl.nationalPhoneNumber as string) ?? '', email: '',
        google_place_id: pl.id as string,
        current_website_url: websiteUri || '',
        website_quality: websiteQuality,
        rating: (pl.rating as number) ?? 0,
        review_count: (pl.userRatingCount as number) ?? 0,
        top_reviews: reviews, photos: photoUrls,
        hours: ((pl.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions ?? []).join(', '),
        owner_name: '', year_established: '', personality_profile: null,
        status: 'scraped', campaign_id: campaign.id,
        campaign_query: `${category} in ${city}`, unsubscribed: false,
      });
      await new Promise(res => setTimeout(res, 150));
    }

    // Upsert businesses
    const toProcess: Record<string, unknown>[] = [];
    for (const biz of queue) {
      const existing = await db.Business.filter({ google_place_id: biz.google_place_id as string }) as Record<string, unknown>[];
      if (existing?.length > 0) {
        const eb = existing[0];
        await db.Business.update(eb.id as string, {
          rating: biz.rating, review_count: biz.review_count,
          top_reviews: biz.top_reviews, hours: biz.hours, phone: biz.phone,
          campaign_id: campaign.id, current_website_url: biz.current_website_url,
          website_quality: biz.website_quality,
        });
        const existingSites = await db.GeneratedSite.filter({ business_id: eb.id as string }) as unknown[];
        if (!existingSites?.length) toProcess.push({ ...eb, ...biz, id: eb.id });
        continue;
      }
      // Try to enrich with email from their website
      let enriched: { email?: string; owner_name?: string } = {};
      if (biz.current_website_url) {
        enriched = await enrichFromWebsite(biz.current_website_url as string);
      }
      const created = await db.Business.create({
        ...biz,
        email: enriched.email || '',
        owner_name: enriched.owner_name || '',
      });
      toProcess.push(created);
    }

    await db.Campaign.update(campaign.id, {
      businesses_found: queue.length,
      status: toProcess.length > 0 ? 'analyzing' : 'done',
    });

    if (toProcess.length === 0) {
      return Response.json({
        success: true, campaign_id: campaign.id,
        businesses_found: queue.length, sites_generated: 0,
        message: 'All businesses found already have sites, or all have decent websites. Try a different city or category.',
      });
    }

    // Process sequentially — fingerprint dedup requires each site committed before next reads the DB
    let sitesGenerated = 0;
    for (const business of toProcess) {
      try {
        const profile = await analyzePersonality(business, apiKey, db);
        const site    = await generateSite(business, profile, apiKey, db);
        await writeEmail(business, profile, site, apiKey, db);
        sitesGenerated++;
        await db.Campaign.update(campaign.id, { sites_generated: sitesGenerated });
      } catch (err) {
        console.error(`Pipeline failed for ${(business as { name: string }).name}:`, err);
      }
    }

    await db.Campaign.update(campaign.id, { status: 'done', sites_generated: sitesGenerated });
    return Response.json({
      success: true, campaign_id: campaign.id,
      businesses_found: queue.length, sites_generated: sitesGenerated,
    });

  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
