import { createClientFromRequest } from "npm:@base44/sdk";

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST', headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json'},
    body: JSON.stringify({ model:'claude-haiku-4-5', max_tokens:400, system, messages:[{role:'user',content:user}] }),
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
    const sites = await db.GeneratedSite.filter({ business_id });
    const site = (sites as Record<string,unknown>[])?.[0] || {};
    const profile = (business.personality_profile as Record<string,unknown>) || {};
    const bestQuote = (profile.best_review_quote as Record<string,string>) || {};

    const system = `Write a cold email to a local business owner. Output JSON only: {"subject":"...","body":"..."}
subject: ≤6 words, all lowercase. body: 60-80 words, name the business, preview URL on its own line, soft CTA, sign "— Alex".
Never write: "hope this finds you", "wanted to reach out", "amazing", "incredible", "premier".`;

    const user = `Business: ${business.name} (${business.category}, ${business.city})\nPreview: ${site.subdomain_url||'N/A'}\nBest review: "${bestQuote.text||''}" — ${bestQuote.author||''}\nTone: ${(profile.tone_of_voice as string)||''}`;

    const email = parseJSON(await callClaude(apiKey, system, user));
    const campaign = await db.EmailCampaign.create({
      business_id, site_id: (site.id as string)||null,
      subject: email.subject,
      body: `${email.body}\n\n---\nTo unsubscribe, reply "remove me".`,
      status: 'draft', send_attempts: 0,
    });

    return Response.json({ success:true, campaign_id: campaign.id, subject: email.subject, body: campaign.body });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
