import { prisma } from "@/lib/db/prisma";
import { tmdb } from "@/lib/providers/tmdb";
import Link from "next/link";
import { generateMovieSlug } from "@/lib/utils/slug";
import Image from "next/image";
import { Star, MessageCircle, ThumbsUp, User, ChevronRight, AlertCircle } from "lucide-react";

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
            <div className="space-y-8">
              {reviews.map((review) => {
                const movie = movieDetailsMap.get(review.tmdbId);
                const slug = movie ? generateMovieSlug(movie.title, movie.release_date) : `movie-${review.tmdbId}`;
                
                return (
                  <div key={review.id} className="group relative bg-[#111] rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex flex-col md:flex-row">
                      {/* Movie Info Sidebar */}
                      {movie && (
                        <Link href={`/movie/${review.tmdbId}/${slug}`} className="md:w-48 lg:w-56 flex-shrink-0 relative aspect-[2/3] md:aspect-auto">
                          <Image
                            src={tmdb.getPosterUrl(movie.poster_path, 'w500') || ''}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 md:hidden">
                            <h3 className="font-bold text-white line-clamp-1">{movie.title}</h3>
                          </div>
                        </Link>
                      )}

                      <div className="flex-grow p-6 md:p-8 flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/5 border border-white/10">
                              {review.user.image ? (
                                <Image src={review.user.image} alt={review.user.name || 'User'} fill className="object-cover" />
                              ) : (
                                <User className="h-5 w-5 absolute inset-0 m-auto text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white leading-none mb-1">
                                {review.user.name || "Anonymous User"}
                              </div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-black">
                            <Star className="h-4 w-4 fill-current" />
                            {review.rating}/10
                          </div>
                        </div>

                        {movie && (
                          <div className="hidden md:block mb-4">
                            <Link href={`/movie/${review.tmdbId}/${slug}`} className="inline-flex items-center gap-2 group/link">
                              <span className="text-xs font-black uppercase tracking-widest text-primary">Reviewed:</span>
                              <span className="text-lg font-black italic tracking-tighter uppercase group-hover/link:text-primary transition-colors">{movie.title}</span>
                              <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
                            </Link>
                          </div>
                        )}

                        {review.title && (
                          <h3 className="text-xl font-bold text-white mb-3 italic tracking-tight">"{review.title}"</h3>
                        )}

                        <p className="text-gray-400 font-light leading-relaxed mb-6 line-clamp-4">
                          {review.body}
                        </p>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            {review._count.likes}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            {review._count.comments}
                          </div>
                          
                          <Link 
                            href={`/movie/${review.tmdbId}/${slug}`} 
                            className="ml-auto text-xs font-black uppercase tracking-widest text-white hover:text-primary transition-colors flex items-center gap-2"
                          >
                            Full Details <ChevronRight className="h-4 w-4" />
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
