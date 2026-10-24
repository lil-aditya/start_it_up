"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "../layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Business } from "@/types";
import {
  Building2,
  Bot,
  Clock,
  Users,
  Shield,
  Save,
  Globe,
  Sparkles,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const { currentBusiness } = useBusinessContext();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [aiPersona, setAiPersona] = useState("");
  const [faqDocument, setFaqDocument] = useState("");
  const [escalationKeywords, setEscalationKeywords] = useState<string[]>([]);
  const [followUpSequence, setFollowUpSequence] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newHour, setNewHour] = useState("");

  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    fetch(`/api/businesses`)
      .then((r) => r.json())
      .then((res) => {
        const biz = res.data?.find((b: Business) => b.id === currentBusiness.id);
        if (biz) {
          setBusiness(biz);
          setAiPersona(biz.aiPersona || "");
          setFaqDocument(biz.faqDocument || "");
          setEscalationKeywords(
            biz.escalationKeywords ? biz.escalationKeywords.split(",").map((s: string) => s.trim()) : []
          );
          setFollowUpSequence(
            biz.followUpSequence ? biz.followUpSequence.split(",").map((s: string) => s.trim()) : []
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentBusiness?.id]);

  function addKeyword() {
    if (newKeyword.trim() && !escalationKeywords.includes(newKeyword.trim())) {
      setEscalationKeywords([...escalationKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setEscalationKeywords(escalationKeywords.filter((k) => k !== kw));
  }

  function addFollowUpHour() {
    const h = parseInt(newHour);
    if (!isNaN(h) && h > 0 && !followUpSequence.includes(h.toString())) {
      setFollowUpSequence([...followUpSequence, h.toString()].sort((a, b) => parseInt(a) - parseInt(b)));
      setNewHour("");
    }
  }

  function removeFollowUpHour(h: string) {
    setFollowUpSequence(followUpSequence.filter((x) => x !== h));
  }

  function formatHours(h: string) {
    const hours = parseInt(h);
    if (hours < 24) return `${hours}h`;
    if (hours < 168) return `${Math.round(hours / 24)}d`;
    return `${Math.round(hours / 168)}w`;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-shimmer rounded" />
        <div className="h-64 animate-shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your business and AI assistant
        </p>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="business" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Business
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1.5">
            <Bot className="w-3.5 h-3.5" /> AI Config
          </TabsTrigger>
          <TabsTrigger value="followups" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Follow-ups
          </TabsTrigger>
        </TabsList>

        {/* Business Profile */}
        <TabsContent value="business" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Business Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Basic information about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name</Label>
                  <Input value={business?.name || ""} className="h-9 text-sm bg-secondary/30" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Industry</Label>
                  <Input
                    value={business?.industryType || ""}
                    className="h-9 text-sm bg-secondary/30 capitalize"
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={business?.email || ""} className="h-9 text-sm bg-secondary/30" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={business?.phone || ""} className="h-9 text-sm bg-secondary/30" readOnly />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium">
                    Subscription: <span className="capitalize">{business?.plan}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    Status: {business?.subscriptionStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Persona
              </CardTitle>
              <CardDescription className="text-xs">
                Define how your AI assistant speaks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">System Prompt</Label>
                <Textarea
                  value={aiPersona}
                  onChange={(e) => setAiPersona(e.target.value)}
                  rows={6}
                  className="text-sm bg-secondary/30 resize-none"
                  placeholder="You are a helpful business assistant..."
                />
                <p className="text-[11px] text-muted-foreground">
                  This defines your AI&apos;s personality, knowledge, and response style
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Knowledge Base (FAQ)
              </CardTitle>
              <CardDescription className="text-xs">
                Information your AI will use to answer customer queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">FAQ Document</Label>
                <Textarea
                  value={faqDocument}
                  onChange={(e) => setFaqDocument(e.target.value)}
                  rows={8}
                  className="text-sm bg-secondary/30 resize-none font-mono text-xs"
                  placeholder="Q: What are your fees?\nA: Our fees range from..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Escalation Keywords
              </CardTitle>
              <CardDescription className="text-xs">
                When these keywords are detected, the AI will escalate to a human
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {escalationKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs gap-1 pr-1"
                  >
                    {kw}
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-amber-500/20 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword..."
                  className="h-8 text-xs bg-secondary/30"
                  onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                />
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addKeyword}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up Configuration */}
        <TabsContent value="followups" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Follow-up Sequence
              </CardTitle>
              <CardDescription className="text-xs">
                Automated follow-up timing after a lead goes quiet (in hours)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visual Timeline */}
              <div className="relative flex items-center gap-1 py-4">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50" />
                {followUpSequence.map((h, i) => (
                  <div key={h} className="relative flex flex-col items-center z-10">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] h-5 gap-0.5 bg-secondary/50"
                    >
                      {formatHours(h)}
                      <button
                        onClick={() => removeFollowUpHour(h)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </Badge>
                  </div>
                ))}
                {followUpSequence.length === 0 && (
                  <p className="text-xs text-muted-foreground relative z-10 bg-background px-2">
                    No follow-up steps configured
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex gap-2 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs">Add step (hours after last contact)</Label>
                  <Input
                    type="number"
                    value={newHour}
                    onChange={(e) => setNewHour(e.target.value)}
                    placeholder="e.g. 24"
                    className="h-8 text-xs bg-secondary/30"
                    min="1"
                    onKeyDown={(e) => e.key === "Enter" && addFollowUpHour()}
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addFollowUpHour}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Common sequences: 24h → 72h → 168h (1 day → 3 days → 1 week)
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription className="text-xs">
                Manage who has access to this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">RS</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rajesh Sharma</p>
                    <p className="text-[11px] text-muted-foreground">Owner</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">OWNER</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-emerald-400">PG</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Priya Gupta</p>
                    <p className="text-[11px] text-muted-foreground">Staff</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">STAFF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
