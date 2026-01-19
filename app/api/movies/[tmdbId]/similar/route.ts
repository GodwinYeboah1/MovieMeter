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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    const cacheKey = `similar:${tmdbId}:${page}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await tmdb.getSimilarMovies(tmdbId, page);
    await cache.set(cacheKey, data, 3600000); // Cache for 1 hour

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Similar movies API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar movies" },
      { status: 500 }
    );
  }
}
