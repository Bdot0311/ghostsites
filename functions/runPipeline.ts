// ── DB helpers — Authorization: Bearer token, confirmed working ─────────────
const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
const MINI_APP_URL = 'https://untitled-app-d324f23e.base44.app';

function authH(token: string) {
  if (token.startsWith('eyJ')) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  return { 'X-App-Id': token, 'Content-Type': 'application/json' };
}

function getToken(req: Request): string {
  const auth = req.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return req.headers.get('X-App-Id') || req.headers.get('x-service-token') || '';
}

async function dbGet(entity: string, id: string, token: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
    headers: authH(token),
  });
  if (!r.ok) throw new Error(`DB get ${entity}/${id} failed: ${await r.text()}`);
  return r.json();
}

async function dbList(entity: string, token: string, query: Record<string, string> = {}): Promise<unknown[]> {
  const qs = Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '';
  const r = await fetch(`${BASE_URL}/entities/${entity}${qs}`, {
    headers: authH(token),
  });
  if (!r.ok) throw new Error(`DB list ${entity} failed: ${await r.text()}`);
  return r.json();
}

async function dbCreate(entity: string, data: Record<string, unknown>, token: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}`, {
    method: 'POST',
    headers: authH(token),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`DB create ${entity} failed: ${await r.text()}`);
  return r.json();
}

async function dbUpdate(entity: string, id: string, data: Record<string, unknown>, token: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
    method: 'PUT',
    headers: authH(token),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`DB update ${entity}/${id} failed: ${await r.text()}`);
}

// ── Claude helper ──────────────────────────────────────────────────────────
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
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON in Claude response');
  return JSON.parse(m[0]);
}

// ── Design tokens ──────────────────────────────────────────────────────────
const COLOR_PALETTES: Record<number, { name: string; background: string; text: string; accent: string; muted: string }> = {
  1:  { name: "Cream Ink",        background: "#FAF6ED", text: "#1A1A1A", accent: "#C04F2E", muted: "#6B6B6B" },
  2:  { name: "Sage Linen",       background: "#F2F0E8", text: "#2C2E27", accent: "#E8B86D", muted: "#7A7D70" },
  4:  { name: "Champagne Noir",   background: "#F5EFE2", text: "#1C1C1C", accent: "#C4A573", muted: "#6E665A" },
  8:  { name: "Terracotta Cream", background: "#F8F1E3", text: "#3A2C24", accent: "#C9663D", muted: "#8C7B6E" },
  9:  { name: "Concrete Acid",    background: "#1A1A1A", text: "#FFFFFF", accent: "#D4FF00", muted: "#888888" },
  10: { name: "Pure Brutalist",   background: "#FFFFFF", text: "#000000", accent: "#FF3D00", muted: "#444444" },
  11: { name: "Steel Yellow",     background: "#2C2C2C", text: "#FAFAFA", accent: "#FFD600", muted: "#999999" },
  17: { name: "Diner Red",        background: "#F8E9D6", text: "#1D3557", accent: "#E63946", muted: "#6E7A82" },
  18: { name: "70s Mustard",      background: "#F2E4C9", text: "#2B1810", accent: "#6B3410", muted: "#8C6E4E" },
  25: { name: "Mesh Indigo",      background: "#1E1B4B", text: "#F1F5F9", accent: "#C7D2FE", muted: "#94A3B8" },
  34: { name: "Brick Bakery",     background: "#F8F1E3", text: "#2C1810", accent: "#C2461F", muted: "#8C6E5C" },
  35: { name: "Garden Green",     background: "#F8F1E3", text: "#2A3D24", accent: "#C9863D", muted: "#7A7B65" },
  39: { name: "Times Serif",      background: "#FAFAFA", text: "#1A1A1A", accent: "#B91C1C", muted: "#6E6E6E" },
};
const TYPOGRAPHY_PAIRS: Record<number, { name: string; heading_font: string; body_font: string; google_fonts: string }> = {
  1:  { name: "Fraunces + Inter",          heading_font: "Fraunces",        body_font: "Inter",          google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  2:  { name: "Playfair + Manrope",        heading_font: "Playfair Display", body_font: "Manrope",        google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  9:  { name: "Space Grotesk + JetBrains", heading_font: "Space Grotesk",   body_font: "JetBrains Mono", google_fonts: "Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;700" },
  10: { name: "Archivo Black + Inter",     heading_font: "Archivo Black",    body_font: "Inter",          google_fonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  18: { name: "Fraunces + Inter Warm",     heading_font: "Fraunces",         body_font: "Inter",          google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  20: { name: "Abril + Raleway",           heading_font: "Abril Fatface",    body_font: "Raleway",        google_fonts: "Abril+Fatface&family=Raleway:wght@300;400;600" },
};
const ARCHETYPE_PALETTE_MAP: Record<string, number[]> = {
  "Editorial":    [1, 39],       "Soft Luxury":  [2, 4, 8],      "Brutalist":    [9, 10, 11],
  "Modern Tech":  [25],          "Warm Local":   [8, 17, 34, 35], "Bold Minimal": [10, 39],
  "Photo-First":  [39, 1],       "Retro":        [17, 18],
};
const ARCHETYPE_TYPOGRAPHY_MAP: Record<string, number[]> = {
  "Editorial":    [1, 2], "Soft Luxury":  [1, 2], "Brutalist":    [9, 10],
  "Modern Tech":  [9],    "Warm Local":   [18, 20], "Bold Minimal": [10],
  "Photo-First":  [1, 2], "Retro":        [20],
};
const ARCHETYPE_LAYOUT_MAP: Record<string, string[]> = {
  "Editorial":    ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
  "Soft Luxury":  ["CENTERED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Brutalist":    ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
  "Modern Tech":  ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local":   ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Bold Minimal": ["CENTERED_HERO", "SPLIT_HERO"],
  "Photo-First":  ["FULL_BLEED_HERO", "MAGAZINE_GRID"],
  "Retro":        ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
};
function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Step 1: Analyze personality ────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function analyzePersonality(business: any, apiKey: string, token: string) {
  const reviewsText = (business.top_reviews || []).slice(0, 5)
    .map((r: { author: string; text: string; rating: number }, i: number) =>
      `Review ${i + 1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

  const system = `You are a brand strategist. Output JSON only, no other text.
Archetype rules: Barbers/mechanics/tattoo → Brutalist or Retro | Salons/spas/boutiques → Soft Luxury or Editorial | Bakeries/cafes/coffee → Warm Local | Diners/family restaurants → Warm Local or Retro | Gyms/skate → Brutalist | Law/dental/finance → Editorial or Bold Minimal | Tech/IT → Modern Tech | Photographers/galleries → Photo-First | Bars/lounges → Editorial or Brutalist
JSON format: {"personality_keywords":["adj1","adj2","adj3","adj4","adj5"],"design_archetype":"Brutalist","tone_of_voice":"one sentence","key_differentiator":"one thing","best_review_quote":{"text":"verbatim","author":"Name L."},"avoid":["x","y","z"]}`;

  const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state ? ', ' + business.state : ''}\nRating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)\nReviews:\n${reviewsText || 'None'}`;

  const text = await callClaude(apiKey, system, user, 600, 'claude-haiku-4-5');
  const profile = parseJSON(text);
  await dbUpdate('Business', business.id, { personality_profile: profile }, token);
  return profile;
}

// ── Step 2: Generate site ──────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function generateSite(business: any, profile: any, apiKey: string, token: string) {
  const existingSites = await dbList('GeneratedSite', token) as { design_fingerprint: string }[];
  const existingFingerprints = existingSites.map(s => s.design_fingerprint).filter(Boolean);

  const archetype = profile.design_archetype || 'Warm Local';
  const validPalettes = ARCHETYPE_PALETTE_MAP[archetype] || [8];
  const validTypography = ARCHETYPE_TYPOGRAPHY_MAP[archetype] || [1];
  const validLayouts = ARCHETYPE_LAYOUT_MAP[archetype] || ['SCROLL_FLOW'];

  let paletteId = pickRandom(validPalettes);
  let typographyId = pickRandom(validTypography);
  const layout = pickRandom(validLayouts);
  const fingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}`;
  if (existingFingerprints.includes(fingerprint)) {
    paletteId = pickRandom(validPalettes.filter((p: number) => p !== paletteId)) ?? paletteId;
    typographyId = pickRandom(validTypography.filter((t: number) => t !== typographyId)) ?? typographyId;
  }
  const finalFingerprint = `${archetype}-${paletteId}-${typographyId}-${layout}-${Date.now()}`;

  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES[8];
  const typography = TYPOGRAPHY_PAIRS[typographyId] || TYPOGRAPHY_PAIRS[1];

  const reviews = (business.top_reviews || []).slice(0, 3)
    .map((r: { text: string; author: string }) => `"${r.text.slice(0, 150)}" — ${r.author}`).join('\n');

  const system = `You are a web designer. Output ONE complete HTML file. Raw HTML only — no markdown fences, no explanation, no commentary.

CRITICAL RULES:
1. First character must be < of <!DOCTYPE html>. Last must be > of </html>.
2. ZERO JavaScript. No <script> tags whatsoever. CSS animations only.
3. Exactly one <style> block inside <head>. Exactly one Google Fonts <link> in <head>.
4. Use ONLY real business data provided. Zero placeholder text.
5. Keep total output under 5000 tokens.

COLORS: background=${palette.background} | text=${palette.text} | accent=${palette.accent} | muted=${palette.muted}
FONTS: heading="${typography.heading_font}" | body="${typography.body_font}"
LAYOUT: ${layout}

Required sections: nav · hero · about · services (4-6 items) · reviews (2-3 quotes) · hours+contact · footer
Hero headline: 4-7 words, punchy, specific. NOT "Welcome to [name]".
Footer: small text: "Built as a free preview — not affiliated with ${business.name}"`;

  const user = `${business.name} | ${business.category} | ${business.city}${business.state ? ', ' + business.state : ''}
Phone: ${business.phone || 'N/A'} | Hours: ${(business.hours || 'Call for hours').slice(0, 200)}
Rating: ${business.rating}/5 (${business.review_count} reviews)
Vibe: ${archetype} — ${profile.tone_of_voice || ''}
Differentiator: ${profile.key_differentiator || ''}
Keywords: ${(profile.personality_keywords || []).join(', ')}

Reviews:
${reviews}

Google Fonts URL: https://fonts.googleapis.com/css2?family=${typography.google_fonts}&display=swap

Output the complete HTML file now.`;

  let html = await callClaude(apiKey, system, user, 6000, 'claude-opus-4-5');

  // Strip any markdown fences Claude might add despite instructions
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

  // ── Store HTML in DB (not as a file) so the Preview page can render it ──
  const site = await dbCreate('GeneratedSite', {
    business_id: business.id,
    full_html: html,                  // raw HTML stored in DB
    subdomain_url: '',                // filled in after we have the site id
    design_archetype: archetype,
    color_palette_id: paletteId,
    typography_pair_id: typographyId,
    layout_variant: layout,
    section_order: ['About', 'Services', 'Reviews', 'Hours', 'Contact'],
    micro_interactions: [],
    imagery_treatment: 'CLEAN',
    design_fingerprint: finalFingerprint,
    hero_copy,
    about_copy: '', services_copy: '', cta_copy: '',
    generated_at: new Date().toISOString(),
    view_count: 0,
  }, token) as Record<string, unknown>;

  // The Preview page route is the hosted URL the business owner gets to see
  const previewUrl = `${MINI_APP_URL}/SitePreview?id=${site.id}`;
  await dbUpdate('GeneratedSite', site.id as string, { subdomain_url: previewUrl }, token);
  await dbUpdate('Business', business.id, { status: 'site_generated' }, token);

  return { site_id: site.id, subdomain_url: previewUrl, archetype, palette: palette.name, typography: typography.name, layout };
}

// ── Step 3: Write email ────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function writeEmail(business: any, profile: any, site: Record<string, unknown>, apiKey: string, token: string) {
  const bestQuote = profile.best_review_quote || {};
  const system = `Write a cold email to a local business owner. Output JSON only: {"subject":"...","body":"..."}
Rules: subject ≤6 words lowercase. Body 60-80 words. Name the business. Preview URL on its own line. Soft CTA. Sign "— Alex".
Banned: "hope this finds you", "wanted to reach out", "amazing", "incredible", "premier".`;

  const user = `Business: ${business.name} (${business.category}, ${business.city})\nPreview: ${site.subdomain_url}\nBest review: "${bestQuote.text || ''}" — ${bestQuote.author || ''}\nTone: ${profile.tone_of_voice || ''}`;

  const text = await callClaude(apiKey, system, user, 400, 'claude-haiku-4-5');
  const email = parseJSON(text);

  const campaign = await dbCreate('EmailCampaign', {
    business_id: business.id,
    site_id: site.site_id,
    subject: email.subject,
    body: `${email.body}\n\n---\nTo unsubscribe, reply "remove me".`,
    status: 'draft',
    send_attempts: 0,
  }, token) as Record<string, unknown>;

  return { campaign_id: campaign.id, subject: email.subject };
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token — include Authorization: Bearer <token>' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { city, category, business_id } = body;

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // ── Single business mode — use dbGet, not dbFilter ──
    if (business_id) {
      const business = await dbGet('Business', business_id, token);
      const profile = await analyzePersonality(business, apiKey, token);
      const site = await generateSite(business, profile, apiKey, token);
      const email = await writeEmail(business, profile, site, apiKey, token);
      return Response.json({ success: true, business_id, site, email });
    }

    // ── Campaign mode ──
    if (!city || !category) return Response.json({ error: 'Provide city + category or business_id' }, { status: 400 });

    const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!KEY) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });

    const campaign = await dbCreate('Campaign', {
      query: `${category} in ${city}`, city, category,
      status: 'scraping', businesses_found: 0, sites_generated: 0, emails_sent: 0,
    }, token) as Record<string, unknown>;

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
        await dbUpdate('Campaign', campaign.id as string, { status: 'error', error_message: `Places API: ${e}` }, token);
        return Response.json({ error: `Places API error: ${e}` }, { status: 500 });
      }
      const d = await r.json();
      if (d.places) allPlaces.push(...d.places);
      nextToken = d.nextPageToken;
      pg++;
      if (nextToken) await new Promise(res => setTimeout(res, 1500));
    } while (nextToken && pg < 3);

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
        status: 'scraped', campaign_query: `${category} in ${city}`, unsubscribed: false,
      });
      await new Promise(res => setTimeout(res, 150));
    }

    const savedBusinesses: Record<string, unknown>[] = [];
    for (const biz of queue) {
      // Use GET with query param to check for duplicates — /filter POST returns 405
      const existing = await dbList('Business', token, { google_place_id: biz.google_place_id as string }) as unknown[];
      if (existing?.length > 0) continue;
      const created = await dbCreate('Business', biz, token);
      savedBusinesses.push(created);
    }

    await dbUpdate('Campaign', campaign.id as string, {
      businesses_found: savedBusinesses.length,
      status: savedBusinesses.length > 0 ? 'analyzing' : 'done',
    }, token);

    // Run all in parallel
    const results = await Promise.allSettled(
      savedBusinesses.map(async (business) => {
        const profile = await analyzePersonality(business, apiKey, token);
        const site = await generateSite(business, profile, apiKey, token);
        await writeEmail(business, profile, site, apiKey, token);
      })
    );

    const sitesGenerated = results.filter(r => r.status === 'fulfilled').length;
    await dbUpdate('Campaign', campaign.id as string, { status: 'done', sites_generated: sitesGenerated }, token);

    return Response.json({ success: true, campaign_id: campaign.id, businesses_found: savedBusinesses.length, sites_generated: sitesGenerated });

  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
