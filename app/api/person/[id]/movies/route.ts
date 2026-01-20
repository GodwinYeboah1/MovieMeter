import { tmdb } from "@/lib/providers/tmdb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const personId = parseInt(params.id);

  if (isNaN(personId)) {
    return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
  }

  try {
    const credits = await tmdb.getPersonMovieCredits(personId);
    const details = await tmdb.getPersonDetails(personId);
    
    // Sort by popularity and take top 10
    const movies = (credits.cast || [])
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 12);

    return NextResponse.json({ movies, details });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch person data" },
      { status: 500 }
    );
  }
}
