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

Deno.serve(async (req) => {
  try {
    const { campaign_id, to_email, gmail_token } = await req.json().catch(() => ({}));
    if (!campaign_id || !to_email) return Response.json({ error: 'campaign_id and to_email required' }, { status: 400 });

    const campaigns = await dbFilter('EmailCampaign', { id: campaign_id }) as Record<string, unknown>[];
    if (!campaigns?.length) return Response.json({ error: 'Campaign not found' }, { status: 404 });
    const campaign = campaigns[0];

    const token = gmail_token || Deno.env.get('GMAIL_ACCESS_TOKEN');
    if (!token) return Response.json({ error: 'Gmail token required' }, { status: 400 });

    const emailLines = [
      `To: ${to_email}`,
      `Subject: ${campaign.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      campaign.body as string,
    ];
    const raw = btoa(emailLines.join('\r\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });

    if (!gmailRes.ok) {
      const err = await gmailRes.text();
      await dbUpdate('EmailCampaign', campaign_id, { send_attempts: ((campaign.send_attempts as number) || 0) + 1 });
      throw new Error(`Gmail error: ${err}`);
    }

    await dbUpdate('EmailCampaign', campaign_id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      send_attempts: ((campaign.send_attempts as number) || 0) + 1,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
