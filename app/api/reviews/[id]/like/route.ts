import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(
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

    // Check if user already liked this review
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Review already liked" },
        { status: 400 }
      );
    }

    // Create the like (users can like their own posts)
    await prisma.reviewLike.create({
      data: {
        reviewId: params.id,
        userId: session.user.id,
      },
    });

    // Get updated like count
    const likeCount = await prisma.reviewLike.count({
      where: { reviewId: params.id },
    });

    return NextResponse.json({ 
      success: true,
      liked: true,
      likeCount 
    });
  } catch (error: any) {
    console.error("Like review API error:", error);
    return NextResponse.json(
      { error: "Failed to like review" },
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

    // Remove the like
    await prisma.reviewLike.deleteMany({
      where: {
        reviewId: params.id,
        userId: session.user.id,
      },
    });

    // Get updated like count
    const likeCount = await prisma.reviewLike.count({
      where: { reviewId: params.id },
    });

    return NextResponse.json({ 
      success: true,
      liked: false,
      likeCount 
    });
  } catch (error: any) {
    console.error("Unlike review API error:", error);
    return NextResponse.json(
      { error: "Failed to unlike review" },
      { status: 500 }
    );
  }
}
