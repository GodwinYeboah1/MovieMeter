import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(5000).optional(),
  spoiler: z.boolean().optional(),
});

export async function PATCH(
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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validation.data.rating !== undefined) updateData.rating = validation.data.rating;
    if (validation.data.title !== undefined) updateData.title = validation.data.title ? sanitizeInput(validation.data.title) : null;
    if (validation.data.body !== undefined) updateData.body = sanitizeInput(validation.data.body);
    if (validation.data.spoiler !== undefined) updateData.spoiler = validation.data.spoiler;

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Update movie stats
    await updateMovieStats(review.tmdbId);

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.error("Update review API error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const tmdbId = review.tmdbId;

    await prisma.review.delete({
      where: { id: params.id },
    });

    // Log admin action
    if (isAdmin && !isOwner) {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_REVIEW",
          actorId: session.user.id,
          targetType: "REVIEW",
          targetId: params.id,
        },
      });
    }

    // Update movie stats
    await updateMovieStats(tmdbId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete review API error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

async function updateMovieStats(tmdbId: number) {
  const stats = await prisma.review.groupBy({
    by: ["tmdbId"],
    where: { tmdbId, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true },
  });

  if (stats.length > 0) {
    const stat = stats[0];
    await prisma.movieStats.upsert({
      where: { tmdbId },
      update: {
        avgRating: stat._avg.rating || 0,
        ratingCount: stat._count.rating,
        reviewCount: stat._count.rating,
      },
      create: {
        tmdbId,
        avgRating: stat._avg.rating || 0,
        ratingCount: stat._count.rating,
        reviewCount: stat._count.rating,
      },
    });
  } else {
    // No reviews left, reset stats
    await prisma.movieStats.deleteMany({
      where: { tmdbId },
    });
  }
}
