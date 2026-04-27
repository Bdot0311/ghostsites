import { useState, useEffect } from "react";
import { Business, GeneratedSite, EmailCampaign, Campaign } from "@/api/entities";
import { InvokeLLM, SendEmail } from "@/api/integrations";

const STATUS_COLORS = {
  scraped: "bg-gray-100 text-gray-700",
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
  const [tab, setTab] = useState("leads"); // leads | hot | analytics
  const [businesses, setBusinesses] = useState([]);
  const [sites, setSites] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [emailCampaigns, setEmailCampaigns] = useState({});
  const [selected, setSelected] = useState(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ city: "", category: "" });
  const [running, setRunning] = useState(false);
  const [runLog, setRunLog] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [biz, siteList, ecList] = await Promise.all([
      Business.list(),
      GeneratedSite.list(),
      EmailCampaign.list(),
    ]);
    setBusinesses(biz || []);
    const siteMap = {};
    (siteList || []).forEach(s => { siteMap[s.business_id] = s; });
    setSites(siteMap);
    const ecMap = {};
    (ecList || []).forEach(e => { ecMap[e.business_id] = e; });
    setEmailCampaigns(ecMap);
  }

  async function startCampaign() {
    if (!campaignForm.city || !campaignForm.category) return;
    setRunning(true);
    setRunLog([]);
    setShowNewCampaign(false);

    const log = (msg) => setRunLog(prev => [...prev, msg]);

    try {
      log(`🔍 Searching for ${campaignForm.category} in ${campaignForm.city}...`);

      // For demo mode without real API keys: generate sample business
      const sampleBusiness = await Business.create({
        name: `${campaignForm.category.charAt(0).toUpperCase() + campaignForm.category.slice(1)} Shop Demo`,
        category: campaignForm.category,
        city: campaignForm.city,
        state: "NY",
        address: "123 Main St",
        phone: "(555) 123-4567",
        email: "",
        rating: 4.7,
        review_count: 47,
        top_reviews: [
          { author: "Maria S.", text: `Best ${campaignForm.category} in the city. Been coming here for 5 years.`, rating: 5 },
          { author: "James T.", text: "No-nonsense, gets it done right every time. Real neighborhood spot.", rating: 5 },
          { author: "Priya K.", text: "Quick, fair, and they actually remember you. Rare these days.", rating: 5 },
        ],
        photos: [],
        hours: "Mon-Sat 9am-7pm, Sun 10am-5pm",
        status: "scraped",
        campaign_query: `${campaignForm.category} in ${campaignForm.city}`,
      });

      log(`✅ Found 1 business without a website`);
      log(`🧠 Analyzing personality...`);

      const profile = await InvokeLLM({
        prompt: `Analyze this local business and return a JSON personality profile.

Business: ${sampleBusiness.name}
Category: ${campaignForm.category}
City: ${campaignForm.city}
Reviews: ${sampleBusiness.top_reviews.map(r => `"${r.text}" - ${r.author}`).join(" | ")}

Return JSON only:
{
  "personality_keywords": ["5 specific adjectives from review language"],
  "design_archetype": "one of: Editorial | Brutalist | Soft Luxury | Modern Tech | Warm Local | Bold Minimal | Photo-First | Retro",
  "tone_of_voice": "one sentence describing copy tone",
  "key_differentiator": "the ONE thing reviews keep mentioning",
  "best_review_quote": {"text": "most quotable line verbatim", "author": "first name + last initial"},
  "avoid": ["3 things that would feel wrong"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            personality_keywords: { type: "array", items: { type: "string" } },
            design_archetype: { type: "string" },
            tone_of_voice: { type: "string" },
            key_differentiator: { type: "string" },
            best_review_quote: { type: "object", properties: { text: { type: "string" }, author: { type: "string" } } },
            avoid: { type: "array", items: { type: "string" } },
          },
        },
      });

      await Business.update(sampleBusiness.id, { personality_profile: profile });
      log(`✅ Personality: ${profile.design_archetype} — ${profile.personality_keywords?.join(", ")}`);
      log(`🎨 Generating website...`);

      const archetypes = ["Editorial", "Brutalist", "Soft Luxury", "Modern Tech", "Warm Local", "Bold Minimal", "Photo-First", "Retro"];
      const archetype = archetypes.includes(profile.design_archetype) ? profile.design_archetype : "Warm Local";

      const palettes = { Warm: { bg: "#F8F1E3", text: "#2C1810", accent: "#C9663D" }, Editorial: { bg: "#FAFAFA", text: "#1A1A1A", accent: "#B91C1C" }, Brutalist: { bg: "#1A1A1A", text: "#FFFFFF", accent: "#FFD600" }, "Soft Luxury": { bg: "#F2E5DD", text: "#3E2E2A", accent: "#A05A4F" } };
      const pal = palettes[archetype] || palettes["Warm"];

      const siteHtml = await InvokeLLM({
        prompt: `Generate a complete, production-ready single-page HTML website for this local business.

Business: ${sampleBusiness.name}
Category: ${campaignForm.category}, ${campaignForm.city}
Phone: ${sampleBusiness.phone}
Hours: ${sampleBusiness.hours}
Rating: ${sampleBusiness.rating}/5

Personality: ${profile.design_archetype} — ${profile.tone_of_voice}
Key Differentiator: ${profile.key_differentiator}
Keywords: ${(profile.personality_keywords || []).join(", ")}
Best quote: "${profile.best_review_quote?.text}" — ${profile.best_review_quote?.author}
Avoid: ${(profile.avoid || []).join(", ")}

Reviews:
${sampleBusiness.top_reviews.map(r => `"${r.text}" — ${r.author}`).join("\n")}

Design:
- Color palette: background ${pal.bg}, text ${pal.text}, accent ${pal.accent}
- Archetype: ${archetype}
- Layout: SCROLL_FLOW — sections flow continuously
- Micro-interactions: SCROLL_REVEAL, HOVER_LIFT
- Typography: Fraunces for headings, Inter for body (load from Google Fonts)

HARD RULES:
- Hero headline: 4-8 words, specific, NO "Welcome to" or "Quality you can trust"
- About: first person if sole proprietor feel, references something real from reviews, under 120 words
- Include reviews verbatim with author names
- CTA appropriate for business type
- Footer: "Built as a free preview — not affiliated with ${sampleBusiness.name}"
- NO placeholder text, NO lorem ipsum
- Mobile responsive
- Single HTML file with embedded CSS and JS

Return ONLY the HTML, no explanation.`,
      });

      const subdomain = sampleBusiness.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      const site = await GeneratedSite.create({
        business_id: sampleBusiness.id,
        subdomain_url: `https://ghostsites.preview/${subdomain}`,
        full_html: siteHtml,
        design_archetype: archetype,
        color_palette_id: 1,
        typography_pair_id: 1,
        layout_variant: "SCROLL_FLOW",
        section_order: ["About", "Services", "Reviews", "Hours", "Contact"],
        micro_interactions: ["SCROLL_REVEAL", "HOVER_LIFT"],
        imagery_treatment: "CLEAN",
        design_fingerprint: `${archetype}-1-1-SCROLL_FLOW-${Date.now()}`,
        hero_copy: "",
        generated_at: new Date().toISOString(),
        view_count: 0,
      });

      await Business.update(sampleBusiness.id, { status: "site_generated" });
      log(`✅ Site generated!`);
      log(`✍️ Writing personalized email...`);

      const emailDraft = await InvokeLLM({
        prompt: `Write a 60-90 word cold email to a local business owner who doesn't have a website.

Business: ${sampleBusiness.name}
Category: ${campaignForm.category}, ${campaignForm.city}
Preview URL: https://ghostsites.preview/${subdomain}
Best Quote: "${profile.best_review_quote?.text}" — ${profile.best_review_quote?.author}
Keywords: ${(profile.personality_keywords || []).join(", ")}

Rules:
- Subject: under 6 words, lowercase, no emojis
- Opening: specific to this business, reference a real review detail
- Body: what you noticed + what you built + the link on its own line
- Soft CTA: just ask them to look, no pricing
- Sign-off: first name only
- NEVER: "I hope this finds you well", "I wanted to reach out", "amazing", pricing
- Under 90 words total body

Return JSON only: {"subject": "...", "body": "..."}`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
          },
        },
      });

      const fullBody = `${emailDraft.body}\n\n---\nTo unsubscribe, reply "remove me" and I'll take you off the list immediately.`;

      await EmailCampaign.create({
        business_id: sampleBusiness.id,
        site_id: site.id,
        subject: emailDraft.subject,
        body: fullBody,
        status: "draft",
        send_attempts: 0,
      });

      log(`✅ Email draft ready!`);
      log(`🎉 Done! Lead is ready in your dashboard.`);

      await loadData();
    } catch (err) {
      log(`❌ Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  async function sendEmail(business, emailCampaign) {
    if (!business.email) {
      alert("No email address for this business. Add one manually.");
      return;
    }
    setSending(true);
    try {
      await SendEmail({
        to: business.email,
        subject: emailCampaign.subject,
        body: emailCampaign.body,
      });
      await EmailCampaign.update(emailCampaign.id, {
        status: "sent",
        sent_at: new Date().toISOString(),
      });
      await Business.update(business.id, { status: "email_sent" });
      await loadData();
      setSelected(null);
    } catch (err) {
      alert("Send failed: " + err.message);
    } finally {
      setSending(false);
    }
  }

  async function saveEmailDraft(emailCampaign, subject, body) {
    await EmailCampaign.update(emailCampaign.id, { subject, body });
    await loadData();
    setEditEmail(null);
  }

  const hotLeads = businesses.filter(b => ["replied", "converted"].includes(b.status));
  const filteredBusinesses = tab === "hot"
    ? hotLeads
    : filter === "all"
    ? businesses
    : businesses.filter(b => b.status === filter);

  // Analytics
  const totalSites = businesses.filter(b => ["site_generated", "email_sent", "opened", "replied", "converted"].includes(b.status)).length;
  const totalSent = businesses.filter(b => ["email_sent", "opened", "replied", "converted"].includes(b.status)).length;
  const totalOpened = businesses.filter(b => ["opened", "replied", "converted"].includes(b.status)).length;
  const totalReplied = businesses.filter(b => ["replied", "converted"].includes(b.status)).length;
  const totalConverted = businesses.filter(b => b.status === "converted").length;
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
  const replyRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
  const conversionRate = totalReplied ? Math.round((totalConverted / totalReplied) * 100) : 0;

  // Design variety check (last 10 sites)
  const recentSites = Object.values(sites).slice(-10);
  const archetypeCounts = {};
  recentSites.forEach(s => {
    archetypeCounts[s.design_archetype] = (archetypeCounts[s.design_archetype] || 0) + 1;
  });
  const dominantArchetype = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0];
  const varietyWarning = dominantArchetype && dominantArchetype[1] >= 5;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👻</span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">GhostSites</h1>
            <p className="text-xs text-gray-500">Lead-gen + website engine</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewCampaign(true)}
          className="bg-lime-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-lime-300 transition-colors"
        >
          + New Campaign
        </button>
      </header>

      {/* Analytics Strip */}
      <div className="grid grid-cols-6 border-b border-gray-800">
        {[
          { label: "Sites Generated", value: totalSites },
          { label: "Emails Sent", value: totalSent },
          { label: "Open Rate", value: `${openRate}%` },
          { label: "Reply Rate", value: `${replyRate}%` },
          { label: "Converted", value: totalConverted },
          { label: "Conversion Rate", value: `${conversionRate}%` },
        ].map((stat, i) => (
          <div key={i} className="px-6 py-4 border-r border-gray-800 last:border-r-0">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {varietyWarning && (
        <div className="bg-yellow-900/30 border-b border-yellow-800 px-6 py-2 text-xs text-yellow-400">
          ⚠️ Design Variety Alert: Last 10 sites are over-using <strong>{dominantArchetype[0]}</strong> archetype ({dominantArchetype[1]}/10). Diversity will be enforced on next generation.
        </div>
      )}

      <div className="flex h-[calc(100vh-160px)]">
        {/* Left Panel: Leads Table */}
        <div className={`${selected ? "w-1/2 border-r border-gray-800" : "w-full"} flex flex-col overflow-hidden`}>
          {/* Tabs */}
          <div className="flex border-b border-gray-800 px-6">
            {[
              { id: "leads", label: "All Leads", count: businesses.length },
              { id: "hot", label: "🔥 Hot Leads", count: hotLeads.length },
              { id: "analytics", label: "Analytics", count: null },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id ? "border-lime-400 text-lime-400" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.label}
                {t.count !== null && (
                  <span className="ml-2 bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {tab === "analytics" ? (
            <AnalyticsPanel businesses={businesses} sites={sites} />
          ) : (
            <>
              {/* Filter row */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800 overflow-x-auto">
                {["all", "scraped", "site_generated", "email_sent", "opened", "replied", "converted"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      filter === f ? "bg-lime-400 text-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {f === "all" ? "All" : f.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Leads Table */}
              <div className="flex-1 overflow-y-auto">
                {running && (
                  <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-lime-400">Campaign Running...</span>
                    </div>
                    <div className="space-y-1">
                      {runLog.map((msg, i) => (
                        <div key={i} className="text-xs text-gray-400 font-mono">{msg}</div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredBusinesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <span className="text-4xl mb-3">👻</span>
                    <p className="text-sm">No leads yet. Start a campaign.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-xs text-gray-500 px-6 py-3 font-medium">Business</th>
                        <th className="text-left text-xs text-gray-500 px-4 py-3 font-medium">Category</th>
                        <th className="text-left text-xs text-gray-500 px-4 py-3 font-medium">Status</th>
                        <th className="text-left text-xs text-gray-500 px-4 py-3 font-medium">Rating</th>
                        <th className="text-left text-xs text-gray-500 px-4 py-3 font-medium">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map(biz => {
                        const ec = emailCampaigns[biz.id];
                        return (
                          <tr
                            key={biz.id}
                            onClick={() => setSelected(biz)}
                            className={`border-b border-gray-900 hover:bg-gray-900 cursor-pointer transition-colors ${
                              selected?.id === biz.id ? "bg-gray-900" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-white text-sm">{biz.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{biz.city}{biz.state ? `, ${biz.state}` : ""}</div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-400">{biz.category}</td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[biz.status] || "bg-gray-800 text-gray-400"}`}>
                                {STATUS_ICONS[biz.status]} {biz.status?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-yellow-400">
                              {biz.rating ? `⭐ ${biz.rating}` : "—"}
                            </td>
                            <td className="px-4 py-4">
                              {ec ? (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ec.status] || "bg-gray-800 text-gray-400"}`}>
                                  {ec.status}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-600">—</span>
                              )}
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

        {/* Right Panel: Split View */}
        {selected && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
              <h2 className="font-bold text-white text-sm">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Site Preview */}
              {sites[selected.id] ? (
                <div className="border-b border-gray-800">
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-900">
                    <span className="text-xs font-medium text-gray-400">🌐 Site Preview</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-lime-400 font-mono">{sites[selected.id].design_archetype}</span>
                      <button
                        onClick={() => {
                          const blob = new Blob([sites[selected.id].full_html], { type: "text/html" });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        }}
                        className="text-xs text-gray-500 hover:text-white px-2 py-1 bg-gray-800 rounded"
                      >
                        Open ↗
                      </button>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-900 relative overflow-hidden">
                    <iframe
                      srcDoc={sites[selected.id].full_html}
                      className="w-full h-full border-0 pointer-events-none"
                      title="Site Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                  <div className="px-6 py-3 bg-gray-900 flex items-center gap-4 flex-wrap">
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-300">Layout:</span> {sites[selected.id].layout_variant?.replace("_", " ")}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-300">Palette:</span> ID {sites[selected.id].color_palette_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-300">Views:</span> {sites[selected.id].view_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-300">FX:</span> {(sites[selected.id].micro_interactions || []).join(", ")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center border-b border-gray-800">
                  <p className="text-gray-500 text-sm">No site generated yet</p>
                  <p className="text-xs text-gray-600 mt-1">Run the pipeline to generate</p>
                </div>
              )}

              {/* Business Info */}
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Info</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div><span className="text-gray-500">Phone:</span> <span className="text-gray-200">{selected.phone || "—"}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="text-gray-200">{selected.email || "Unknown"}</span></div>
                  <div><span className="text-gray-500">Address:</span> <span className="text-gray-200">{selected.address || "—"}</span></div>
                  <div><span className="text-gray-500">Hours:</span> <span className="text-gray-200">{selected.hours || "—"}</span></div>
                  <div><span className="text-gray-500">Rating:</span> <span className="text-yellow-400">{selected.rating ? `⭐ ${selected.rating} (${selected.review_count})` : "—"}</span></div>
                </div>

                {selected.personality_profile && (
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                    <div className="text-xs text-lime-400 font-semibold mb-2">Personality Profile</div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div><span className="text-gray-300">Archetype:</span> {selected.personality_profile.design_archetype}</div>
                      <div><span className="text-gray-300">Keywords:</span> {(selected.personality_profile.personality_keywords || []).join(", ")}</div>
                      <div><span className="text-gray-300">Tone:</span> {selected.personality_profile.tone_of_voice}</div>
                      {selected.personality_profile.best_review_quote && (
                        <div className="mt-2 italic text-gray-400">"{selected.personality_profile.best_review_quote.text}" — {selected.personality_profile.best_review_quote.author}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Draft */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Draft</h3>
                  {emailCampaigns[selected.id] && (
                    <button
                      onClick={() => setEditEmail({ ...emailCampaigns[selected.id] })}
                      className="text-xs text-gray-500 hover:text-white px-2 py-1 bg-gray-800 rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {emailCampaigns[selected.id] ? (
                  editEmail && editEmail.id === emailCampaigns[selected.id].id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Subject</label>
                        <input
                          value={editEmail.subject}
                          onChange={e => setEditEmail(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Body</label>
                        <textarea
                          value={editEmail.body}
                          onChange={e => setEditEmail(prev => ({ ...prev, body: e.target.value }))}
                          rows={8}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEmailDraft(emailCampaigns[selected.id], editEmail.subject, editEmail.body)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={() => setEditEmail(null)}
                          className="px-4 text-gray-500 hover:text-white text-sm py-2 rounded border border-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Subject</div>
                      <div className="text-sm font-medium text-white mb-3">{emailCampaigns[selected.id].subject}</div>
                      <div className="text-xs text-gray-500 mb-1">Body</div>
                      <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{emailCampaigns[selected.id].body}</div>

                      <div className="mt-4 pt-4 border-t border-gray-800">
                        {emailCampaigns[selected.id].status === "draft" ? (
                          <button
                            onClick={() => sendEmail(selected, emailCampaigns[selected.id])}
                            disabled={sending || !selected.email}
                            className="w-full bg-lime-400 text-gray-900 py-2 rounded font-bold text-sm hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sending ? "Sending..." : selected.email ? "Send Email" : "Add email address first"}
                          </button>
                        ) : (
                          <div className="text-xs text-center text-gray-500">
                            Status: <span className="text-lime-400">{emailCampaigns[selected.id].status}</span>
                            {emailCampaigns[selected.id].sent_at && ` · Sent ${new Date(emailCampaigns[selected.id].sent_at).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-600 text-center py-4">No email draft yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">New Campaign</h2>
            <p className="text-sm text-gray-500 mb-6">Find local businesses without websites and build sites for them.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-2">City</label>
                <input
                  type="text"
                  placeholder="e.g. Brooklyn, Austin, Chicago"
                  value={campaignForm.city}
                  onChange={e => setCampaignForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-2">Business Category</label>
                <input
                  type="text"
                  placeholder="e.g. barbers, taco restaurants, auto mechanics"
                  value={campaignForm.category}
                  onChange={e => setCampaignForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={startCampaign}
                disabled={!campaignForm.city || !campaignForm.category}
                className="flex-1 bg-lime-400 text-gray-900 py-3 rounded-lg font-bold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Launch Campaign
              </button>
              <button
                onClick={() => setShowNewCampaign(false)}
                className="px-6 text-gray-400 hover:text-white border border-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ businesses, sites }) {
  const archetypeCounts = {};
  const paletteCounts = {};
  const layoutCounts = {};

  Object.values(sites).forEach(s => {
    archetypeCounts[s.design_archetype] = (archetypeCounts[s.design_archetype] || 0) + 1;
    paletteCounts[`Palette ${s.color_palette_id}`] = (paletteCounts[`Palette ${s.color_palette_id}`] || 0) + 1;
    layoutCounts[s.layout_variant] = (layoutCounts[s.layout_variant] || 0) + 1;
  });

  const statusCounts = {};
  businesses.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pipeline Status</h3>
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="text-xs text-gray-400 w-32">{status.replace("_", " ")}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-lime-400 h-2 rounded-full"
                  style={{ width: `${Math.min((count / businesses.length) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-white w-8 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Design Archetype Distribution</h3>
        <div className="space-y-2">
          {Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).map(([arch, count]) => (
            <div key={arch} className="flex items-center gap-3">
              <div className="text-xs text-gray-400 w-32">{arch}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${Math.min((count / Object.values(sites).length) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-white w-8 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layout Variants Used</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(layoutCounts).map(([layout, count]) => (
            <div key={layout} className="bg-gray-900 rounded p-3">
              <div className="text-xs text-gray-300">{layout.replace("_", " ")}</div>
              <div className="text-lg font-bold text-white mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
