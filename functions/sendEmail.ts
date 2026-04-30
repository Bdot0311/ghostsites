const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
function authHeaders(token: string) { if (token.startsWith('eyJ')) { return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }; } return { 'X-App-Id': token, 'Content-Type': 'application/json' }; }
async function dbGet(entity: string, id: string, token: string): Promise<Record<string,unknown>> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`Get ${entity} failed: ${await r.text()}`);
  return r.json();
}
async function dbUpdate(entity: string, id: string, data: Record<string,unknown>, token: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, { method:'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
  if (!r.ok) throw new Error(`Update ${entity} failed: ${await r.text()}`);
}
function getToken(req: Request): string {
  const auth = req.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return req.headers.get('X-App-Id') || req.headers.get('x-service-token') || '';
}

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const { campaign_id, to_email, gmail_token } = await req.json().catch(() => ({}));
    if (!campaign_id || !to_email) return Response.json({ error: 'campaign_id and to_email required' }, { status: 400 });

    const campaign = await dbGet('EmailCampaign', campaign_id, token);
    const gmailTok = gmail_token || Deno.env.get('GMAIL_ACCESS_TOKEN');
    if (!gmailTok) return Response.json({ error: 'Gmail token required' }, { status: 400 });

    const raw = btoa([`To: ${to_email}`,`Subject: ${campaign.subject}`,'Content-Type: text/plain; charset=utf-8','',campaign.body as string].join('\r\n'))
      .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method:'POST',
      headers:{ 'Authorization': `Bearer ${gmailTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    if (!gmailRes.ok) {
      await dbUpdate('EmailCampaign', campaign_id, { send_attempts: ((campaign.send_attempts as number)||0)+1 }, token);
      throw new Error(`Gmail error: ${await gmailRes.text()}`);
    }
    await dbUpdate('EmailCampaign', campaign_id, { status:'sent', sent_at: new Date().toISOString(), send_attempts: ((campaign.send_attempts as number)||0)+1 }, token);
    return Response.json({ success: true });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
