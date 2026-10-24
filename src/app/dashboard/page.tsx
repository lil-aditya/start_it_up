"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, compactNumber, timeAgo } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import {
  Users,
  TrendingUp,
  IndianRupee,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  MessageSquare,
  CheckCircle2,
  Send,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const PIE_COLORS = [
  "oklch(0.65 0.24 265)",   // brand purple
  "oklch(0.72 0.19 155)",   // green
  "oklch(0.80 0.18 75)",    // amber
  "oklch(0.70 0.20 330)",   // pink
  "oklch(0.70 0.15 200)",   // cyan
  "oklch(0.60 0.20 30)",    // orange
];

const FUNNEL_COLORS = {
  NEW: "oklch(0.65 0.20 230)",
  ENGAGED: "oklch(0.80 0.18 75)",
  QUALIFIED: "oklch(0.65 0.24 265)",
  CONVERTED: "oklch(0.72 0.19 155)",
  LOST: "oklch(0.65 0.20 25)",
};

function getActivityIcon(type: string) {
  switch (type) {
    case "lead_created": return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
    case "message_received": return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
    case "conversion": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "followup_sent": return <Send className="w-3.5 h-3.5 text-purple-400" />;
    default: return <Target className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

export default function DashboardPage() {
  const { currentBusiness } = useBusinessContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    fetch(`/api/dashboard/stats?businessId=${currentBusiness.id}`)
      .then((r) => r.json())
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentBusiness?.id]);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 rounded-xl animate-shimmer" />
          <div className="h-72 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Leads",
      value: stats.totalLeads.toString(),
      icon: Users,
      trend: `+${stats.newLeads} new`,
      trendUp: true,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: `${stats.convertedLeads} converted`,
      trendUp: stats.conversionRate > 15,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Revenue",
      value: `₹${compactNumber(stats.totalRevenue)}`,
      icon: IndianRupee,
      trend: `Avg ₹${compactNumber(stats.averageDealValue)}`,
      trendUp: true,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Active Follow-ups",
      value: stats.activeFollowUps.toString(),
      icon: Clock,
      trend: "Pending",
      trendUp: false,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  // Pipeline funnel data
  const funnelData = [
    { name: "New", value: stats.newLeads, color: FUNNEL_COLORS.NEW },
    { name: "Engaged", value: stats.engagedLeads, color: FUNNEL_COLORS.ENGAGED },
    { name: "Qualified", value: stats.qualifiedLeads, color: FUNNEL_COLORS.QUALIFIED },
    { name: "Converted", value: stats.convertedLeads, color: FUNNEL_COLORS.CONVERTED },
    { name: "Lost", value: stats.lostLeads, color: FUNNEL_COLORS.LOST },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your lead-to-revenue pipeline
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="glass-card hover:border-primary/20 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {kpi.trendUp ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-amber-400" />
                    )}
                    <span className="text-xs text-muted-foreground">{kpi.trend}</span>
                  </div>
                </div>
                <div className={`${kpi.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueByDay}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.24 265)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.65 0.24 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${compactNumber(v)}`}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <ReTooltip
                    contentStyle={{
                      background: "oklch(0.18 0.015 265)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) => [formatINR(value), "Revenue"]}
                    labelFormatter={(l) => new Date(l).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.65 0.24 265)"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lead Sources</CardTitle>
            <p className="text-xs text-muted-foreground">By channel</p>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leadsBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="count"
                    nameKey="source"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {stats.leadsBySource.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{
                      background: "oklch(0.18 0.015 265)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="space-y-1.5 mt-2">
              {stats.leadsBySource.map((item, i) => (
                <div key={item.source} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.source.replace("_", " ")}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pipeline Funnel */}
        <Card className="lg:col-span-3 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lead Pipeline</CardTitle>
            <p className="text-xs text-muted-foreground">Current stage distribution</p>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <ReTooltip
                    contentStyle={{
                      background: "oklch(0.18 0.015 265)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Latest updates</p>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {stats.recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              ) : (
                stats.recentActivity.map((item, i) => (
                  <div
                    key={item.id + i}
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="mt-0.5 p-1.5 rounded-md bg-secondary/80">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Over Time */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Lead Acquisition</CardTitle>
          <p className="text-xs text-muted-foreground">New leads per day — last 30 days</p>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.leadsByDay}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric" })}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <ReTooltip
                  contentStyle={{
                    background: "oklch(0.18 0.015 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "oklch(0.95 0 0)",
                  }}
                  formatter={(value: number) => [value, "Leads"]}
                  labelFormatter={(l) => new Date(l).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.72 0.19 155)"
                  strokeWidth={2}
                  fill="url(#leadsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
