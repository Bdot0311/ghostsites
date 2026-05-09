import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  Globe,
  Mail,
  Users,
  Building2,
  Loader2,
  Eye,
  Sparkles,
  Send,
  Trash2,
  MapPin,
  Star,
  Settings,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string; emailId?: number } | null>(null);
  const emailApiUrl = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("ghostsites_api_keys") || "{}").emailApiUrl as string | undefined; }
    catch { return undefined; }
  }, []);
  const [activeTab, setActiveTab] = useState("leads");

  const utils = trpc.useUtils();

  // Queries
  const { data: stats } = trpc.business.stats.useQuery();
  const { data: businesses, isLoading: loadingBusinesses } = trpc.business.list.useQuery(
    { search: searchQuery || undefined, limit: 50 },
  );
  const { data: campaigns } = trpc.scrape.listCampaigns.useQuery();

  // Mutations
  const scrapeMutation = trpc.scrape.start.useMutation({
    onSuccess: () => {
      toast.success("Scraping started! Refresh to see results.");
      utils.scrape.listCampaigns.invalidate();
      utils.business.stats.invalidate();
      utils.business.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateSiteMutation = trpc.site.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Site generated with ${data.archetype} design!`);
      utils.business.list.invalidate();
      utils.business.stats.invalidate();
      setPreviewHtml(data.html);
      setPreviewName(data.archetype);
    },
    onError: (err) => toast.error(err.message),
  });

  const sendEmailMutation = trpc.email.send.useMutation({
    onSuccess: () => {
      toast.success("Email sent via your platform!");
      setEmailPreview(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const generateEmailMutation = trpc.email.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Email generated!");
      setEmailPreview(data);
      utils.business.list.invalidate();
      utils.email.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const analyzePersonalityMutation = trpc.site.analyzePersonality.useMutation({
    onSuccess: () => toast.success("Personality analyzed!"),
    onError: (err) => toast.error(err.message),
  });

  const exportZipMutation = trpc.site.exportZip.useMutation({
    onSuccess: (data) => {
      // Trigger file download
      const byteChars = atob(data.base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Site ZIP downloaded!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCampaignMutation = trpc.scrape.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted");
      utils.scrape.listCampaigns.invalidate();
      utils.business.stats.invalidate();
    },
  });

  const handleScrape = () => {
    if (!searchQuery || !searchCity || !searchCategory) {
      toast.error("Fill in all fields");
      return;
    }
    scrapeMutation.mutate({
      query: searchQuery,
      city: searchCity,
      category: searchCategory,
      maxResults: 20,
    });
  };

  const qualityBadge = (quality?: string | null) => {
    switch (quality) {
      case "none":
        return <Badge variant="destructive">No Site</Badge>;
      case "poor":
        return <Badge variant="secondary">Poor</Badge>;
      case "basic":
        return <Badge variant="outline">Basic</Badge>;
      default:
        return <Badge variant="outline">{quality || "Unknown"}</Badge>;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "scraped":
        return <Badge variant="outline">New</Badge>;
      case "site_generated":
        return <Badge className="bg-blue-600">Site Made</Badge>;
      case "email_ready":
        return <Badge className="bg-purple-600">Email Ready</Badge>;
      case "email_sent":
        return <Badge className="bg-green-600">Emailed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GhostSites</h1>
              <p className="text-xs text-muted-foreground">AI mockup generator for local businesses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {stats?.totalBusinesses ?? 0} businesses found
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings" className="flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                Keys
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Businesses</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.totalBusinesses}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Sites Generated</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.sitesGenerated}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Emails</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-purple-600">{stats.emailsSent}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">No Website</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.noWebsite}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search / Scrape Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4" />
              Find Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Search term (e.g. plumber, cafe)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Input
                placeholder="City (e.g. Austin)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <Input
                placeholder="Category label"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
              <Button
                onClick={handleScrape}
                disabled={scrapeMutation.isPending}
                className="w-full"
              >
                {scrapeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Scrape Leads
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="leads">Leads ({businesses?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns ({campaigns?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            {loadingBusinesses ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <Card key={biz.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{biz.name}</h3>
                            {qualityBadge(biz.websiteQuality)}
                            {statusBadge(biz.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {biz.city}
                            </span>
                            <span>{biz.category}</span>
                            {biz.rating ? (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {biz.rating}
                              </span>
                            ) : null}
                            {biz.phone ? <span>{biz.phone}</span> : null}
                            {biz.email ? (
                              <span className="text-blue-600">{biz.email}</span>
                            ) : null}
                          </div>
                          {biz.address ? (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {biz.address}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              analyzePersonalityMutation.mutate({ businessId: biz.id })
                            }
                            disabled={analyzePersonalityMutation.isPending}
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Analyze
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              generateSiteMutation.mutate({ businessId: biz.id })
                            }
                            disabled={generateSiteMutation.isPending}
                          >
                            {generateSiteMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 mr-1" />
                            )}
                            Generate Site
                          </Button>

                          {/* Show these only when site exists */}
                          {(biz.status === "site_generated" || biz.status === "email_ready" || biz.status === "email_sent") && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportZipMutation.mutate({ businessId: biz.id })}
                                disabled={exportZipMutation.isPending}
                              >
                                {exportZipMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5 mr-1" />
                                )}
                                Export ZIP
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`/preview/business/${biz.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                  Live Preview
                                </a>
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              generateEmailMutation.mutate({ businessId: biz.id })
                            }
                            disabled={generateEmailMutation.isPending}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1" />
                            Write Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-20">
                <CardContent className="text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No leads yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Use the search form above to scrape local businesses
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns">
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map((camp) => (
                  <Card key={camp.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {camp.query} in {camp.city}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {camp.category} — {camp.businessesFound} found —{" "}
                            {camp.status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            deleteCampaignMutation.mutate({ id: camp.id })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-20">
                <CardContent className="text-center text-muted-foreground">
                  No campaigns yet. Start scraping to create one.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Site Preview Dialog */}
      <Dialog
        open={!!previewHtml}
        onOpenChange={() => setPreviewHtml(null)}
      >
        <DialogContent className="!max-w-[100vw] !w-[100vw] !h-[100vh] !p-0 !m-0 !rounded-none !border-0 data-[state=open]:!zoom-in-100">
          <DialogHeader className="px-4 py-3 bg-neutral-900 text-white flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="w-4 h-4" />
              Preview — {previewName}
            </DialogTitle>
            <button
              onClick={() => setPreviewHtml(null)}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              title="Site Preview"
              className="w-full h-[calc(100vh-48px)] bg-white"
              sandbox="allow-scripts"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog
        open={!!emailPreview}
        onOpenChange={() => setEmailPreview(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Generated Email
            </DialogTitle>
          </DialogHeader>
          {emailPreview && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Subject
                </label>
                <p className="text-sm font-medium mt-1">{emailPreview.subject}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Body
                </label>
                <div className="mt-1 p-3 bg-neutral-50 rounded-lg text-sm whitespace-pre-line">
                  {emailPreview.body}
                </div>
              </div>
              <div className="flex gap-2">
                {emailApiUrl ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (emailPreview.emailId) {
                        sendEmailMutation.mutate({ emailId: emailPreview.emailId });
                      } else {
                        toast.error("No email ID found");
                      }
                    }}
                    disabled={sendEmailMutation.isPending}
                  >
                    {sendEmailMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1" />
                    )}
                    Send via Platform
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Subject: ${emailPreview.subject}\n\n${emailPreview.body}`
                      );
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
