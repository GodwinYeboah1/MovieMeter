import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/providers/tmdb";
import { cache } from "@/lib/cache";
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

    const cacheKey = `movie:${tmdbId}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await tmdb.getMovieDetails(tmdbId);
    await cache.set(cacheKey, data, 3600000); // Cache for 1 hour

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Movie details API error:", error);
    const errorMessage = error?.message || "Failed to fetch movie details";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
