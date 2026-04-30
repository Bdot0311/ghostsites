// Returns a fresh service token for the dashboard to use
Deno.serve(async (_req) => {
  const token = Deno.env.get('BASE44_SERVICE_TOKEN') || '';
  if (!token) return Response.json({ error: 'No token available' }, { status: 500 });
  return Response.json({ token });
});
