import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const paramsSchema = z.object({
  tmdbId: z.string().transform((val) => parseInt(val)),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  try {
    const validation = paramsSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const { tmdbId } = validation.data;

    const stats = await prisma.movieStats.findUnique({
      where: { tmdbId },
    });

    if (!stats) {
      return NextResponse.json({
        avgRating: 0,
        ratingCount: 0,
        reviewCount: 0,
      });
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Movie stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie stats" },
      { status: 500 }
    );
  }
}
