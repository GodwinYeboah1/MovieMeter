import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/providers/tmdb";
import { cache } from "@/lib/cache";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");

    const validation = searchSchema.safeParse({ q: query, page: searchParams.get("page") });

    if (!validation.success || !query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const cacheKey = `search:${query}:${page}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await tmdb.searchMovies(query, page);
    await cache.set(cacheKey, data, 1800000); // Cache for 30 minutes

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Search movies API error:", error);
    const errorMessage = error?.message || "Failed to search movies";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
