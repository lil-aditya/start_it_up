import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/leads — list leads with filtering, search, pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Record<string, unknown> = {};
    if (businessId) where.businessId = businessId;
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { conversations: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return Response.json({
      data: leads,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST /api/leads — create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, source, businessId, estimatedValue, notes, tags } = body;

    if (!name || !businessId) {
      return Response.json(
        { error: "name and businessId are required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        source: source || "WEB_FORM",
        businessId,
        estimatedValue: estimatedValue || 0,
        notes: notes || null,
        tags: tags || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return Response.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return Response.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
