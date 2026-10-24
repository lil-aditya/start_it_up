"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "../layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, timeAgo } from "@/lib/utils";
import type { FollowUp } from "@/types";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Calendar,
  RefreshCw,
} from "lucide-react";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PENDING: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/20",
  },
  SENT: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/20",
  },
  FAILED: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/20",
  },
  CANCELLED: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: "text-muted-foreground",
    bg: "bg-secondary border-border/30",
  },
};

export default function FollowupsPage() {
  const { currentBusiness } = useBusinessContext();
  const [followups, setFollowups] = useState<(FollowUp & { lead?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    // We'll fetch leads and aggregate follow-ups from them
    fetch(`/api/leads?businessId=${currentBusiness.id}&pageSize=100`)
      .then((r) => r.json())
      .then(async (res) => {
        // Now get follow-ups by fetching each lead's detail
        // For now, fetch the first few leads that have follow-ups
        const allFollowups: (FollowUp & { lead?: { name: string } })[] = [];
        const leadIds = (res.data || []).slice(0, 30).map((l: { id: string }) => l.id);

        for (const leadId of leadIds) {
          try {
            const r2 = await fetch(`/api/leads/${leadId}`);
            const detail = await r2.json();
            if (detail.data?.followUps) {
              for (const fu of detail.data.followUps) {
                allFollowups.push({
                  ...fu,
                  lead: { name: detail.data.name },
                });
              }
            }
          } catch {
            // skip
          }
        }

        setFollowups(allFollowups);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentBusiness?.id]);

  const filtered =
    activeTab === "all"
      ? followups
      : followups.filter((f) => f.status === activeTab.toUpperCase());

  const counts = {
    all: followups.length,
    pending: followups.filter((f) => f.status === "PENDING").length,
    sent: followups.filter((f) => f.status === "SENT").length,
    failed: followups.filter((f) => f.status === "FAILED").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Follow-ups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Automated lead nurturing sequences
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "Total", value: counts.all, icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pending", value: counts.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Sent", value: counts.sent, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Failed", value: counts.failed, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((card) => (
          <Card key={card.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-[11px] text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="sent" className="text-xs">Sent ({counts.sent})</TabsTrigger>
          <TabsTrigger value="failed" className="text-xs">Failed ({counts.failed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Follow-up List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No follow-ups found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Follow-ups will appear here when leads are in your pipeline
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 stagger-children">
          {filtered.map((fu) => {
            const config = statusConfig[fu.status] || statusConfig.CANCELLED;
            const scheduledDate = new Date(fu.scheduledAt);
            const isPast = scheduledDate < new Date();
            const isUpcoming = !isPast && fu.status === "PENDING";

            return (
              <Card key={fu.id} className="glass-card hover:border-primary/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg border ${config.bg} shrink-0 mt-0.5`}>
                      <div className={config.color}>{config.icon}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{fu.lead?.name || "Unknown"}</p>
                          <Badge
                            variant="outline"
                            className={`text-[9px] h-4 px-1.5 ${config.bg} ${config.color} border-0`}
                          >
                            {fu.status}
                          </Badge>
                        </div>
                        {isUpcoming && (
                          <Badge className="text-[9px] h-5 bg-primary/15 text-primary border-primary/20 animate-pulse-soft">
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {fu.messageContent}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {scheduledDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {fu.attemptCount > 0 && (
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            <span>{fu.attemptCount} attempt{fu.attemptCount > 1 ? "s" : ""}</span>
                          </div>
                        )}
                        {fu.sentAt && (
                          <span>Sent {timeAgo(fu.sentAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
