import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/leads/[id] — get lead detail with conversations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true, email: true } },
        business: { select: { id: true, name: true, slug: true } },
        conversations: {
          include: {
            messages: {
              orderBy: { sentAt: "asc" },
              include: {
                sentByUser: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        followUps: {
          orderBy: { scheduledAt: "desc" },
        },
        conversionEvents: {
          orderBy: { convertedAt: "desc" },
        },
      },
    });

    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    return Response.json({ data: lead });
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return Response.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

// PATCH /api/leads/[id] — update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, assignedToId, notes, tags, estimatedValue, name, phone, email } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    // If status changed to CONVERTED, update lastInteractionAt
    if (status) {
      updateData.lastInteractionAt = new Date();
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return Response.json({ data: lead });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return Response.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.lead.delete({ where: { id } });

    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return Response.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
