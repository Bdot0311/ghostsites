const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;

async function dbFilter(entity: string, filters: Record<string, unknown>): Promise<unknown[]> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
    body: JSON.stringify(filters),
  });
  if (!r.ok) throw new Error(`DB filter ${entity} failed: ${await r.text()}`);
  return r.json();
}

async function dbUpdate(entity: string, id: string, data: Record<string, unknown>): Promise<void> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`DB update ${entity} failed: ${await r.text()}`);
}

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 600): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  const d = await res.json();
  return d.content[0].text;
}

function parseJSON(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON in response');
  return JSON.parse(m[0]);
}

Deno.serve(async (req) => {
  try {
    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const rows = await dbFilter('Business', { id: business_id }) as Record<string, unknown>[];
    if (!rows?.length) return Response.json({ error: 'Business not found' }, { status: 404 });
    const business = rows[0];

    const reviewsText = ((business.top_reviews as { author: string; text: string; rating: number }[]) || []).slice(0, 5)
      .map((r, i) => `Review ${i + 1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

    const system = `You are a brand strategist. Output JSON only, no other text.
Archetype rules: Barbers/mechanics/tattoo → Brutalist or Retro | Salons/spas/boutiques → Soft Luxury or Editorial | Bakeries/cafes → Warm Local | Diners/restaurants → Warm Local or Retro | Gyms/skate → Brutalist | Law/dental/finance → Editorial or Bold Minimal | Tech/IT → Modern Tech | Photographers/galleries → Photo-First | Bars/lounges → Editorial or Brutalist
JSON: {"personality_keywords":["adj1","adj2","adj3","adj4","adj5"],"design_archetype":"Brutalist","tone_of_voice":"one sentence","key_differentiator":"one thing","best_review_quote":{"text":"verbatim","author":"Name L."},"avoid":["x","y","z"]}`;

    const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state ? ', ' + business.state : ''}\nRating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)\nReviews:\n${reviewsText || 'None'}`;

    const text = await callClaude(apiKey, system, user);
    const profile = parseJSON(text);
    await dbUpdate('Business', business_id, { personality_profile: profile });

    return Response.json({ success: true, profile });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
