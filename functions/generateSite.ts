import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.25';

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 8000): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  const d = await res.json();
  return d.content[0].text;
}

const COLOR_PALETTES: Record<number, { name: string; background: string; text: string; primary: string; secondary: string; accent: string; muted: string }> = {
  1: { name: "Cream Ink", background: "#FAF6ED", text: "#1A1A1A", primary: "#F5F1E8", secondary: "#1A1A1A", accent: "#C04F2E", muted: "#6B6B6B" },
  2: { name: "Sage Linen", background: "#F2F0E8", text: "#2C2E27", primary: "#D4DDC9", secondary: "#4A5240", accent: "#E8B86D", muted: "#7A7D70" },
  4: { name: "Champagne Noir", background: "#F5EFE2", text: "#1C1C1C", primary: "#ECE4D4", secondary: "#0F0F0F", accent: "#C4A573", muted: "#6E665A" },
  8: { name: "Terracotta Cream", background: "#F8F1E3", text: "#3A2C24", primary: "#F0E5D3", secondary: "#3A2C24", accent: "#C9663D", muted: "#8C7B6E" },
  9: { name: "Concrete Acid", background: "#1A1A1A", text: "#FFFFFF", primary: "#2A2A2A", secondary: "#F5F5F5", accent: "#D4FF00", muted: "#888888" },
  10: { name: "Pure Brutalist", background: "#FFFFFF", text: "#000000", primary: "#FFFFFF", secondary: "#000000", accent: "#FF3D00", muted: "#444444" },
  11: { name: "Steel Yellow", background: "#2C2C2C", text: "#FAFAFA", primary: "#1F1F1F", secondary: "#FAFAFA", accent: "#FFD600", muted: "#999999" },
  17: { name: "Diner Red", background: "#F8E9D6", text: "#1D3557", primary: "#E63946", secondary: "#F1FAEE", accent: "#1D3557", muted: "#6E7A82" },
  18: { name: "70s Mustard", background: "#F2E4C9", text: "#2B1810", primary: "#D4A24C", secondary: "#2B1810", accent: "#6B3410", muted: "#8C6E4E" },
  25: { name: "Mesh Indigo", background: "#1E1B4B", text: "#F1F5F9", primary: "#6366F1", secondary: "#0F172A", accent: "#C7D2FE", muted: "#94A3B8" },
  34: { name: "Brick Bakery", background: "#F8F1E3", text: "#2C1810", primary: "#C2461F", secondary: "#F4E8D4", accent: "#2C1810", muted: "#8C6E5C" },
  35: { name: "Garden Green", background: "#F8F1E3", text: "#2A3D24", primary: "#4A6B3F", secondary: "#F2E8D5", accent: "#C9863D", muted: "#7A7B65" },
  39: { name: "Times Serif", background: "#FAFAFA", text: "#1A1A1A", primary: "#FFFFFF", secondary: "#1A1A1A", accent: "#B91C1C", muted: "#6E6E6E" },
};
const TYPOGRAPHY_PAIRS: Record<number, { name: string; heading_font: string; body_font: string; google_fonts: string }> = {
  1: { name: "Fraunces + Inter", heading_font: "Fraunces", body_font: "Inter", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  2: { name: "Playfair Display + Manrope", heading_font: "Playfair Display", body_font: "Manrope", google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  9: { name: "Space Grotesk + JetBrains Mono", heading_font: "Space Grotesk", body_font: "JetBrains Mono", google_fonts: "Space+Grotesk:wght@300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800" },
  10: { name: "Archivo Black + Inter", heading_font: "Archivo Black", body_font: "Inter", google_fonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  18: { name: "Fraunces + Inter (Warm)", heading_font: "Fraunces", body_font: "Inter", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  20: { name: "Abril Fatface + Raleway", heading_font: "Abril Fatface", body_font: "Raleway", google_fonts: "Abril+Fatface&family=Raleway:ital,wght@0,300..700;1,300..700" },
};
const ARCHETYPE_PALETTE_MAP: Record<string, number[]> = {
  "Editorial": [1, 39], "Soft Luxury": [2, 4, 8], "Brutalist": [9, 10, 11],
  "Modern Tech": [25], "Warm Local": [8, 17, 34, 35], "Bold Minimal": [10, 39],
  "Photo-First": [39, 1], "Retro": [17, 18],
};
const ARCHETYPE_TYPOGRAPHY_MAP: Record<string, number[]> = {
  "Editorial": [1, 2], "Soft Luxury": [1, 2], "Brutalist": [9, 10],
  "Modern Tech": [9], "Warm Local": [18, 20], "Bold Minimal": [10],
  "Photo-First": [1, 2], "Retro": [20],
};
const ARCHETYPE_LAYOUT_MAP: Record<string, string[]> = {
  "Editorial": ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
  "Soft Luxury": ["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Brutalist": ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
  "Modern Tech": ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local": ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Bold Minimal": ["CENTERED_HERO", "SPLIT_HERO"],
  "Photo-First": ["FULL_BLEED_HERO", "MAGAZINE_GRID"],
  "Retro": ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
};
const ARCHETYPE_INTERACTIONS_MAP: Record<string, string[]> = {
  "Editorial": ["SCROLL_REVEAL", "STICKY_HEADER", "IMAGE_REVEAL"],
  "Soft Luxury": ["SCROLL_REVEAL", "PARALLAX", "MAGNETIC_BUTTONS"],
  "Brutalist": ["CUSTOM_CURSOR", "TEXT_SCRAMBLE", "MARQUEE"],
  "Modern Tech": ["TEXT_SCRAMBLE", "MAGNETIC_BUTTONS"],
  "Warm Local": ["SCROLL_REVEAL", "MARQUEE", "HOVER_LIFT"],
  "Bold Minimal": ["SCROLL_REVEAL", "HOVER_LIFT"],
  "Photo-First": ["PARALLAX", "IMAGE_REVEAL", "SCROLL_REVEAL"],
  "Retro": ["MARQUEE", "HOVER_LIFT", "SCROLL_REVEAL"],
};
function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

Deno.serve(async (req) => {
  try {
    // Use createClientFromRequest if Base44 headers present, otherwise fall back to service token
    const serviceToken = Deno.env.get('BASE44_SERVICE_TOKEN') || '';
    const appId = Deno.env.get('BASE44_APP_ID') || '69efdfc7247e1585291f7701';
    const hasB44Headers = req.headers.get('Base44-App-Id') !== null;
    const base44 = hasB44Headers
      ? createClientFromRequest(req)
      : createClient({ appId, serviceToken });
    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    if (!businesses?.length) return Response.json({ error: 'Business not found' }, { status: 404 });
    const business = businesses[0];
    if (!business.personality_profile) return Response.json({ error: 'Run personality analysis first' }, { status: 400 });

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const existingSites = await base44.asServiceRole.entities.GeneratedSite.list();
    const existingFingerprints = (existingSites || []).map((s: { design_fingerprint: string }) => s.design_fingerprint).filter(Boolean);
    const profile = business.personality_profile;
    const archetype = profile.design_archetype || 'Warm Local';
    const validPalettes = ARCHETYPE_PALETTE_MAP[archetype] || [8];
    const validTypography = ARCHETYPE_TYPOGRAPHY_MAP[archetype] || [1];
    const validLayouts = ARCHETYPE_LAYOUT_MAP[archetype] || ['SCROLL_FLOW'];
    const validInteractions = ARCHETYPE_INTERACTIONS_MAP[archetype] || ['SCROLL_REVEAL', 'HOVER_LIFT'];

    let paletteId = pickRandom(validPalettes);
    let typographyId = pickRandom(validTypography);
    const layout = pickRandom(validLayouts);
    const sectionOrder = ['About', 'Services', 'Reviews', 'Hours', 'Contact'].sort(() => Math.random() - 0.5);
    const fingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}`;
    if (existingFingerprints.includes(fingerprint)) {
      paletteId = pickRandom(validPalettes.filter(p => p !== paletteId)) ?? paletteId;
      typographyId = pickRandom(validTypography.filter(t => t !== typographyId)) ?? typographyId;
    }
    const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES[8];
    const typography = TYPOGRAPHY_PAIRS[typographyId] || TYPOGRAPHY_PAIRS[1];
    const microInteractions = validInteractions.slice(0, 2 + Math.floor(Math.random() * 2));
    const finalFingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}-${Date.now()}`;
    const reviewsText = (business.top_reviews || []).map((r: { author: string; text: string }) => `"${r.text}" — ${r.author}`).join('\n');

    const systemPrompt = `You are a senior web designer building a hand-crafted website for a local business. It must NOT look like an AI template.
COPYWRITING RULES: Hero headline 4-8 words MAX, never "Welcome to". About under 120 words, first person, never starts with "Welcome" or "We are". Services 4-6 human descriptions. Include 2-3 verbatim review quotes.
BANNED: "We pride ourselves", "Excellence in every", "Your trusted partner", "premier", "state-of-the-art", "Look no further"
DESIGN: Use palette exactly, mobile-first, smooth animations cubic-bezier(0.4,0,0.2,1)
FOOTER: "Built as a free preview — not affiliated with ${business.name}"
OUTPUT: Single HTML file, embedded style+script, no external CSS frameworks except Google Fonts, no placeholder content.`;

    const userPrompt = `Business: ${business.name}
Category: ${business.category}, ${business.city}${business.state ? ', ' + business.state : ''}
Phone: ${business.phone || ''}
Hours: ${business.hours || 'Mon-Fri 9am-6pm'}
Rating: ${business.rating || '4.5'}/5 (${business.review_count || 0} reviews)
Owner: ${business.owner_name || ''}

Personality: ${profile.design_archetype} — ${profile.tone_of_voice}
Keywords: ${(profile.personality_keywords || []).join(', ')}
Key Differentiator: ${profile.key_differentiator}
Best Quote: "${profile.best_review_quote?.text}" — ${profile.best_review_quote?.author}
Avoid: ${(profile.avoid || []).join(', ')}

Reviews:
${reviewsText}

Design Tokens:
Layout: ${layout}
Section Order: Hero → ${sectionOrder.join(' → ')} → Footer
Background: ${palette.background}
Text: ${palette.text}
Primary: ${palette.primary}
Secondary: ${palette.secondary}
Accent: ${palette.accent}
Muted: ${palette.muted}
Heading font: ${typography.heading_font}
Body font: ${typography.body_font}
Google Fonts: https://fonts.googleapis.com/css2?family=${typography.google_fonts}&display=swap
Micro-interactions: ${microInteractions.join(', ')}
Photos: ${(business.photos || []).slice(0, 3).join(', ') || 'None — use type-forward layout'}

Generate the complete production-ready HTML now.`;

    const text = await callClaude(apiKey, systemPrompt, userPrompt, 8000);
    let htmlContent = text.replace(/^```html\n?/, '').replace(/\n?```$/, '');

    // Store HTML directly in the entity field

    const heroMatch = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const hero_copy = heroMatch ? heroMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const subdomain = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    const subdomain_url = `https://ghostsites.preview/${subdomain}`;

    const site = await base44.asServiceRole.entities.GeneratedSite.create({
      business_id,
      subdomain_url,
      full_html: htmlContent,
      design_archetype: archetype,
      color_palette_id: paletteId,
      typography_pair_id: typographyId,
      layout_variant: layout,
      section_order: sectionOrder,
      micro_interactions: microInteractions,
      imagery_treatment: 'CLEAN',
      design_fingerprint: finalFingerprint,
      hero_copy,
      about_copy: '',
      services_copy: '',
      cta_copy: '',
      generated_at: new Date().toISOString(),
      view_count: 0,
    });

    await base44.asServiceRole.entities.Business.update(business_id, { status: 'site_generated' });

    return Response.json({
      success: true,
      site_id: site.id,
      subdomain_url,
      design_archetype: archetype,
      palette: palette.name,
      typography: typography.name,
      layout,
      fingerprint: finalFingerprint,
    });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
