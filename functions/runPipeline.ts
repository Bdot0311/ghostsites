import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Claude helper ──────────────────────────────────────────────────────────
async function callClaude(apiKey: string, system: string, user: string, maxTokens = 1000): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  const d = await res.json();
  return d.content[0].text;
}

function parseJSON(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON in Claude response');
  return JSON.parse(m[0]);
}

// ── Design tokens ──────────────────────────────────────────────────────────
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

// ── Step functions ─────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function analyzePersonality(base44: any, business: any, apiKey: string) {
  const reviewsText = (business.top_reviews || [])
    .map((r: { author: string; text: string; rating: number }, i: number) =>
      `Review ${i + 1} (${r.rating}/5) by ${r.author}:\n"${r.text}"`).join('\n\n');

  const system = `You are a senior brand strategist analyzing a local business to design a website that captures its true personality.
ARCHETYPE MAPPING RULES:
- Florists, salons, boutiques, spas → Soft Luxury or Editorial
- Barbers, mechanics, dive bars, tattoo shops → Brutalist or Retro
- Law firms, accountants, dentists, financial → Editorial or Bold Minimal
- Taco trucks, diners, family restaurants, delis → Warm Local or Retro
- Gyms, bike shops, skate shops → Brutalist or Bold Minimal
- Bakeries, coffee shops, cafes → Warm Local or Soft Luxury
- Tech / IT / repair shops → Modern Tech or Bold Minimal
- Photographers, galleries, design studios → Photo-First or Editorial
- Bookstores, record stores → Editorial or Retro
- Bars, cocktail lounges → Editorial, Brutalist, or Retro
OUTPUT — JSON ONLY:
{"personality_keywords":["5 adjectives"],"design_archetype":"Editorial|Brutalist|Soft Luxury|Modern Tech|Warm Local|Bold Minimal|Photo-First|Retro","tone_of_voice":"one sentence","key_differentiator":"the ONE thing","best_review_quote":{"text":"verbatim","author":"first name + last initial"},"avoid":["3 things"]}`;

  const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state ? ', ' + business.state : ''}\nRating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)\n\nREVIEWS:\n${reviewsText || 'No reviews'}`;

  const text = await callClaude(apiKey, system, user, 1000);
  const profile = parseJSON(text);
  await base44.asServiceRole.entities.Business.update(business.id, { personality_profile: profile });
  return profile;
}

// deno-lint-ignore no-explicit-any
async function generateSite(base44: any, business: any, profile: any, apiKey: string) {
  const existingSites = await base44.asServiceRole.entities.GeneratedSite.list();
  const existingFingerprints = (existingSites || []).map((s: { design_fingerprint: string }) => s.design_fingerprint).filter(Boolean);
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
    paletteId = pickRandom(validPalettes.filter((p: number) => p !== paletteId)) ?? paletteId;
    typographyId = pickRandom(validTypography.filter((t: number) => t !== typographyId)) ?? typographyId;
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

  const userPrompt = `Business: ${business.name}\nCategory: ${business.category}, ${business.city}${business.state ? ', ' + business.state : ''}\nPhone: ${business.phone || ''}\nHours: ${business.hours || 'Mon-Fri 9am-6pm'}\nRating: ${business.rating || '4.5'}/5 (${business.review_count || 0} reviews)\nOwner: ${business.owner_name || ''}\n\nPersonality: ${profile.design_archetype} — ${profile.tone_of_voice}\nKeywords: ${(profile.personality_keywords || []).join(', ')}\nKey Differentiator: ${profile.key_differentiator}\nBest Quote: "${profile.best_review_quote?.text}" — ${profile.best_review_quote?.author}\nAvoid: ${(profile.avoid || []).join(', ')}\n\nReviews:\n${reviewsText}\n\nDesign Tokens:\nLayout: ${layout}\nSection Order: Hero → ${sectionOrder.join(' → ')} → Footer\nBackground: ${palette.background}\nText: ${palette.text}\nPrimary: ${palette.primary}\nSecondary: ${palette.secondary}\nAccent: ${palette.accent}\nMuted: ${palette.muted}\nHeading font: ${typography.heading_font}\nBody font: ${typography.body_font}\nGoogle Fonts: https://fonts.googleapis.com/css2?family=${typography.google_fonts}&display=swap\nMicro-interactions: ${microInteractions.join(', ')}\nPhotos: ${(business.photos || []).slice(0, 3).join(', ') || 'None — use type-forward layout'}\n\nGenerate the complete production-ready HTML now.`;

  const text = await callClaude(apiKey, systemPrompt, userPrompt, 8000);
  let htmlContent = text.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  const heroMatch = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hero_copy = heroMatch ? heroMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  const subdomain = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  const subdomain_url = `https://ghostsites.preview/${subdomain}`;

  // Upload HTML as a file (too large for entity field)
  const htmlBytes = new TextEncoder().encode(htmlContent);
  const htmlBlob = new Blob([htmlBytes], { type: 'text/html' });
  const formData = new FormData();
  formData.append('file', htmlBlob, `${business.id}.html`);
  const uploadRes = await fetch('https://api.base44.com/api/apps/' + Deno.env.get('BASE44_APP_ID') + '/uploadFile', {
    method: 'POST',
    headers: { 'x-api-key': Deno.env.get('BASE44_API_KEY') || '' },
    body: formData,
  });
  let htmlUrl = subdomain_url;
  if (uploadRes.ok) {
    const uploadData = await uploadRes.json();
    htmlUrl = uploadData.file_url || uploadData.url || subdomain_url;
  }

  const site = await base44.asServiceRole.entities.GeneratedSite.create({
    business_id: business.id, subdomain_url, full_html: htmlUrl,
    design_archetype: archetype, color_palette_id: paletteId, typography_pair_id: typographyId,
    layout_variant: layout, section_order: sectionOrder, micro_interactions: microInteractions,
    imagery_treatment: 'CLEAN', design_fingerprint: finalFingerprint, hero_copy,
    about_copy: '', services_copy: '', cta_copy: '', generated_at: new Date().toISOString(), view_count: 0,
  });
  await base44.asServiceRole.entities.Business.update(business.id, { status: 'site_generated' });
  return { site_id: site.id, subdomain_url, archetype, palette: palette.name, typography: typography.name, layout };
}

// deno-lint-ignore no-explicit-any
async function writeEmail(base44: any, business: any, profile: any, site: any, apiKey: string) {
  const bestQuote = profile.best_review_quote || {};
  const system = `Write a 60-90 word cold email to a local business owner who doesn't have a website.
Subject: under 6 words, lowercase, no emojis. Opening: specific to THIS business, never "Hope this finds you well". Body: one sentence what you noticed + one sentence what you built + the link on its own line. Soft CTA: just ask if they want to look. Sign-off: first name only.
HARD RULES: Never "I hope this email finds you well", "I wanted to reach out", "amazing", "incredible". Under 90 words. No bullet points.
OUTPUT JSON ONLY: {"subject":"...","body":"..."}`;

  const user = `Owner: ${business.owner_name || 'the owner'}\nBusiness: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}\nPreview URL: ${site.subdomain_url}\nBest Review Quote: "${bestQuote.text || ''}" — ${bestQuote.author || ''}\nPersonality Keywords: ${(profile.personality_keywords || []).join(', ')}\nKey Differentiator: ${profile.key_differentiator || ''}\nTone: ${profile.tone_of_voice || ''}`;

  const text = await callClaude(apiKey, system, user, 600);
  const emailContent = parseJSON(text);
  const fullBody = `${emailContent.body}\n\n---\nTo unsubscribe, reply "remove me" and I'll take you off the list immediately.`;

  const campaign = await base44.asServiceRole.entities.EmailCampaign.create({
    business_id: business.id, site_id: site.site_id,
    subject: emailContent.subject, body: fullBody, status: 'draft', send_attempts: 0,
  });
  return { campaign_id: campaign.id, subject: emailContent.subject };
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city, category, mode, business_id } = body;

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // ── MODE 1: Full campaign ──
    if (mode === 'campaign' || (!business_id && city && category)) {
      const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
      if (!KEY) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });

      const campaign = await base44.asServiceRole.entities.Campaign.create({
        query: `${category} in ${city}`, city, category,
        status: 'scraping', businesses_found: 0, sites_generated: 0, emails_sent: 0,
      });

      // Scrape
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
          await base44.asServiceRole.entities.Campaign.update(campaign.id, { status: 'error', error_message: `Places API: ${e}` });
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
        const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 5)
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

      let saved = 0;
      const savedBusinesses = [];
      for (const biz of queue) {
        const existing = await base44.asServiceRole.entities.Business.filter({ google_place_id: biz.google_place_id as string });
        if (existing?.length > 0) continue;
        const created = await base44.asServiceRole.entities.Business.create(biz);
        savedBusinesses.push(created);
        saved++;
      }

      await base44.asServiceRole.entities.Campaign.update(campaign.id, {
        businesses_found: saved, status: saved > 0 ? 'analyzing' : 'done',
      });

      // Analyze + generate + email for each
      let sitesGenerated = 0;
      for (const business of savedBusinesses) {
        try {
          const profile = await analyzePersonality(base44, business, apiKey);
          const site = await generateSite(base44, business, profile, apiKey);
          await writeEmail(base44, business, profile, site, apiKey);
          sitesGenerated++;
        } catch (e) {
          console.error(`Failed for ${business.name}:`, e);
          continue;
        }
      }

      await base44.asServiceRole.entities.Campaign.update(campaign.id, {
        status: 'done', sites_generated: sitesGenerated,
      });

      return Response.json({ success: true, campaign_id: campaign.id, businesses_found: saved, sites_generated: sitesGenerated });
    }

    // ── MODE 2: Single business ──
    if (!business_id) return Response.json({ error: 'Provide (city + category) or business_id' }, { status: 400 });

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    if (!businesses?.length) return Response.json({ error: 'Business not found' }, { status: 404 });
    const business = businesses[0];

    const profile = await analyzePersonality(base44, business, apiKey);
    const site = await generateSite(base44, business, profile, apiKey);
    const email = await writeEmail(base44, business, profile, site, apiKey);

    return Response.json({ success: true, business_id, site, email });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
