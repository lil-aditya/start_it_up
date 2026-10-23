import { prisma } from "@/lib/db";

// GET /api/businesses — list all businesses (for demo/dev)
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        _count: {
          select: { leads: true, users: true, conversations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: businesses });
  } catch (error) {
    console.error("GET /api/businesses error:", error);
    return Response.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}
