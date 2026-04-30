const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
const MINI_APP_URL = 'https://untitled-app-d324f23e.base44.app';

function authHeaders(token: string) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}
async function dbList(entity: string, token: string): Promise<unknown[]> {
  const r = await fetch(`${BASE_URL}/entities/${entity}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`List ${entity} failed: ${await r.text()}`);
  return r.json();
}
async function dbGet(entity: string, id: string, token: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`Get ${entity} failed: ${await r.text()}`);
  return r.json();
}
async function dbCreate(entity: string, data: Record<string, unknown>, token: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Create ${entity} failed: ${await r.text()}`);
  return r.json();
}
async function dbUpdate(entity: string, id: string, data: Record<string, unknown>, token: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Update ${entity} failed: ${await r.text()}`);
}
function getToken(req: Request): string {
  return (req.headers.get('Authorization') || req.headers.get('x-service-token') || '').replace('Bearer ', '');
}

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 6000, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude error: ${await res.text()}`);
  return (await res.json()).content[0].text;
}

const PALETTES: Record<number,{name:string;bg:string;text:string;accent:string;muted:string}> = {
  1:{name:"Cream Ink",bg:"#FAF6ED",text:"#1A1A1A",accent:"#C04F2E",muted:"#6B6B6B"},
  2:{name:"Sage Linen",bg:"#F2F0E8",text:"#2C2E27",accent:"#E8B86D",muted:"#7A7D70"},
  4:{name:"Champagne Noir",bg:"#F5EFE2",text:"#1C1C1C",accent:"#C4A573",muted:"#6E665A"},
  8:{name:"Terracotta",bg:"#F8F1E3",text:"#3A2C24",accent:"#C9663D",muted:"#8C7B6E"},
  9:{name:"Concrete Acid",bg:"#1A1A1A",text:"#FFFFFF",accent:"#D4FF00",muted:"#888888"},
  10:{name:"Pure Brutalist",bg:"#FFFFFF",text:"#000000",accent:"#FF3D00",muted:"#444444"},
  11:{name:"Steel Yellow",bg:"#2C2C2C",text:"#FAFAFA",accent:"#FFD600",muted:"#999999"},
  17:{name:"Diner Red",bg:"#F8E9D6",text:"#1D3557",accent:"#E63946",muted:"#6E7A82"},
  18:{name:"70s Mustard",bg:"#F2E4C9",text:"#2B1810",accent:"#6B3410",muted:"#8C6E4E"},
  25:{name:"Mesh Indigo",bg:"#1E1B4B",text:"#F1F5F9",accent:"#C7D2FE",muted:"#94A3B8"},
  34:{name:"Brick Bakery",bg:"#F8F1E3",text:"#2C1810",accent:"#C2461F",muted:"#8C6E5C"},
  35:{name:"Garden Green",bg:"#F8F1E3",text:"#2A3D24",accent:"#C9863D",muted:"#7A7B65"},
  39:{name:"Times Serif",bg:"#FAFAFA",text:"#1A1A1A",accent:"#B91C1C",muted:"#6E6E6E"},
};
const TYPO: Record<number,{name:string;h:string;b:string;gf:string}> = {
  1:{name:"Fraunces+Inter",h:"Fraunces",b:"Inter",gf:"Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600"},
  2:{name:"Playfair+Manrope",h:"Playfair Display",b:"Manrope",gf:"Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600"},
  9:{name:"SpaceGrotesk+JetBrains",h:"Space Grotesk",b:"JetBrains Mono",gf:"Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;700"},
  10:{name:"ArchivoBlack+Inter",h:"Archivo Black",b:"Inter",gf:"Archivo+Black&family=Inter:wght@300;400;500;600"},
  18:{name:"Fraunces+Inter(warm)",h:"Fraunces",b:"Inter",gf:"Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600"},
  20:{name:"Abril+Raleway",h:"Abril Fatface",b:"Raleway",gf:"Abril+Fatface&family=Raleway:wght@300;400;600"},
};
const A2P: Record<string,number[]> = {
  "Editorial":[1,39],"Soft Luxury":[2,4,8],"Brutalist":[9,10,11],
  "Modern Tech":[25],"Warm Local":[8,17,34,35],"Bold Minimal":[10,39],
  "Photo-First":[39,1],"Retro":[17,18],
};
const A2T: Record<string,number[]> = {
  "Editorial":[1,2],"Soft Luxury":[1,2],"Brutalist":[9,10],
  "Modern Tech":[9],"Warm Local":[18,20],"Bold Minimal":[10],
  "Photo-First":[1,2],"Retro":[20],
};
const A2L: Record<string,string[]> = {
  "Editorial":["MAGAZINE_GRID","SPLIT_HERO","SCROLL_FLOW"],
  "Soft Luxury":["CENTERED_HERO","SPLIT_HERO","SCROLL_FLOW"],
  "Brutalist":["CENTERED_HERO","ASYMMETRIC_STACK","MAGAZINE_GRID"],
  "Modern Tech":["SPLIT_HERO","CENTERED_HERO","SCROLL_FLOW"],
  "Warm Local":["FULL_BLEED_HERO","SPLIT_HERO","SCROLL_FLOW"],
  "Bold Minimal":["CENTERED_HERO","SPLIT_HERO"],
  "Photo-First":["FULL_BLEED_HERO","MAGAZINE_GRID"],
  "Retro":["ASYMMETRIC_STACK","SCROLL_FLOW","MAGAZINE_GRID"],
};
function pick<T>(a:T[]): T { return a[Math.floor(Math.random()*a.length)]; }

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await dbGet('Business', business_id, token);
    if (!business.personality_profile) return Response.json({ error: 'Run personality analysis first' }, { status: 400 });
    const profile = business.personality_profile as Record<string,unknown>;

    const existingSites = await dbList('GeneratedSite', token) as {design_fingerprint:string}[];
    const existingFP = existingSites.map(s=>s.design_fingerprint).filter(Boolean);

    const arch = (profile.design_archetype as string) || 'Warm Local';
    let palId = pick(A2P[arch]||[8]);
    let typId = pick(A2T[arch]||[1]);
    const layout = pick(A2L[arch]||['SCROLL_FLOW']);
    if (existingFP.includes(`${arch}-${palId}-${typId}-${layout}`)) {
      palId = pick((A2P[arch]||[8]).filter((p:number)=>p!==palId)) ?? palId;
      typId = pick((A2T[arch]||[1]).filter((t:number)=>t!==typId)) ?? typId;
    }
    const pal = PALETTES[palId]||PALETTES[8];
    const typ = TYPO[typId]||TYPO[1];
    const fp = `${arch}-${palId}-${typId}-${layout}-${Date.now()}`;
    const reviews = ((business.top_reviews as {author:string;text:string}[])||[]).slice(0,3)
      .map(r=>`"${r.text.slice(0,150)}" — ${r.author}`).join('\n');

    const sys = `You are a web designer. Output ONE complete HTML file. Raw HTML only — no markdown fences, no explanation.

CRITICAL RULES:
1. First character must be < of <!DOCTYPE html>. Last must be > of </html>.
2. ZERO JavaScript. No <script> tags. CSS animations only.
3. One <style> block in <head>. One Google Fonts <link> in <head>.
4. Real business data only. No placeholder text.
5. Stay under 5000 tokens total.

COLORS: bg=${pal.bg} | text=${pal.text} | accent=${pal.accent} | muted=${pal.muted}
FONTS: heading="${typ.h}" | body="${typ.b}"
LAYOUT: ${layout}

Sections: nav · hero · about · services (4-6 items) · reviews (2-3 quotes) · hours+contact · footer
Hero headline: 4-7 words, punchy. NOT "Welcome to [name]".
Footer: "Built as a free preview — not affiliated with ${business.name as string}"`;

    const usr = `${business.name as string} | ${business.category as string} | ${business.city as string}${business.state?', '+business.state:''}
Phone: ${business.phone||'N/A'} | Hours: ${((business.hours as string)||'Call for hours').slice(0,150)}
Rating: ${business.rating}/5 (${business.review_count} reviews)
Vibe: ${arch} — ${profile.tone_of_voice as string}
Differentiator: ${profile.key_differentiator as string}
Keywords: ${((profile.personality_keywords as string[])||[]).join(', ')}

Reviews:
${reviews}

Google Fonts URL: https://fonts.googleapis.com/css2?family=${typ.gf}&display=swap

Output the complete HTML file now.`;

    let html = await callClaude(apiKey, sys, usr);

    // Strip markdown fences if Claude adds them despite instructions
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
      const docIdx = html.indexOf('<!DOCTYPE');
      const htmlIdx = html.indexOf('<html');
      const start = docIdx >= 0 ? docIdx : htmlIdx >= 0 ? htmlIdx : 0;
      html = html.slice(start);
    }
    if (!html.includes('</html>')) { if (!html.includes('</body>')) html+='\n</body>'; html+='\n</html>'; }

    const heroMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const hero_copy = heroMatch ? heroMatch[1].replace(/<[^>]+>/g,'').trim() : '';

    // Store raw HTML in the DB — the SitePreview page renders it via dangerouslySetInnerHTML
    const site = await dbCreate('GeneratedSite', {
      business_id,
      full_html: html,       // raw HTML — not a file URL
      subdomain_url: '',     // filled in after we have the id
      design_archetype: arch, color_palette_id: palId, typography_pair_id: typId,
      layout_variant: layout, section_order: ['About','Services','Reviews','Hours','Contact'],
      micro_interactions: [], imagery_treatment: 'CLEAN', design_fingerprint: fp,
      hero_copy, about_copy:'', services_copy:'', cta_copy:'',
      generated_at: new Date().toISOString(), view_count: 0,
    }, token);

    // Build the real hosted URL — the SitePreview page at the mini-app
    const previewUrl = `${MINI_APP_URL}/SitePreview?id=${(site as Record<string,unknown>).id}`;
    await dbUpdate('GeneratedSite', (site as Record<string,unknown>).id as string, { subdomain_url: previewUrl }, token);
    await dbUpdate('Business', business_id, { status: 'site_generated' }, token);

    return Response.json({
      success: true,
      site_id: (site as Record<string,unknown>).id,
      subdomain_url: previewUrl,
      layout, palette: pal.name, typography: typ.name, design_archetype: arch,
    });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
