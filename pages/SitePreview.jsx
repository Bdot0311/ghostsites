import { useState, useEffect } from "react";

const AGENT_APP_ID = "69efdfc7247e1585291f7701";

async function getServiceToken() {
  try {
    const res = await fetch(`https://base44.app/api/apps/${AGENT_APP_ID}/functions/getToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return data.token || null;
  } catch (_) { return null; }
}

export default function SitePreview() {
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setError("No site ID provided."); setLoading(false); return; }
    loadSite(id);
  }, []);

  async function loadSite(id) {
    try {
      const token = await getServiceToken();
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(
        `https://base44.app/api/apps/${AGENT_APP_ID}/entities/GeneratedSite/${id}`,
        { headers }
      );
      if (!res.ok) throw new Error(`Site not found (${res.status})`);
      const site = await res.json();
      if (!site.full_html) throw new Error("Site has no HTML content yet.");

      // Increment view count
      if (token) {
        fetch(`https://base44.app/api/apps/${AGENT_APP_ID}/entities/GeneratedSite/${id}`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ view_count: (site.view_count || 0) + 1 }),
        }).catch(() => {});
      }

      // Fetch business name for the top bar
      if (site.business_id && token) {
        fetch(`https://base44.app/api/apps/${AGENT_APP_ID}/entities/Business/${site.business_id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        }).then(r => r.json()).then(b => setBusinessName(b.name || "")).catch(() => {});
      }

      setHtml(site.full_html);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#888" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👻</div>
        <div>Loading preview...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#888", maxWidth: 400 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: "#ff6b6b", marginBottom: 8 }}>{error}</div>
        <a href="/" style={{ color: "#a3e635", fontSize: 14 }}>← Back to dashboard</a>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* GhostSites preview banner */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: "rgba(10,10,10,0.92)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #222",
        padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 13, color: "#aaa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>👻</span>
          <span style={{ color: "#a3e635", fontWeight: 600 }}>GhostSites</span>
          {businessName && <span style={{ color: "#555" }}>· Preview for <strong style={{ color: "#ccc" }}>{businessName}</strong></span>}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, padding: "3px 10px", color: "#666", fontSize: 11 }}>
            PREVIEW — not the live site
          </span>
          <a href="/" style={{ color: "#a3e635", textDecoration: "none", fontSize: 12 }}>← Dashboard</a>
        </div>
      </div>

      {/* The actual generated HTML rendered in an iframe for full isolation */}
      <div style={{ paddingTop: 42 }}>
        <iframe
          srcDoc={html}
          style={{
            width: "100%",
            height: "calc(100vh - 42px)",
            border: "none",
            display: "block",
          }}
          sandbox="allow-same-origin allow-forms"
          title="Site Preview"
        />
      </div>
    </div>
  );
}
