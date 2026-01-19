"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Film } from "lucide-react";
import { tmdb } from "@/lib/providers/tmdb";
import { generateMovieSlug } from "@/lib/utils/slug";
import { cn } from "@/lib/utils/cn";
import { TMDBMovie } from "@/lib/providers/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const slug = generateMovieSlug(movie.title, movie.release_date);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average?.toFixed(1) || '0.0';
  const posterUrl = tmdb.getPosterUrl(movie.poster_path, 'w500');

  return (
    <Link href={`/movie/${movie.id}/${slug}`} className={cn("block group", className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#1a1a1a] transition-all duration-500 hover:scale-[1.02] hover:z-10 hover:shadow-2xl hover:shadow-primary/30 border border-white/5">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
              <Film className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">No Poster</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Info on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <h3 className="text-sm font-bold line-clamp-2 leading-tight mb-1">{movie.title}</h3>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-300">
            <span>{releaseYear}</span>
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          </div>
        </div>

        {/* Floating Badge for high rating */}
        {parseFloat(rating) >= 8 && (
          <div className="absolute top-2 right-2 z-20 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded shadow-lg transition-all duration-300 group-hover:bg-primary uppercase tracking-widest">
            Must Watch
          </div>
        )}
      </div>
    </Link>
  );
}
