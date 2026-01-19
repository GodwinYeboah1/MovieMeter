import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { reviewRateLimiter } from "@/lib/rate-limit";

const createReviewSchema = z.object({
  tmdbId: z.number().int().positive(),
  rating: z.number().int().min(1).max(10),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(5000),
  spoiler: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tmdbId = parseInt(searchParams.get("tmdbId") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (!tmdbId) {
      return NextResponse.json(
        { error: "tmdbId parameter is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        tmdbId,
        isHidden: false,
      },
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.review.count({
      where: {
        tmdbId,
        isHidden: false,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get reviews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been banned" },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimit = reviewRateLimiter.check(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const requestBody = await request.json();
    const validation = createReviewSchema.safeParse(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { tmdbId, rating, title, body, spoiler } = validation.data;

    // Check if user already has a review for this movie
    const existingReview = await prisma.review.findUnique({
      where: {
        tmdbId_userId: {
          tmdbId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this movie" },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        tmdbId,
        userId: session.user.id,
        rating,
        title: title ? sanitizeInput(title) : null,
        body: sanitizeInput(body),
        spoiler,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update movie stats
    await updateMovieStats(tmdbId);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Create review API error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
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
  }
}
