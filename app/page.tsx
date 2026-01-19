import Link from "next/link";
import { tmdb } from "@/lib/providers/tmdb";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Info, Star } from "lucide-react";
import { generateMovieSlug } from "@/lib/utils/slug";
import { MovieCard } from "@/components/movie/MovieCard";
import { cn } from "@/lib/utils/cn";

async function getTrendingMovies() {
  try {
    const data = await tmdb.getTrending(1);
    return { movies: data.results.slice(0, 18), error: null };
  } catch (error: any) {
    console.error("Failed to fetch trending movies:", error);
    return { 
      movies: [], 
      error: error?.message || "Failed to fetch trending movies. Please check your TMDB_API_KEY configuration." 
    };
  }
}

async function getTopRatedMovies() {
  try {
    const data = await tmdb.getTopRated(1);
    return { movies: data.results.slice(0, 18), error: null };
  } catch (error: any) {
    console.error("Failed to fetch top rated movies:", error);
    return { 
      movies: [], 
      error: error?.message || "Failed to fetch top rated movies. Please check your TMDB_API_KEY configuration." 
    };
  }
}

export default async function HomePage() {
  const trendingResult = await getTrendingMovies();
  const topRatedResult = await getTopRatedMovies();
  const trendingMovies = trendingResult.movies;
  const topRatedMovies = topRatedResult.movies;
  const heroMovie = trendingMovies[0];
  const hasApiError = trendingResult.error || topRatedResult.error;

  return (
    <div className="space-y-12">
      
      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-[85vh] w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroMovie.backdrop_path ? (
              <Image
                src={tmdb.getImageUrl(heroMovie.backdrop_path, 'original') || ''}
                alt={heroMovie.title}
                fill
                priority
                className="object-cover opacity-60"
              />
            ) : (
              <div className="absolute inset-0 bg-[#1a1a1a]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="container mx-auto px-4 pb-20 md:px-12 lg:px-20">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-black md:text-6xl lg:text-7xl tracking-tighter uppercase italic text-white">
                  {heroMovie.title}
                </h1>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-300 md:text-base">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    {heroMovie.vote_average.toFixed(1)}
                  </span>
                  {heroMovie.release_date && (
                    <span>{new Date(heroMovie.release_date).getFullYear()}</span>
                  )}
                  <span className="rounded border border-gray-500 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-gray-400">
                    HD
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-gray-300 md:text-lg lg:text-xl">
                  {heroMovie.overview}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href={`/movie/${heroMovie.id}/${generateMovieSlug(heroMovie.title, heroMovie.release_date)}`}>
                    <Button size="lg" className="h-12 px-8 font-bold text-lg rounded-full">
                      <Play className="mr-2 h-5 w-5 fill-current" /> Play
                    </Button>
                  </Link>
                  <Link href={`/movie/${heroMovie.id}/${generateMovieSlug(heroMovie.title, heroMovie.release_date)}`}>
                    <Button size="lg" variant="secondary" className="h-12 px-8 font-bold text-lg rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-none">
                      <Info className="mr-2 h-5 w-5" /> More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className={cn("relative z-20 space-y-12 pb-20", heroMovie ? "-mt-16" : "pt-12")}>
        {/* API Error Message */}
        {hasApiError && (
          <section className="container mx-auto px-4 md:px-12 lg:px-20">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-500 mb-2">⚠️ API Configuration Required</h3>
              <p className="text-gray-300 mb-4">
                {trendingResult.error || topRatedResult.error}
              </p>
              <div className="text-sm text-gray-400 space-y-2">
                <p>To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Get a free API key from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TMDB</a></li>
                  <li>Create a <code className="bg-white/5 px-2 py-1 rounded">.env.local</code> file in the project root</li>
                  <li>Add: <code className="bg-white/5 px-2 py-1 rounded">TMDB_API_KEY=your-api-key-here</code></li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section id="trending" className="container mx-auto px-4 md:px-12 lg:px-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl uppercase italic border-l-4 border-primary pl-4 text-white">
              Trending Now
            </h2>
            <Link href="/trending" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          {trendingMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No trending movies available</p>
            </div>
          )}
        </section>

        {/* Top Rated Section */}
        <section id="top-rated" className="container mx-auto px-4 md:px-12 lg:px-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl uppercase italic border-l-4 border-primary pl-4 text-white">
              Top Rated
            </h2>
            <Link href="/top-rated" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          {topRatedMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {topRatedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No top rated movies available</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
