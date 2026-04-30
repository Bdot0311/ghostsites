// Returns the service token for use by the dashboard frontend.
// The token is stored as BASE44_SERVICE_TOKEN env var (set via agent secrets).
Deno.serve(async (_req) => {
  const token = Deno.env.get('BASE44_SERVICE_TOKEN');
  if (!token) {
    return Response.json({ error: 'BASE44_SERVICE_TOKEN not configured' }, { status: 500 });
  }
  return Response.json({ token });
});
