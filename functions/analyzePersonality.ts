const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;

function authHeaders(token: string) {
  if (token.startsWith('eyJ')) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  return { 'X-App-Id': token, 'Content-Type': 'application/json' };
}
async function dbGet(entity: string, id: string, token: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`Get ${entity} failed: ${await r.text()}`);
  return r.json();
}
async function dbUpdate(entity: string, id: string, data: Record<string, unknown>, token: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Update ${entity} failed: ${await r.text()}`);
}
function getToken(req: Request): string {
  const auth = req.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return req.headers.get('X-App-Id') || req.headers.get('x-service-token') || '';
}

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 600, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude error: ${await res.text()}`);
  return (await res.json()).content[0].text;
}
function parseJSON(t: string) { const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('No JSON'); return JSON.parse(m[0]); }

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await dbGet('Business', business_id, token);
    const reviewsText = ((business.top_reviews as {author:string;text:string;rating:number}[]) || []).slice(0,5)
      .map((r,i) => `Review ${i+1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

    const system = `You are a brand strategist. Output JSON only.
Archetypes: Barbers/mechanics/tattoo→Brutalist or Retro | Salons/spas/boutiques→Soft Luxury or Editorial | Bakeries/cafes→Warm Local | Diners/restaurants→Warm Local or Retro | Gyms/skate→Brutalist | Law/dental/finance→Editorial or Bold Minimal | Tech/IT→Modern Tech | Photographers/galleries→Photo-First | Bars/lounges→Editorial or Brutalist
JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Brutalist","tone_of_voice":"one sentence","key_differentiator":"one thing","best_review_quote":{"text":"verbatim","author":"Name L."},"avoid":["x","y","z"]}`;

    const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state?', '+business.state:''}\nRating: ${business.rating||'N/A'} (${business.review_count||0} reviews)\nReviews:\n${reviewsText||'None'}`;

    const profile = parseJSON(await callClaude(apiKey, system, user));
    await dbUpdate('Business', business_id, { personality_profile: profile }, token);
    return Response.json({ success: true, profile });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
