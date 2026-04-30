import { createClientFromRequest } from "npm:@base44/sdk";

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
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await db.Business.get(business_id);
    const reviewsText = ((business.top_reviews as {author:string;text:string;rating:number}[]) || []).slice(0,5)
      .map((r,i) => `Review ${i+1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

    const system = `You are a brand strategist. Output JSON only.
Archetypes: Barbers/mechanics/tattoo→Brutalist or Retro | Salons/spas/boutiques→Soft Luxury or Editorial | Bakeries/cafes→Warm Local | Diners/restaurants→Warm Local or Retro | Gyms/skate→Brutalist | Law/dental/finance→Editorial or Bold Minimal | Tech/IT→Modern Tech | Photographers/galleries→Photo-First | Bars/lounges→Editorial or Brutalist
JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Brutalist","tone_of_voice":"one sentence","key_differentiator":"one thing","best_review_quote":{"text":"verbatim","author":"Name L."},"avoid":["x","y","z"]}`;

    const user = `Business: ${business.name}\nCategory: ${business.category}\nCity: ${business.city}${business.state?', '+business.state:''}\nRating: ${business.rating||'N/A'} (${business.review_count||0} reviews)\nReviews:\n${reviewsText||'None'}`;

    const profile = parseJSON(await callClaude(apiKey, system, user));
    await db.Business.update(business_id, { personality_profile: profile });
    return Response.json({ success: true, profile });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
