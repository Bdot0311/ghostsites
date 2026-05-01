import { useState, useEffect, useRef, useCallback } from "react";

const AGENT_APP_ID = "69efdfc7247e1585291f7701";

// Backend functions use createClientFromRequest + asServiceRole internally,
// so no auth header is needed from the frontend.
async function callFn(name, payload) {
  try {
    const res = await fetch(`https://base44.app/api/apps/${AGENT_APP_ID}/functions/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { error: text }; }
  } catch (e) {
    return { error: e.message };
  }
}

const STATUS_COLORS = {
  scraped: "bg-gray-700 text-gray-300",
  site_generated: "bg-blue-100 text-blue-700",
  email_sent: "bg-purple-100 text-purple-700",
  opened: "bg-yellow-100 text-yellow-800",
  replied: "bg-green-100 text-green-700",
  converted: "bg-emerald-100 text-emerald-700",
};

const STATUS_ICONS = {
  scraped: "🔍",
  site_generated: "🌐",
  email_sent: "📧",
  opened: "👁️",
  replied: "💬",
  converted: "🎉",
};



export default function Dashboard() {
  const [tab, setTab] = useState("leads");
  const [businesses, setBusinesses] = useState([]);
  const [sites, setSites] = useState({});
  const [emailCampaigns, setEmailCampaigns] = useState({});
  const [selected, setSelected] = useState(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ city: "", category: "" });
  const [running, setRunning] = useState(false);
  const [runLog, setRunLog] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [previewHtml, setPreviewHtml] = useState({});  // site_id -> fetched HTML string

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch HTML via getPreview (server-side) when a site is selected — avoids CDN CORS issues
  useEffect(() => {
    if (!selected) return;
    const site = sites[selected.id];
    if (!site?.id) return;
    if (previewHtml[site.id]) return; // already cached
    callFn("getPreview", { id: site.id })
      .then(data => { if (data?.html) setPreviewHtml(prev => ({ ...prev, [site.id]: data.html })); })
      .catch(() => {});
  }, [selected, sites]);

  async function loadData() {
    try {
      const res = await callFn("getData", {});
      if (res?.error) { console.error("loadData error:", res.error); return; }
      setBusinesses(res.businesses || []);
      const siteMap = {};
      (res.sites || []).forEach(s => { siteMap[s.business_id] = s; });
      setSites(siteMap);
      const ecMap = {};
      (res.emailCampaigns || []).forEach(e => { ecMap[e.business_id] = e; });
      setEmailCampaigns(ecMap);
    } catch (e) {
      console.error("loadData error:", e);
    }
  }

  async function startCampaign() {
    if (!campaignForm.city || !campaignForm.category) return;
    setRunning(true);
    setRunLog([`🔍 Scraping "${campaignForm.category} in ${campaignForm.city}"...`]);
    setShowNewCampaign(false);
    const log = (msg) => setRunLog(prev => [...prev, msg]);
    try {
      log(`🧠 Analyzing + building sites + writing emails...`);
      const res = await callFn("runPipeline", {
        city: campaignForm.city,
        category: campaignForm.category,
        mode: "campaign",
      });
      if (res?.error) throw new Error(res.error);
      log(`🎉 Done — ${res.businesses_found || 0} leads found, ${res.sites_generated || 0} sites built`);
      await loadData();
    } catch (err) {
      log(`❌ ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  async function runFullPipeline(business) {
    setRunLog([`🔄 Running pipeline for ${business.name}...`]);
    setRunning(true);
    const log = (msg) => setRunLog(prev => [...prev, msg]);
    try {
      log(`🧠 Analyzing...`);
      const analyzeRes = await callFn("analyzePersonality", { business_id: business.id });
      if (analyzeRes?.error) throw new Error(analyzeRes.error);
      log(`✅ ${analyzeRes?.profile?.design_archetype}`);

      log(`🎨 Generating site...`);
      const siteRes = await callFn("generateSite", { business_id: business.id });
      if (siteRes?.error) throw new Error(siteRes.error);
      log(`✅ ${siteRes?.layout} · ${siteRes?.palette}`);

      log(`✍️ Writing email...`);
      const emailRes = await callFn("writeEmail", { business_id: business.id });
      if (emailRes?.error) throw new Error(emailRes.error);
      log(`✅ "${emailRes?.subject}"`);

      log(`🎉 Done!`);
      await loadData();
    } catch (err) {
      log(`❌ ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  async function sendEmailToLead(business, emailCampaign) {
    if (!business.email) {
      alert("No email address on file. Add one in the email field and save first.");
      return;
    }
    if (emailCampaign.status === "sent") {
      if (!confirm("This email was already sent. Send again?")) return;
    }
    setSending(true);
    try {
      const res = await callFn("sendEmail", {
        campaign_id: emailCampaign.id,
        to_email: business.email,
        from_name: "Alex",
      });
      if (res?.error) throw new Error(res.error);
      await callFn("updateRecord", { entity: "Business", id: business.id, data: { status: "email_sent" } });
      await loadData();
      alert(`✅ Sent to ${business.email}`);
    } catch (err) {
      alert("Send failed: " + err.message);
    } finally {
      setSending(false);
    }
  }

  async function saveEmailDraft(campaignId, subject, body) {
    await callFn("updateRecord", { entity: "EmailCampaign", id: campaignId, data: { subject, body } });
    await loadData();
    setEditEmail(null);
  }

  async function markConverted(business) {
    await callFn("updateRecord", { entity: "Business", id: business.id, data: { status: "converted" } });
    await loadData();
  }

  const hotLeads = businesses.filter(b => ["replied", "converted"].includes(b.status));
  const filteredBusinesses = tab === "hot"
    ? hotLeads
    : filter === "all" ? businesses : businesses.filter(b => b.status === filter);

  const totalSites = businesses.filter(b => ["site_generated","email_sent","opened","replied","converted"].includes(b.status)).length;
  const totalSent = businesses.filter(b => ["email_sent","opened","replied","converted"].includes(b.status)).length;
  const totalOpened = businesses.filter(b => ["opened","replied","converted"].includes(b.status)).length;
  const totalReplied = businesses.filter(b => ["replied","converted"].includes(b.status)).length;
  const totalConverted = businesses.filter(b => b.status === "converted").length;
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
  const replyRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
  const convRate = totalReplied ? Math.round((totalConverted / totalReplied) * 100) : 0;

  const recentSites = Object.values(sites).slice(-10);
  const archetypeCounts = {};
  recentSites.forEach(s => { archetypeCounts[s.design_archetype] = (archetypeCounts[s.design_archetype] || 0) + 1; });
  const dominant = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0];
  const varietyWarning = dominant && dominant[1] >= 5;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👻</span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">GhostSites</h1>
            <p className="text-xs text-gray-500">Autonomous lead-gen · Claude + Google Places</p>
          </div>
        </div>
        <button onClick={() => setShowNewCampaign(true)}
          className="bg-lime-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-lime-300 transition-colors">
          + New Campaign
        </button>
      </header>

      <div className="grid grid-cols-6 border-b border-gray-800">
        {[
          { label: "Sites Generated", value: totalSites, color: "text-blue-400" },
          { label: "Emails Sent", value: totalSent, color: "text-purple-400" },
          { label: "Open Rate", value: `${openRate}%`, color: "text-yellow-400" },
          { label: "Reply Rate", value: `${replyRate}%`, color: "text-green-400" },
          { label: "Converted", value: totalConverted, color: "text-emerald-400" },
          { label: "Conv. Rate", value: `${convRate}%`, color: "text-lime-400" },
        ].map((stat, i) => (
          <div key={i} className="px-6 py-4 border-r border-gray-800 last:border-r-0">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {varietyWarning && (
        <div className="bg-yellow-900/20 border-b border-yellow-800/50 px-6 py-2 text-xs text-yellow-400">
          ⚠️ Design Variety Alert: <strong>{dominant[0]}</strong> used {dominant[1]}/10 recent sites.
        </div>
      )}

      <div className="flex" style={{ height: "calc(100vh - 152px)" }}>
        <div className={`${selected ? "w-1/2 border-r border-gray-800" : "w-full"} flex flex-col overflow-hidden`}>
          <div className="flex border-b border-gray-800 px-6 gap-1">
            {[
              { id: "leads", label: "All Leads", count: businesses.length },
              { id: "hot", label: "🔥 Hot Leads", count: hotLeads.length },
              { id: "analytics", label: "Analytics" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-lime-400 text-lime-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                {t.label}
                {t.count != null && <span className="ml-2 bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>}
              </button>
            ))}
          </div>

          {tab === "analytics" ? (
            <AnalyticsPanel businesses={businesses} sites={sites} />
          ) : (
            <>
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800 overflow-x-auto">
                {["all","scraped","site_generated","email_sent","opened","replied","converted"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-lime-400 text-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                    {f === "all" ? "All" : f.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {(running || runLog.length > 0) && (
                  <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      {running && <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />}
                      <span className="text-xs font-semibold text-lime-400">{running ? "Pipeline running..." : "Last run complete"}</span>
                    </div>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                      {runLog.map((msg, i) => <div key={i} className="text-xs text-gray-400 font-mono">{msg}</div>)}
                    </div>
                  </div>
                )}

                {filteredBusinesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <span className="text-5xl mb-4">👻</span>
                    <p className="text-sm font-medium">No leads yet</p>
                    <p className="text-xs mt-1">Start a campaign to pull real Google Maps listings</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Business", "Category", "Status", "Rating", "Email"].map(h => (
                          <th key={h} className="text-left text-xs text-gray-500 px-6 py-3 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map(biz => {
                        const ec = emailCampaigns[biz.id];
                        const isSel = selected?.id === biz.id;
                        return (
                          <tr key={biz.id} onClick={() => setSelected(isSel ? null : biz)}
                            className={`border-b border-gray-900 cursor-pointer transition-colors ${isSel ? "bg-gray-900" : "hover:bg-gray-900/50"}`}>
                            <td className="px-6 py-3.5">
                              <div className="font-medium text-white text-sm">{biz.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{biz.city}{biz.state ? `, ${biz.state}` : ""}</div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-400 capitalize">{biz.category}</td>
                            <td className="px-4 py-3.5">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[biz.status] || "bg-gray-800 text-gray-400"}`}>
                                {STATUS_ICONS[biz.status]} {biz.status?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-yellow-400">{biz.rating ? `⭐ ${biz.rating}` : "—"}</td>
                            <td className="px-4 py-3.5">
                              {ec ? (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ec.status] || "bg-gray-800 text-gray-400"}`}>{ec.status}</span>
                              ) : <span className="text-xs text-gray-600">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>

        {selected && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50">
              <div>
                <h2 className="font-bold text-white text-sm">{selected.name}</h2>
                <p className="text-xs text-gray-500">{selected.city}{selected.state ? `, ${selected.state}` : ""} · {selected.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {!sites[selected.id] && (
                  <button onClick={() => runFullPipeline(selected)} disabled={running}
                    className="text-xs bg-lime-400 text-gray-900 px-3 py-1.5 rounded font-bold hover:bg-lime-300 disabled:opacity-50 transition-colors">
                    Run Pipeline
                  </button>
                )}
                {selected.status === "replied" && (
                  <button onClick={() => markConverted(selected)}
                    className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded font-bold hover:bg-emerald-400 transition-colors">
                    Mark Converted ✓
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center">×</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sites[selected.id] ? (
                <div className="border-b border-gray-800">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-lime-400 font-semibold">{sites[selected.id].design_archetype}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-500">{sites[selected.id].layout_variant?.replace(/_/g, " ")}</span>
                    </div>
                    <button onClick={() => {
                      window.open(sites[selected.id].subdomain_url, "_blank");
                    }} className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-800 rounded">
                      Open full ↗
                    </button>
                  </div>
                  <div className="h-72 overflow-hidden bg-gray-800">
                    {previewHtml[sites[selected.id].id] ? (
                      <iframe
                        srcDoc={previewHtml[sites[selected.id].id]}
                        className="w-full h-full border-0 pointer-events-none"
                        sandbox="allow-same-origin"
                        title="Site Preview"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                        Loading preview...
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-900 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Palette <span className="text-gray-300">#{sites[selected.id].color_palette_id}</span></span>
                    <span>Font <span className="text-gray-300">#{sites[selected.id].typography_pair_id}</span></span>
                    <span>FX <span className="text-gray-300">{(sites[selected.id].micro_interactions || []).join(", ")}</span></span>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-10 text-center border-b border-gray-800 text-gray-600">
                  <p className="text-3xl mb-2">🌐</p>
                  <p className="text-sm">No site yet — click "Run Pipeline"</p>
                </div>
              )}

              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Phone", selected.phone],
                    ["Rating", selected.rating ? `⭐ ${selected.rating} (${selected.review_count})` : "—"],
                    ["Address", selected.address],
                    ["Hours", selected.hours],
                    ["Owner", selected.owner_name || "—"],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-gray-500">{k}: </span><span className="text-gray-200">{v || "—"}</span></div>
                  ))}
                </div>

                {selected.personality_profile && (
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="text-xs text-lime-400 font-semibold mb-2">Claude's Read</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-gray-500">Archetype:</span> <span className="text-gray-200">{selected.personality_profile.design_archetype}</span></div>
                      <div><span className="text-gray-500">Keywords:</span> <span className="text-gray-200">{(selected.personality_profile.personality_keywords || []).join(", ")}</span></div>
                      <div><span className="text-gray-500">Tone:</span> <span className="text-gray-200">{selected.personality_profile.tone_of_voice}</span></div>
                      <div><span className="text-gray-500">Differentiator:</span> <span className="text-gray-200">{selected.personality_profile.key_differentiator}</span></div>
                      {selected.personality_profile.best_review_quote && (
                        <div className="mt-2 italic text-gray-400 border-l-2 border-gray-700 pl-3">
                          "{selected.personality_profile.best_review_quote.text}" — {selected.personality_profile.best_review_quote.author}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(selected.top_reviews || []).length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">Top Reviews</div>
                    <div className="space-y-2">
                      {selected.top_reviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="text-xs text-gray-400 border-l-2 border-gray-700 pl-3">
                          <span className="text-yellow-400">{"⭐".repeat(Math.min(r.rating, 5))} </span>
                          "{r.text?.slice(0, 120)}{r.text?.length > 120 ? "..." : ""}" — {r.author}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cold Email Draft</h3>
                  {emailCampaigns[selected.id] && !editEmail && (
                    <button onClick={() => setEditEmail({ ...emailCampaigns[selected.id] })}
                      className="text-xs text-gray-500 hover:text-white px-2 py-1 bg-gray-800 rounded">Edit</button>
                  )}
                </div>

                {emailCampaigns[selected.id] ? (
                  editEmail?.id === emailCampaigns[selected.id].id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Subject</label>
                        <input value={editEmail.subject} onChange={e => setEditEmail(p => ({ ...p, subject: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Body</label>
                        <textarea value={editEmail.body} onChange={e => setEditEmail(p => ({ ...p, body: e.target.value }))}
                          rows={8} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none focus:border-lime-400 focus:outline-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEmailDraft(emailCampaigns[selected.id].id, editEmail.subject, editEmail.body)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded">Save</button>
                        <button onClick={() => setEditEmail(null)}
                          className="px-4 text-gray-500 hover:text-white text-sm py-2 rounded border border-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                      <div className="text-xs text-gray-500 mb-1">Subject</div>
                      <div className="text-sm font-medium text-white mb-4">{emailCampaigns[selected.id].subject}</div>
                      <div className="text-xs text-gray-500 mb-1">Body</div>
                      <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-mono bg-gray-950 rounded p-3">
                        {emailCampaigns[selected.id].body}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
                        <input
                          placeholder="Recipient email address..."
                          defaultValue={selected.email || ""}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                          onBlur={async (e) => {
                            if (e.target.value && e.target.value !== selected.email) {
                              await callFn("updateRecord", { entity: "Business", id: selected.id, data: { email: e.target.value } });
                              setSelected(prev => ({ ...prev, email: e.target.value }));
                            }
                          }}
                        />
                        {emailCampaigns[selected.id].status !== "draft" && (
                          <div className="text-xs text-center text-gray-500 pb-1">
                            Status: <span className="text-lime-400 font-medium">{emailCampaigns[selected.id].status}</span>
                            {emailCampaigns[selected.id].sent_at && ` · Sent ${new Date(emailCampaigns[selected.id].sent_at).toLocaleDateString()}`}
                          </div>
                        )}
                        <button onClick={() => sendEmailToLead(selected, emailCampaigns[selected.id])} disabled={sending}
                          className="w-full bg-lime-400 text-gray-900 py-2.5 rounded font-bold text-sm hover:bg-lime-300 disabled:opacity-50">
                          {sending ? "Sending via Gmail..." : emailCampaigns[selected.id].status === "draft" ? "Send via Gmail →" : "Resend →"}
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-600 text-center py-6 bg-gray-900 rounded-lg border border-gray-800">
                    No email draft yet — run the pipeline first
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👻</span>
              <div>
                <h2 className="text-xl font-bold text-white">New Campaign</h2>
                <p className="text-xs text-gray-500">Real Google Maps listings · sites built by Claude</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">City</label>
                <input type="text" placeholder="e.g. Brooklyn, Austin, Miami"
                  value={campaignForm.city} onChange={e => setCampaignForm(p => ({ ...p, city: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && startCampaign()}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Business Category</label>
                <input type="text" placeholder="e.g. barbers, taco spots, auto shops"
                  value={campaignForm.category} onChange={e => setCampaignForm(p => ({ ...p, category: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && startCampaign()}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={startCampaign} disabled={!campaignForm.city || !campaignForm.category || running}
                className="flex-1 bg-lime-400 text-gray-900 py-3 rounded-xl font-bold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {running ? "Running..." : "Launch Campaign →"}
              </button>
              <button onClick={() => setShowNewCampaign(false)}
                className="px-6 text-gray-400 hover:text-white border border-gray-700 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ businesses, sites }) {
  const statusCounts = {};
  businesses.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });
  const archetypeCounts = {};
  const layoutCounts = {};
  Object.values(sites).forEach(s => {
    archetypeCounts[s.design_archetype] = (archetypeCounts[s.design_archetype] || 0) + 1;
    layoutCounts[s.layout_variant] = (layoutCounts[s.layout_variant] || 0) + 1;
  });
  const total = businesses.length || 1;
  const totalSites = Object.values(sites).length || 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline Funnel</h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="text-xs text-gray-400 w-36 capitalize">{status.replace(/_/g, " ")}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className="bg-lime-400 h-2 rounded-full" style={{ width: `${Math.min((count / total) * 100, 100)}%` }} />
              </div>
              <div className="text-xs text-white w-6 text-right font-mono">{count}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Design Archetype Mix</h3>
        <div className="space-y-3">
          {Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).map(([arch, count]) => (
            <div key={arch} className="flex items-center gap-3">
              <div className="text-xs text-gray-400 w-36">{arch}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${Math.min((count / totalSites) * 100, 100)}%` }} />
              </div>
              <div className="text-xs text-white w-6 text-right font-mono">{count}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Layout Variants</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(layoutCounts).map(([layout, count]) => (
            <div key={layout} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400">{layout.replace(/_/g, " ")}</div>
              <div className="text-2xl font-bold text-white mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
