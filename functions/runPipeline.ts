import { createClientFromRequest } from "npm:@base44/sdk";

const MINI_APP_URL = 'https://untitled-app-d324f23e.base44.app';

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

const COLOR_PALETTES: Record<number, { name: string; background: string; text: string; accent: string; muted: string }> = {
  1:  { name: "Cream Ink",        background: "#FAF6ED", text: "#1A1A1A", accent: "#C04F2E", muted: "#6B6B6B" },
  2:  { name: "Sage Linen",       background: "#F2F0E8", text: "#2C2E27", accent: "#5C7A4E", muted: "#7A7D70" },
  3:  { name: "Slate Blue",       background: "#F0F4F8", text: "#1E2A3A", accent: "#3B6FBA", muted: "#6E7E90" },
  4:  { name: "Champagne Noir",   background: "#F5EFE2", text: "#1C1C1C", accent: "#C4A573", muted: "#6E665A" },
  5:  { name: "Forest Fog",       background: "#EDF2EE", text: "#1A2E1A", accent: "#4A7C59", muted: "#6B7D6B" },
  6:  { name: "Dusty Rose",       background: "#F8F0F0", text: "#2C1A1A", accent: "#B05070", muted: "#8C6E6E" },
  7:  { name: "Navy Linen",       background: "#F0F2F8", text: "#0F1F3D", accent: "#C4832D", muted: "#6E7A8C" },
  8:  { name: "Terracotta Cream", background: "#F8F1E3", text: "#3A2C24", accent: "#C9663D", muted: "#8C7B6E" },
  9:  { name: "Concrete Acid",    background: "#1A1A1A", text: "#FFFFFF", accent: "#D4FF00", muted: "#888888" },
  10: { name: "Pure Brutalist",   background: "#FFFFFF", text: "#000000", accent: "#FF3D00", muted: "#444444" },
  11: { name: "Steel Yellow",     background: "#2C2C2C", text: "#FAFAFA", accent: "#FFD600", muted: "#999999" },
  12: { name: "Ink & Copper",     background: "#1C1A18", text: "#F5F0E8", accent: "#C87941", muted: "#8A7D6E" },
  13: { name: "Old Paper",        background: "#EDE0C4", text: "#2A1F0E", accent: "#8B3A1A", muted: "#7A6A52" },
  14: { name: "Chalk & Cobalt",   background: "#F4F7FF", text: "#0A1A3A", accent: "#1A4FCC", muted: "#5E6E8C" },
  15: { name: "Olive & Cream",    background: "#F5F2E4", text: "#2A2A1A", accent: "#7A8C3A", muted: "#7A7A5A" },
  16: { name: "Espresso",         background: "#1E1410", text: "#F5EFE0", accent: "#D4884A", muted: "#8A7060" },
  17: { name: "Diner Red",        background: "#F8E9D6", text: "#1D3557", accent: "#E63946", muted: "#6E7A82" },
  18: { name: "70s Mustard",      background: "#F2E4C9", text: "#2B1810", accent: "#8B4A0A", muted: "#8C6E4E" },
  19: { name: "Bubblegum",        background: "#FFF0F5", text: "#2A0A1A", accent: "#E0407A", muted: "#8C6070" },
  20: { name: "Mint Condition",   background: "#F0FAF5", text: "#0A2A1A", accent: "#2A8A5A", muted: "#5A8A6A" },
  21: { name: "Matte Black",      background: "#111111", text: "#EEEEEE", accent: "#FFFFFF", muted: "#777777" },
  22: { name: "Desert Sand",      background: "#F5E8D0", text: "#2A1A0A", accent: "#C87A3A", muted: "#8A7050" },
  23: { name: "Lilac Noir",       background: "#1A1228", text: "#F0ECF8", accent: "#B08AE0", muted: "#8A7AA0" },
  24: { name: "Rust & Stone",     background: "#F2ECE4", text: "#2A1A12", accent: "#B04A20", muted: "#8A7060" },
  25: { name: "Mesh Indigo",      background: "#1E1B4B", text: "#F1F5F9", accent: "#C7D2FE", muted: "#94A3B8" },
  34: { name: "Brick Bakery",     background: "#F8F1E3", text: "#2C1810", accent: "#C2461F", muted: "#8C6E5C" },
  35: { name: "Garden Green",     background: "#F8F1E3", text: "#2A3D24", accent: "#5A8A3A", muted: "#7A7B65" },
  39: { name: "Times Serif",      background: "#FAFAFA", text: "#1A1A1A", accent: "#B91C1C", muted: "#6E6E6E" },
};

const TYPOGRAPHY_PAIRS: Record<number, { name: string; heading_font: string; body_font: string; google_fonts: string }> = {
  1:  { name: "Fraunces + Inter",        heading_font: "Fraunces",         body_font: "Inter",          google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  2:  { name: "Playfair + Manrope",      heading_font: "Playfair Display", body_font: "Manrope",        google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  3:  { name: "Libre Baskerville + Lato",heading_font: "Libre Baskerville",body_font: "Lato",           google_fonts: "Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700" },
  4:  { name: "Oswald + Source Sans",    heading_font: "Oswald",           body_font: "Source Sans 3",  google_fonts: "Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600" },
  5:  { name: "Bebas + Open Sans",       heading_font: "Bebas Neue",       body_font: "Open Sans",      google_fonts: "Bebas+Neue&family=Open+Sans:wght@300;400;600" },
  6:  { name: "Montserrat + Georgia",    heading_font: "Montserrat",       body_font: "Georgia",        google_fonts: "Montserrat:wght@400;600;700;800" },
  7:  { name: "Raleway + Merriweather",  heading_font: "Raleway",          body_font: "Merriweather",   google_fonts: "Raleway:wght@300;400;600;700&family=Merriweather:ital,wght@0,300;0,400;1,300" },
  8:  { name: "Anton + Roboto",          heading_font: "Anton",            body_font: "Roboto",         google_fonts: "Anton&family=Roboto:wght@300;400;500" },
  9:  { name: "Space Grotesk + DM Sans", heading_font: "Space Grotesk",    body_font: "DM Sans",        google_fonts: "Space+Grotesk:wght@300..700&family=DM+Sans:wght@300;400;500;600" },
  10: { name: "Archivo Black + Inter",   heading_font: "Archivo Black",    body_font: "Inter",          google_fonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  11: { name: "Black Han + Nunito",      heading_font: "Black Han Sans",   body_font: "Nunito",         google_fonts: "Black+Han+Sans&family=Nunito:wght@300;400;600" },
  12: { name: "Ultra + Crimson",         heading_font: "Ultra",            body_font: "Crimson Text",   google_fonts: "Ultra&family=Crimson+Text:ital,wght@0,400;0,600;1,400" },
  13: { name: "Barlow Condensed + Karla",heading_font: "Barlow Condensed", body_font: "Karla",          google_fonts: "Barlow+Condensed:wght@400;600;700;800&family=Karla:wght@300;400;500" },
  14: { name: "DM Serif + Work Sans",    heading_font: "DM Serif Display", body_font: "Work Sans",      google_fonts: "DM+Serif+Display:ital@0;1&family=Work+Sans:wght@300;400;500;600" },
  18: { name: "Fraunces + Inter Warm",   heading_font: "Fraunces",         body_font: "Inter",          google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  20: { name: "Abril + Raleway",         heading_font: "Abril Fatface",    body_font: "Raleway",        google_fonts: "Abril+Fatface&family=Raleway:wght@300;400;600" },
};

// Wider archetype maps so barbers/salons get variety across sessions
const ARCHETYPE_PALETTE_MAP: Record<string, number[]> = {
  "Editorial":   [1, 3, 7, 39, 14],
  "Soft Luxury": [2, 4, 6, 8, 19, 20],
  "Brutalist":   [9, 10, 11, 21],
  "Modern Tech": [25, 9, 14, 3],
  "Warm Local":  [8, 17, 34, 35, 22, 13, 15],
  "Bold Minimal":[10, 39, 1, 21, 12],
  "Photo-First": [39, 1, 2, 3, 7],
  "Retro":       [17, 18, 13, 22, 16, 24],
  "Classic":     [7, 3, 39, 14, 15],
  "Rustic":      [8, 22, 24, 16, 13],
};
const ARCHETYPE_TYPOGRAPHY_MAP: Record<string, number[]> = {
  "Editorial":   [1, 2, 3, 7, 14],
  "Soft Luxury": [1, 2, 7, 12, 14, 20],
  "Brutalist":   [9, 10, 5, 8, 13],
  "Modern Tech": [9, 10, 13, 4],
  "Warm Local":  [18, 20, 1, 3, 7, 6],
  "Bold Minimal":[10, 9, 4, 5, 8],
  "Photo-First": [1, 2, 7, 14, 3],
  "Retro":       [20, 18, 11, 12, 4, 6],
  "Classic":     [3, 7, 1, 14, 2],
  "Rustic":      [18, 12, 3, 6, 7],
};
const ARCHETYPE_LAYOUT_MAP: Record<string, string[]> = {
  "Editorial":   ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
  "Soft Luxury": ["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Brutalist":   ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
  "Modern Tech": ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local":  ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Bold Minimal":["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Photo-First": ["FULL_BLEED_HERO", "MAGAZINE_GRID", "SPLIT_HERO"],
  "Retro":       ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
  "Classic":     ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Rustic":      ["FULL_BLEED_HERO", "SCROLL_FLOW", "ASYMMETRIC_STACK"],
};

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// deno-lint-ignore no-explicit-any
async function analyzePersonality(business: any, apiKey: string, db: any) {
  const reviewsText = (business.top_reviews || []).slice(0, 5)
    .map((r: { author: string; text: string; rating: number }, i: number) =>
      `Review ${i+1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

  const system = `You are a brand strategist for LOCAL SERVICE BUSINESSES. Output JSON only.

Pick ONE archetype that fits the business personality. Use variety — don't default to the same archetype every time.
Archetype guide (pick the BEST fit, not just the first option):
- Barbers/men's grooming → Retro OR Classic OR Bold Minimal (pick based on vibe from reviews)
- Salons/nail/lash/beauty → Soft Luxury OR Editorial OR Retro
- Tattoo studios → Brutalist OR Editorial OR Bold Minimal
- Spas/massage/wellness → Soft Luxury OR Editorial
- Bakeries/cafes/coffee → Warm Local OR Rustic OR Retro
- Diners/family restaurants → Warm Local OR Retro OR Rustic
- Upscale restaurants/bars → Editorial OR Classic OR Photo-First
- Gyms/fitness/boxing → Bold Minimal OR Brutalist
- Auto shops/mechanics → Rustic OR Retro OR Bold Minimal
- Law/dental/medical → Classic OR Editorial
- Landscaping/plumbing/trades → Warm Local OR Rustic
- Photographers/art/galleries → Photo-First OR Editorial
- Breweries/wine bars → Editorial OR Retro OR Classic
- Boutiques/clothing → Soft Luxury OR Editorial OR Photo-First

Tone of voice: write as if you ARE the owner of this specific business based on the reviews.
Key differentiator: one specific thing customers praise that competitors don't have.

JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Retro","tone_of_voice":"one owner-voice sentence","key_differentiator":"specific unique thing","best_review_quote":{"text":"verbatim from review","author":"Name L."},"avoid":["x","y","z"]}`;

  const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state?', '+business.state:''}\nRating: ${business.rating||'N/A'} (${business.review_count||0} reviews)\nReviews:\n${reviewsText||'None available'}`;
  const profile = parseJSON(await callClaude(apiKey, system, user, 600, 'claude-haiku-4-5'));
  await db.Business.update(business.id, { personality_profile: profile });
  return profile;
}

// deno-lint-ignore no-explicit-any
async function generateSite(business: any, profile: any, apiKey: string, db: any) {
  const existingSites = await db.GeneratedSite.list();
  const existingFingerprints = new Set(
    (existingSites as { design_fingerprint: string }[]).map(s => s.design_fingerprint).filter(Boolean)
  );

  // Normalize archetype — handle any casing from Claude
  const rawArchetype = (profile.design_archetype || 'Warm Local').trim();
  const archetype = rawArchetype.split(/\s+/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const validPalettes = ARCHETYPE_PALETTE_MAP[archetype] || ARCHETYPE_PALETTE_MAP['Warm Local'];
  const validTypography = ARCHETYPE_TYPOGRAPHY_MAP[archetype] || ARCHETYPE_TYPOGRAPHY_MAP['Warm Local'];
  const validLayouts = ARCHETYPE_LAYOUT_MAP[archetype] || ARCHETYPE_LAYOUT_MAP['Warm Local'];

  // Exhaustive search for an unused fingerprint combination
  let paletteId = validPalettes[0];
  let typographyId = validTypography[0];
  let layout = validLayouts[0];
  let finalFingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}`;
  let found = false;

  outer: for (const p of shuffle(validPalettes)) {
    for (const t of shuffle(validTypography)) {
      for (const l of shuffle(validLayouts)) {
        const fp = `${archetype}-${p}-${t}-${l}`;
        if (!existingFingerprints.has(fp)) {
          paletteId = p; typographyId = t; layout = l; finalFingerprint = fp;
          found = true;
          break outer;
        }
      }
    }
  }
  // All combos used — pick random to still get variety
  if (!found) {
    paletteId = pickRandom(validPalettes);
    typographyId = pickRandom(validTypography);
    layout = pickRandom(validLayouts);
    finalFingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}-${Date.now()}`;
  }

  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES[8];
  const typography = TYPOGRAPHY_PAIRS[typographyId] || TYPOGRAPHY_PAIRS[1];
  const reviews = (business.top_reviews || []).slice(0, 3)
    .map((r: { text: string; author: string }) => `"${r.text.slice(0, 150)}" — ${r.author}`).join('\n');

  const layoutDesc: Record<string, string> = {
    FULL_BLEED_HERO:    'Full-width color block at top. Business name big. Phone number prominently below. No split columns.',
    SPLIT_HERO:         'Hero: bold text left half, accent color block or decorative element right half. CSS grid two-column.',
    CENTERED_HERO:      'Everything center-aligned. Name, tagline, phone centered on solid background. Bold and simple.',
    SCROLL_FLOW:        'Single scrolling column. Each section separated by color bands or thick borders. No complex grids.',
    MAGAZINE_GRID:      'Alternating wide/narrow column layout. Text-heavy, editorial. Asymmetric section widths.',
    ASYMMETRIC_STACK:   'Sections stack with unequal proportions — e.g. 70% text beside a 30% accent stripe. Bold whitespace.',
  };

  const system = `You are a web designer building a site for a LOCAL SERVICE BUSINESS — a real neighborhood shop owned by a real person, not a tech startup or SaaS product.

Output ONE complete HTML file. Raw HTML only — no markdown fences, no explanation, no preamble.

ABSOLUTE RULES:
1. First character must be < of <!DOCTYPE html>. Last character must be > of </html>.
2. ZERO JavaScript. No <script> tags at all. Pure HTML + CSS only.
3. One <style> block in <head>. One Google Fonts <link> in <head>. Nothing else in <head>.
4. Real business data only — phone number, actual hours, real street address, verbatim review quotes with real author names.
5. Under 5000 tokens total.

THIS IS A LOCAL BUSINESS SITE — NOT a startup, not SaaS, not a digital agency:
❌ NEVER use: gradients on text, glassmorphism, "Book a Demo", "Get Started Free", feature comparison grids, pricing tiers, "Trusted by 10,000+ customers", parallax, scroll animations, any language that sounds like a VC pitch deck
✓ DO use: phone number large in the nav bar, real hours (Mon-Fri format), real street address, genuine customer name quotes, language a small business owner would actually say

COLORS:
  background: ${palette.background}
  text: ${palette.text}
  accent: ${palette.accent}
  muted: ${palette.muted}

FONTS:
  headings: "${typography.heading_font}"
  body: "${typography.body_font}"

LAYOUT — ${layout}:
${layoutDesc[layout] || layoutDesc.SCROLL_FLOW}

SECTIONS (in order):
1. Nav — business name + phone number (large, clickable tel: link)
2. Hero — 4-7 word headline unique to this shop's personality. NOT "Welcome to [name]"
3. About — written in the OWNER'S voice, mentioning the actual city/neighborhood
4. Services — 4-6 services, written like a menu or chalkboard list (not a feature grid)
5. Reviews — 2-3 verbatim quotes with customer names
6. Hours + address + phone
7. Footer — include: "Built as a free preview — not affiliated with ${business.name}"`;

  const user = `${business.name} | ${business.category} | ${business.city}${business.state ? ', ' + business.state : ''}
Phone: ${business.phone || 'N/A'} | Hours: ${(business.hours || 'Call for hours').slice(0, 200)}
Rating: ${business.rating}/5 (${business.review_count} reviews)
Design vibe: ${archetype} — ${profile.tone_of_voice || ''}
What makes them special: ${profile.key_differentiator || ''}
Personality: ${(profile.personality_keywords || []).join(', ')}
Avoid in copy: ${(profile.avoid || []).join(', ')}

Customer reviews to quote verbatim:
${reviews}

Google Fonts URL: https://fonts.googleapis.com/css2?family=${typography.google_fonts}&display=swap

COPY RULES — every sentence must be specific to THIS business:
- Hero headline: use one of the personality keywords above, reference the city or neighborhood
- About section: mention something specific a customer praised in the reviews
- Services: name them how this type of business would (not generic tech language)
- One service can mention the best_review_quote naturally in context

Write the complete HTML file now. Start with <!DOCTYPE html>.`;

  let html = await callClaude(apiKey, system, user, 6000, 'claude-opus-4-5');
  html = html.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    const docIdx = html.indexOf('<!DOCTYPE');
    const htmlIdx = html.indexOf('<html');
    const start = docIdx >= 0 ? docIdx : htmlIdx >= 0 ? htmlIdx : 0;
    html = html.slice(start);
  }
  if (!html.includes('</html>')) {
    if (!html.includes('</body>')) html += '\n</body>';
    html += '\n</html>';
  }
  const heroMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hero_copy = heroMatch ? heroMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  const site = await db.GeneratedSite.create({
    business_id: business.id, full_html: html, subdomain_url: '',
    design_archetype: archetype, color_palette_id: paletteId, typography_pair_id: typographyId,
    layout_variant: layout, section_order: ['About','Services','Reviews','Hours','Contact'],
    micro_interactions: [], imagery_treatment: 'CLEAN', design_fingerprint: finalFingerprint,
    hero_copy, about_copy: '', services_copy: '', cta_copy: '',
    generated_at: new Date().toISOString(), view_count: 0,
  });

  const previewUrl = `${MINI_APP_URL}/SitePreview?id=${site.id}`;
  await db.GeneratedSite.update(site.id, { subdomain_url: previewUrl });
  await db.Business.update(business.id, { status: 'site_generated' });
  return { site_id: site.id, subdomain_url: previewUrl, archetype, palette: palette.name, typography: typography.name, layout };
}

// deno-lint-ignore no-explicit-any
async function writeEmail(business: any, profile: any, site: Record<string, unknown>, apiKey: string, db: any) {
  const bestQuote = profile.best_review_quote || {};
  const system = `Write a cold email to a local business owner. Output JSON only: {"subject":"...","body":"..."}
Rules: subject ≤6 words lowercase. Body 60-80 words. Name the business specifically. Preview URL on its own line. Soft CTA — no pressure. Sign "— Alex".
Banned phrases: "hope this finds you", "wanted to reach out", "amazing", "incredible", "premier", "stunning".`;
  const user = `Business: ${business.name} (${business.category}, ${business.city})\nPreview: ${site.subdomain_url}\nBest review: "${bestQuote.text || ''}" — ${bestQuote.author || ''}\nTone: ${profile.tone_of_voice || ''}`;
  const email = parseJSON(await callClaude(apiKey, system, user, 400, 'claude-haiku-4-5'));
  const campaign = await db.EmailCampaign.create({
    business_id: business.id, site_id: site.site_id,
    subject: email.subject,
    body: `${email.body}\n\n---\nTo unsubscribe, reply "remove me".`,
    status: 'draft', send_attempts: 0,
    created_at: new Date().toISOString(),
  });
  return { campaign_id: campaign.id, subject: email.subject };
}

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
      const site = await generateSite(business, profile, apiKey, db);
      const email = await writeEmail(business, profile, site, apiKey, db);
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
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.businessStatus,nextPageToken' },
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

    // Filter, enrich, and build queue
    const queue: Record<string, unknown>[] = [];
    for (const pl of allPlaces) {
      if (pl.websiteUri || pl.businessStatus === 'PERMANENTLY_CLOSED') continue;
      let reviews: { author: string; text: string; rating: number }[] = [];
      try {
        const dr = await fetch(`https://places.googleapis.com/v1/places/${pl.id}`, {
          headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'reviews' },
        });
        if (dr.ok) {
          const dd = await dr.json();
          reviews = (dd.reviews || []).slice(0, 5).map((rv: Record<string, unknown>) => ({
            author: (rv.authorAttribution as Record<string, string>)?.displayName ?? 'Anonymous',
            text: (rv.text as Record<string, string>)?.text ?? '',
            rating: (rv.rating as number) ?? 5,
          }));
        }
      } catch (_) { /* skip */ }
      const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 3)
        .map(p => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&key=${KEY}`);
      const fullAddr = (pl.formattedAddress as string) ?? '';
      const addrParts = fullAddr.split(',');
      const street = addrParts.slice(0, -3).join(',').trim() || addrParts[0]?.trim() || '';
      const stateCode = addrParts.slice(-2, -1)[0]?.trim().split(' ')[0] ?? '';
      queue.push({
        name: (pl.displayName as Record<string, string>)?.text ?? 'Unknown', category,
        address: street, city, state: stateCode,
        phone: (pl.nationalPhoneNumber as string) ?? '', email: '',
        google_place_id: pl.id as string,
        rating: (pl.rating as number) ?? 0, review_count: (pl.userRatingCount as number) ?? 0,
        top_reviews: reviews, photos: photoUrls,
        hours: ((pl.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions ?? []).join(', '),
        owner_name: '', year_established: '', personality_profile: null,
        status: 'scraped', campaign_id: campaign.id, campaign_query: `${category} in ${city}`,
        unsubscribed: false,
      });
      await new Promise(res => setTimeout(res, 150));
    }

    // Upsert businesses: create new ones, update existing ones
    // Only queue for site generation if they don't already have a GeneratedSite
    const toProcess: Record<string, unknown>[] = [];
    for (const biz of queue) {
      const existing = await db.Business.filter({ google_place_id: biz.google_place_id as string }) as Record<string, unknown>[];
      if (existing?.length > 0) {
        const existingBiz = existing[0];
        // Refresh data and link to current campaign
        await db.Business.update(existingBiz.id as string, {
          rating: biz.rating, review_count: biz.review_count,
          top_reviews: biz.top_reviews, hours: biz.hours, phone: biz.phone,
          campaign_id: campaign.id, // re-link to current campaign so dashboard shows them
        });
        // Check if they already have a generated site
        const existingSites = await db.GeneratedSite.filter({ business_id: existingBiz.id as string }) as unknown[];
        if (!existingSites?.length) {
          // No site yet — add to processing queue with updated campaign_id
          toProcess.push({ ...existingBiz, ...biz, id: existingBiz.id, campaign_id: campaign.id });
        }
        continue;
      }
      const created = await db.Business.create(biz);
      toProcess.push(created);
    }

    await db.Campaign.update(campaign.id, {
      businesses_found: queue.length, // total found (not just new)
      status: toProcess.length > 0 ? 'analyzing' : 'done',
    });

    if (toProcess.length === 0) {
      return Response.json({
        success: true, campaign_id: campaign.id,
        businesses_found: queue.length, sites_generated: 0,
        message: 'All businesses in this area already have sites. Try a different city or category.',
      });
    }

    // Process SEQUENTIALLY so fingerprint dedup works correctly
    // (parallel would read the same empty DB state and pick duplicate combos)
    let sitesGenerated = 0;
    for (const business of toProcess) {
      try {
        const profile = await analyzePersonality(business, apiKey, db);
        const site = await generateSite(business, profile, apiKey, db);
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
