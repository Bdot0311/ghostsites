import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { entity, id, data } = await req.json().catch(() => ({}));
    if (!entity || !id || !data) {
      return Response.json({ error: 'entity, id, data required' }, { status: 400 });
    }

    // deno-lint-ignore no-explicit-any
    const result = await (db as any)[entity].update(id, data);
    return Response.json({ success: true, result });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
