import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/dashboard/stats — aggregate conversion metrics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return Response.json({ error: "businessId is required" }, { status: 400 });
    }

    // Get lead counts by status
    const leadCounts = await prisma.lead.groupBy({
      by: ["status"],
      where: { businessId },
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {};
    let totalLeads = 0;
    for (const item of leadCounts) {
      statusMap[item.status] = item._count.id;
      totalLeads += item._count.id;
    }

    // Get lead counts by source
    const leadsBySource = await prisma.lead.groupBy({
      by: ["source"],
      where: { businessId },
      _count: { id: true },
    });

    // Get total revenue
    const revenueResult = await prisma.conversionEvent.aggregate({
      where: { businessId },
      _sum: { revenueAmount: true },
    });

    // Get active follow-ups count
    const activeFollowUps = await prisma.followUp.count({
      where: {
        businessId,
        status: "PENDING",
      },
    });

    // Get revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const conversions = await prisma.conversionEvent.findMany({
      where: {
        businessId,
        convertedAt: { gte: thirtyDaysAgo },
      },
      select: { revenueAmount: true, convertedAt: true },
      orderBy: { convertedAt: "asc" },
    });

    // Group revenue by day
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      revenueByDay[key] = 0;
    }
    for (const c of conversions) {
      const key = new Date(c.convertedAt).toISOString().split("T")[0];
      if (revenueByDay[key] !== undefined) {
        revenueByDay[key] += c.revenueAmount;
      }
    }

    // Get leads by day (last 30 days)
    const leads = await prisma.lead.findMany({
      where: {
        businessId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const leadsByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      leadsByDay[key] = 0;
    }
    for (const l of leads) {
      const key = new Date(l.createdAt).toISOString().split("T")[0];
      if (leadsByDay[key] !== undefined) {
        leadsByDay[key]++;
      }
    }

    // Get recent activity (latest messages, conversions, leads)
    const recentMessages = await prisma.message.findMany({
      where: {
        conversation: { businessId },
      },
      include: {
        conversation: {
          include: {
            lead: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 5,
    });

    const recentConversions = await prisma.conversionEvent.findMany({
      where: { businessId },
      include: {
        lead: { select: { id: true, name: true } },
      },
      orderBy: { convertedAt: "desc" },
      take: 5,
    });

    const recentLeads = await prisma.lead.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Build activity feed
    const activity = [
      ...recentMessages.map((m) => ({
        id: m.id,
        type: "message_received" as const,
        title: m.direction === "INBOUND" ? "New message" : "Reply sent",
        description: `${m.conversation.lead.name}: "${m.content.slice(0, 80)}${m.content.length > 80 ? "..." : ""}"`,
        timestamp: m.sentAt.toISOString(),
        leadId: m.conversation.lead.id,
        leadName: m.conversation.lead.name,
      })),
      ...recentConversions.map((c) => ({
        id: c.id,
        type: "conversion" as const,
        title: "Lead converted",
        description: `${c.lead.name} — ₹${c.revenueAmount.toLocaleString("en-IN")}`,
        timestamp: c.convertedAt.toISOString(),
        leadId: c.lead.id,
        leadName: c.lead.name,
      })),
      ...recentLeads.map((l) => ({
        id: l.id,
        type: "lead_created" as const,
        title: "New lead",
        description: `${l.name} via ${l.source.replace("_", " ")}`,
        timestamp: l.createdAt.toISOString(),
        leadId: l.id,
        leadName: l.name,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const convertedLeads = statusMap["CONVERTED"] || 0;
    const totalRevenue = revenueResult._sum.revenueAmount || 0;

    const stats = {
      totalLeads,
      newLeads: statusMap["NEW"] || 0,
      engagedLeads: statusMap["ENGAGED"] || 0,
      qualifiedLeads: statusMap["QUALIFIED"] || 0,
      convertedLeads,
      lostLeads: statusMap["LOST"] || 0,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      totalRevenue,
      activeFollowUps,
      averageDealValue: convertedLeads > 0 ? totalRevenue / convertedLeads : 0,
      leadsBySource: leadsBySource.map((item) => ({
        source: item.source,
        count: item._count.id,
      })),
      revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
        date,
        revenue,
      })),
      leadsByDay: Object.entries(leadsByDay).map(([date, count]) => ({
        date,
        count,
      })),
      recentActivity: activity,
    };

    return Response.json({ data: stats });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
