import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/conversations — list conversations for a business
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return Response.json({ error: "businessId is required" }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { businessId },
      include: {
        lead: {
          select: { id: true, name: true, phone: true, email: true, status: true, source: true },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({ data: conversations });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
