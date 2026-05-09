import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Key, Globe, Sparkles, Save, Eye, EyeOff, Send } from "lucide-react";
import { Link } from "react-router";

interface ApiKeys {
  openrouter: string;
  googlePlaces: string;
  emailApiUrl: string;
}

function loadKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem("ghostsites_api_keys");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { openrouter: "", googlePlaces: "", emailApiUrl: "" };
}

function saveKeys(keys: ApiKeys) {
  localStorage.setItem("ghostsites_api_keys", JSON.stringify(keys));
}

export function getStoredKeys(): ApiKeys {
  return loadKeys();
}

export default function Settings() {
  const [keys, setKeys] = useState<ApiKeys>(loadKeys);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleSave = () => {
    saveKeys(keys);
    toast.success("Settings saved. Refresh the page for changes to take effect.");
  };

  const handleClear = () => {
    setKeys({ openrouter: "", googlePlaces: "", emailApiUrl: "" });
    localStorage.removeItem("ghostsites_api_keys");
    toast.success("All settings cleared");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GhostSites</h1>
              <p className="text-xs text-muted-foreground">Settings</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* OpenRouter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              AI Provider
              {keys.openrouter && (
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">OpenRouter API Key <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showOpenRouter ? "text" : "password"} placeholder="sk-or-v1-..." value={keys.openrouter}
                onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })} className="pr-10 font-mono text-sm" />
              <button onClick={() => setShowOpenRouter(!showOpenRouter)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showOpenRouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Required for AI-generated copy. Get free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openrouter.ai/keys</a>.
            </p>
          </CardContent>
        </Card>

        {/* Google Places */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Data Source
              {keys.googlePlaces && (
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">Google Places API Key <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <div className="relative">
              <Input type={showGoogle ? "text" : "password"} placeholder="AIzaSy..." value={keys.googlePlaces}
                onChange={(e) => setKeys({ ...keys, googlePlaces: e.target.value })} className="pr-10 font-mono text-sm" />
              <button onClick={() => setShowGoogle(!showGoogle)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showGoogle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Enables real Google scraping. Without it, uses realistic mock data.
            </p>
          </CardContent>
        </Card>

        {/* Email Sending Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-500" />
              Email Sending Platform
              {keys.emailApiUrl && (
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">API Endpoint URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input type="text" placeholder="https://api.salesos.com/send" value={keys.emailApiUrl}
              onChange={(e) => setKeys({ ...keys, emailApiUrl: e.target.value })} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground mt-1.5">
              Your email sending platform API URL. When connected, emails send directly instead of copy/paste. GhostSites POSTs {"{ to, subject, body, businessId }"} to this endpoint.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleClear}>Clear All</Button>
        </div>
      </main>
    </div>
  );
}
