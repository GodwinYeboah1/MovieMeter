import { prisma } from "@/lib/db/prisma";
import { tmdb } from "@/lib/providers/tmdb";
import Link from "next/link";
import { generateMovieSlug } from "@/lib/utils/slug";
import Image from "next/image";
import { Star, MessageCircle, ThumbsUp, User, ChevronRight, AlertCircle, Quote } from "lucide-react";

type ReviewWithUser = {
  id: string;
  tmdbId: number;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

export default async function LatestReviewsPage() {
  let reviews: ReviewWithUser[] = [];
  let dbError = false;

  try {
    reviews = await prisma.review.findMany({
      where: {
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
      take: 20,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    dbError = true;
  }

  // Fetch unique movie details for the reviews
  const uniqueTmdbIds = Array.from(new Set(reviews.map(r => r.tmdbId)));
  const movieDetailsMap = new Map();
  
  await Promise.all(uniqueTmdbIds.map(async (id) => {
    try {
      const movie = await tmdb.getMovieDetails(id);
      movieDetailsMap.set(id, movie);
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error);
    }
  }));

  return (
    <main className="container mx-auto px-4 py-12 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">Feed</h1>
            <p className="text-gray-500 font-medium">The latest thoughts from the MovieMeter community.</p>
          </div>
          
          {dbError ? (
            <div className="text-center py-24 bg-[#111] rounded-3xl border border-white/5">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2">Database Unavailable</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">The reviews database is currently unavailable. Please ensure PostgreSQL is running and try again.</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-24 bg-[#111] rounded-3xl border border-white/5">
              <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2">Silence in the theater...</p>
              <p className="text-gray-500 text-sm">No reviews have been posted yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-10">
              {reviews.map((review) => {
                const movie = movieDetailsMap.get(review.tmdbId);
                const slug = movie ? generateMovieSlug(movie.title, movie.release_date) : `movie-${review.tmdbId}`;
                
                return (
                  <div key={review.id} className="group relative bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(var(--primary),0.05)]">
                    {/* Background Glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    
                    <div className="flex flex-col md:flex-row">
                      {/* Movie Poster Section */}
                      {movie && (
                        <Link href={`/movie/${review.tmdbId}/${slug}`} className="md:w-52 lg:w-64 flex-shrink-0 relative aspect-[2/3] md:aspect-auto overflow-hidden">
                          <Image
                            src={tmdb.getPosterUrl(movie.poster_path, 'w500') || ''}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/20 to-transparent" />
                          
                          {/* Mobile Title Overlay */}
                          <div className="absolute bottom-6 left-6 right-6 md:hidden">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Movie</span>
                            </div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{movie.title}</h3>
                          </div>
                        </Link>
                      )}

                      <div className="flex-grow p-8 lg:p-10 flex flex-col relative">
                        {/* Rating Badge - Top Right */}
                        <div className="absolute top-8 right-8 flex flex-col items-center">
                          <div className="bg-primary text-black px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-1.5 shadow-lg shadow-primary/20">
                            <Star className="h-4 w-4 fill-current" />
                            {review.rating}/10
                          </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4 mb-8">
                          <Link href={`/user/${review.user.id}`} className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/40 transition-all duration-300">
                            {review.user.image ? (
                              <Image src={review.user.image} alt={review.user.name || 'User'} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {review.user.name?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
                              </div>
                            )}
                          </Link>
                          <div>
                            <Link href={`/user/${review.user.id}`} className="font-bold text-white hover:text-primary transition-colors block">
                              {review.user.name || "Anonymous User"}
                            </Link>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Reviewed Movie Link */}
                        {movie && (
                          <div className="hidden md:block mb-6">
                            <Link href={`/movie/${review.tmdbId}/${slug}`} className="inline-flex flex-col group/movie">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1 group-hover/movie:text-primary transition-colors">Reviewed:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover/movie:text-primary transition-all duration-300">
                                  {movie.title}
                                </span>
                                <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover/movie:opacity-100 transition-all -translate-x-2 group-hover/movie:translate-x-0" />
                              </div>
                            </Link>
                          </div>
                        )}

                        {/* Review Content */}
                        <div className="relative mb-8">
                          {review.title && (
                            <div className="flex items-start gap-3 mb-4">
                              <Quote className="h-6 w-6 text-primary/20 shrink-0 mt-1 rotate-180" />
                              <h3 className="text-2xl font-black text-white italic tracking-tight leading-tight uppercase">
                                {review.title}
                              </h3>
                            </div>
                          )}

                          <p className="text-gray-400 font-medium leading-relaxed line-clamp-4 pl-9 italic relative">
                            <span className="absolute left-0 top-0 text-gray-700 text-4xl leading-none font-serif">"</span>
                            {review.body}
                          </p>
                        </div>

                        {/* Footer / Stats */}
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-gray-500 group/stat">
                              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover/stat:bg-primary/10 group-hover/stat:text-primary transition-colors">
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </div>
                              {review._count.likes}
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-gray-500 group/stat">
                              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover/stat:bg-primary/10 group-hover/stat:text-primary transition-colors">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </div>
                              {review._count.comments}
                            </div>
                          </div>
                          
                          <Link 
                            href={`/movie/${review.tmdbId}/${slug}`} 
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-primary transition-all flex items-center gap-3 group/link"
                          >
                            Full Review
                            <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover/link:border-primary/50 group-hover/link:bg-primary/10 transition-all">
                              <ChevronRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}
