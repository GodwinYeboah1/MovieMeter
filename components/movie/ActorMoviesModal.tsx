"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Star, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { tmdb, TMDBMovie } from "@/lib/providers/tmdb";
import { generateMovieSlug } from "@/lib/utils/slug";
import { cn } from "@/lib/utils/cn";

interface ActorMoviesModalProps {
  actorId: number;
  actorName: string;
  actorImage: string | null;
  children: React.ReactNode;
}

export function ActorMoviesModal({ actorId, actorName, actorImage, children }: ActorMoviesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = useCallback(async () => {
    setIsOpen(true);
    setIsLoading(true);
    setTimeout(() => setIsAnimate(true), 10);

    try {
      const response = await fetch(`/api/person/${actorId}/movies`);
      const data = await response.json();
      setMovies(data.movies || []);
      setDetails(data.details || null);
    } catch (error) {
      console.error("Failed to fetch actor movies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [actorId]);

  const closeModal = useCallback(() => {
    setIsAnimate(false);
    setTimeout(() => {
      setIsOpen(false);
      setMovies([]);
      setDetails(null);
    }, 300);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeModal]);

  return (
    <>
      <div onClick={openModal} className="contents">
        {children}
      </div>

      {isOpen && (
        <div className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
          isAnimate ? "opacity-100" : "opacity-0"
        )}>
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={closeModal} 
          />
          
          <div className={cn(
            "relative w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] bg-[#050505] shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] border border-white/5 overflow-hidden transition-all duration-500 ease-out transform flex flex-col",
            isAnimate ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1">Filmography</span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {actorName}
                </h2>
              </div>
              
              <button
                className="group flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 p-3 text-white transition-all duration-300 border border-white/10"
                onClick={closeModal}
              >
                <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-24 pb-12 px-8 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 animate-pulse">Fetching Credits...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Actor Info Mini Section */}
                  {details && (
                    <div className="flex gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 border border-white/10">
                        <Image
                          src={tmdb.getImageUrl(details.profile_path, 'w300') || ''}
                          alt={details.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        {details.biography && (
                          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                            {details.biography}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                          {details.birthday && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(details.birthday).getFullYear()}
                            </div>
                          )}
                          {details.place_of_birth && (
                            <div>{details.place_of_birth}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Movies Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {movies.map((movie, index) => {
                      const slug = generateMovieSlug(movie.title, movie.release_date);
                      const poster = tmdb.getPosterUrl(movie.poster_path, 'w342');
                      
                      return (
                        <Link 
                          key={movie.id}
                          href={`/movie/${movie.id}/${slug}`}
                          onClick={closeModal}
                          className="group relative flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-primary/20">
                            {poster ? (
                              <Image
                                src={poster}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-[10px] uppercase font-bold text-gray-600">No Poster</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                                {movie.vote_average?.toFixed(1)}
                              </div>
                              <div className="text-[10px] font-bold opacity-60">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <h3 className="text-xs font-bold text-gray-300 group-hover:text-primary transition-colors line-clamp-1 px-1">
                            {movie.title}
                          </h3>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom accent */}
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
