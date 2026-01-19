"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { generateMovieSlug } from "@/lib/utils/slug";
import { Search, Loader2, Star, Filter } from "lucide-react";
import { MovieCard } from "@/components/movie/MovieCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">Explore</h1>
              <p className="text-gray-500 font-medium">Find your next favorite movie from millions of titles.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies, actors, genres..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              />
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-bold uppercase tracking-widest text-xs">Searching the multiverse...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="text-center py-24 bg-[#111] rounded-3xl border border-white/5">
              <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/5">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-xl font-bold mb-2">No results for "{query}"</p>
              <p className="text-gray-500 text-sm">Try a different title or check for typos.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 opacity-40">
              <div className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Top Rated</h3>
                <p className="text-sm text-gray-500">Discover movies that the community and critics love the most.</p>
              </div>
              <div className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Filter className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Smart Filters</h3>
                <p className="text-sm text-gray-500">Narrow down your search by genre, release year, or rating.</p>
              </div>
              <div className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Real-time</h3>
                <p className="text-sm text-gray-500">Get instant results as you type with our optimized search engine.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    );
}
