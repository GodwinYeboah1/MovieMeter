import { tmdb, TMDBVideo } from "@/lib/providers/tmdb";
import { prisma } from "@/lib/db/prisma";
import { generateMovieSlug } from "@/lib/utils/slug";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReviewList } from "@/components/review/ReviewList";
import { TrailerModal } from "@/components/movie/TrailerModal";
import { ActorMoviesModal } from "@/components/movie/ActorMoviesModal";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, Clock, Calendar, Plus, Share2, TrendingUp, MessageSquare, Users } from "lucide-react";

interface PageProps {
  params: { tmdbId: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tmdbId = parseInt(params.tmdbId);
  const movie = await tmdb.getMovieDetails(tmdbId).catch(() => null);

  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  return {
    title: `${movie.title}${year ? ` (${year})` : ''} - MovieMeter`,
    description: movie.overview || `Read reviews and ratings for ${movie.title}`,
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: movie.poster_path ? [tmdb.getPosterUrl(movie.poster_path, 'w780') || ''] : [],
    },
  };
}

export default async function MovieDetailPage({ params }: PageProps) {
  const tmdbId = parseInt(params.tmdbId);

  let movie;
  try {
    movie = await tmdb.getMovieDetails(tmdbId);
  } catch (error) {
    notFound();
  }

  const expectedSlug = generateMovieSlug(movie.title, movie.release_date);
  if (params.slug !== expectedSlug) {
    // Optional: Redirect to correct slug
  }

  const stats = await prisma.movieStats.findUnique({
    where: { tmdbId },
  });

  const cast = movie.credits?.cast.slice(0, 8) || [];
  const directors = movie.credits?.crew.filter(person => person.job === 'Director') || [];
  const videoResponse = await tmdb.getMovieVideos(tmdbId).catch(() => null);
  const videoResults: TMDBVideo[] = videoResponse?.results || [];
  const trailer =
    videoResults.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official
    ) ||
    videoResults.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    ) ||
    videoResults[0];

  return (
    <div className="space-y-12">
      
      {/* Hero Header with Backdrop */}
      <section className="relative h-[60vh] w-full lg:h-[75vh]">
        <div className="absolute inset-0 z-0">
          {movie.backdrop_path ? (
            <Image
              src={tmdb.getImageUrl(movie.backdrop_path, 'original') || ''}
              alt={movie.title}
              fill
              priority
              className="object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-[#1a1a1a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-12 md:px-12 lg:px-24">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Poster for larger screens */}
              <div className="hidden md:block w-64 flex-shrink-0 shadow-2xl shadow-black rounded-xl overflow-hidden border border-white/10">
                <div className="relative aspect-[2/3]">
                  {movie.poster_path ? (
                    <Image
                      src={tmdb.getPosterUrl(movie.poster_path, 'w500') || ''}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">No Poster</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow space-y-4 mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {movie.genres?.map(genre => (
                    <span key={genre.id} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded">
                      {genre.name}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-semibold text-gray-300">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="text-lg">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs font-normal">({movie.vote_count.toLocaleString()})</span>
                  </div>
                  {movie.release_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {movie.runtime} min
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <TrailerModal trailerKey={trailer?.key} movieTitle={movie.title} />
                  <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 font-bold text-lg bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-none">
                    <Plus className="mr-2 h-5 w-5" /> Add to List
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 lg:px-24 py-12">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <section>
              <h2 className="text-2xl font-bold italic uppercase tracking-tighter border-l-4 border-primary pl-4 mb-6">Synopsis</h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-normal">
                {movie.overview}
              </p>
            </section>

            {/* Cast Section */}
            {cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold italic uppercase tracking-tighter border-l-4 border-primary pl-4 mb-8">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {cast.map((actor) => (
                    <ActorMoviesModal 
                      key={actor.id} 
                      actorId={actor.id} 
                      actorName={actor.name}
                      actorImage={actor.profile_path}
                    >
                      <div className="group cursor-pointer">
                        <div className="relative aspect-square rounded-full overflow-hidden mb-3 border-2 border-transparent transition-all duration-300 group-hover:border-primary">
                          {actor.profile_path ? (
                            <Image
                              src={tmdb.getImageUrl(actor.profile_path, 'w300') || ''}
                              alt={actor.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-xs text-gray-500">No Img</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm md:text-base group-hover:text-primary transition-colors">{actor.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{actor.character}</div>
                        </div>
                      </div>
                    </ActorMoviesModal>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="pt-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold italic uppercase tracking-tighter border-l-4 border-primary pl-4">Community Reviews</h2>
                {stats && stats.ratingCount > 0 && (
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">{stats.avgRating.toFixed(1)} Community Rating</span>
                  </div>
                )}
              </div>
              <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
                <ReviewList tmdbId={tmdbId} />
              </div>
            </section>
          </div>

          <div className="space-y-12">
            {/* Sidebar Info */}
            <section className="bg-[#111] rounded-2xl p-8 border border-white/5 space-y-6">
              <h3 className="text-xl font-bold italic uppercase tracking-tighter text-primary">Details</h3>
              
              <div className="space-y-4 text-sm md:text-base">
                {directors.length > 0 && (
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-widest font-bold mb-1">Director</span>
                    <span className="font-semibold">{directors.map(d => d.name).join(', ')}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-widest font-bold mb-1">Status</span>
                  <span className="font-semibold">Released</span>
                </div>
                
                {movie.release_date && (
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-widest font-bold mb-1">Release Date</span>
                    <span className="font-semibold">{new Date(movie.release_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-widest font-bold mb-1">Production</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {movie.production_companies?.slice(0, 3).map((company: any) => (
                      <span key={company.id} className="text-xs bg-white/5 px-2 py-1 rounded">{company.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats if any */}
            {stats && stats.ratingCount > 0 && (
              <section className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-8 border border-primary/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Stats</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="bg-background/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex items-center gap-5 group hover:border-primary/30 transition-all duration-300">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white leading-none mb-1">{stats.reviewCount}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Total Reviews</div>
                    </div>
                  </div>

                  <div className="bg-background/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex items-center gap-5 group hover:border-primary/30 transition-all duration-300">
                    <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white leading-none mb-1">{stats.ratingCount}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Total Ratings</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
