import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/providers/tmdb";
import { cache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    const cacheKey = `top-rated:${page}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await tmdb.getTopRated(page);
    await cache.set(cacheKey, data, 3600000); // Cache for 1 hour

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Top rated movies API error:", error);
    const errorMessage = error?.message || "Failed to fetch top rated movies";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
