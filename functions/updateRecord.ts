import { createClient } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID') || '69efdfc7247e1585291f7701',
      serviceToken: Deno.env.get('BASE44_SERVICE_TOKEN') || '',
    });
    const { entity, id, data } = await req.json().catch(() => ({}));
    if (!entity || !id || !data) return Response.json({ error: 'entity, id, data required' }, { status: 400 });
    const entities: Record<string, unknown> = {
      Business: base44.asServiceRole.entities.Business,
      GeneratedSite: base44.asServiceRole.entities.GeneratedSite,
      EmailCampaign: base44.asServiceRole.entities.EmailCampaign,
      Campaign: base44.asServiceRole.entities.Campaign,
    };
    // deno-lint-ignore no-explicit-any
    const ent = entities[entity] as any;
    if (!ent) return Response.json({ error: 'Unknown entity' }, { status: 400 });
    const result = await ent.update(id, data);
    return Response.json({ success: true, result });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
