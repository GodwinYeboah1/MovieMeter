import { tmdb } from "@/lib/providers/tmdb";
import { MovieCard } from "@/components/movie/MovieCard";

export default async function TrendingPage() {
  const result = await tmdb.getTrending(1);
  const movies = result.results;

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">Trending Now</h1>
        <p className="text-gray-500 font-medium">The most popular movies this week across the globe.</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}
