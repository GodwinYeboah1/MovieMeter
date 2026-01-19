import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.id },
    });

    // Log admin action
    if (isAdmin && !isOwner) {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_COMMENT",
          actorId: session.user.id,
          targetType: "COMMENT",
          targetId: params.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete comment API error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
