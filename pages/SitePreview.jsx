import { useState, useEffect } from "react";

const AGENT_APP_ID = "69efdfc7247e1585291f7701";

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
      // getPreview uses service role internally — no user auth needed from the frontend.
      // Returns { html_url, business_name } where html_url is a public CDN link.
      const res = await fetch(
        `https://base44.app/api/apps/${AGENT_APP_ID}/functions/getPreview?id=${id}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "(unreadable)");
        throw new Error(`getPreview ${res.status}: ${body}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.html) throw new Error("Site has no HTML yet.");

      setBusinessName(data.business_name || "");
      setHtml(data.html);
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

      <div style={{ paddingTop: 42 }}>
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "calc(100vh - 42px)", border: "none", display: "block" }}
          sandbox="allow-same-origin allow-forms"
          title="Site Preview"
        />
      </div>
    </div>
  );
}
