"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrailerModalProps {
  trailerKey?: string | null;
  movieTitle: string;
}

export function TrailerModal({ trailerKey, movieTitle }: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);

  const openModal = useCallback(() => {
    if (trailerKey) {
      setIsOpen(true);
      // Small delay to trigger animation
      setTimeout(() => setIsAnimate(true), 10);
    }
  }, [trailerKey]);

  const closeModal = useCallback(() => {
    setIsAnimate(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  useEffect(() => {
    if (!trailerKey) {
      setIsOpen(false);
      setIsAnimate(false);
    }
  }, [trailerKey]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
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
      <Button
        size="lg"
        className="rounded-full h-12 px-8 font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={openModal}
        disabled={!trailerKey}
      >
        <Play className="mr-2 h-5 w-5 fill-current" /> Watch Trailer
      </Button>
      {!trailerKey && (
        <p className="text-xs text-red-400 mt-1">Trailer not available yet.</p>
      )}
      
      {isOpen && trailerKey && (
        <div className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
          isAnimate ? "opacity-100" : "opacity-0"
        )}>
          {/* Backdrop with enhanced blur */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-300"
            onClick={closeModal} 
          />
          
          {/* Modal Content */}
          <div className={cn(
            "relative w-full max-w-5xl rounded-[2.5rem] bg-black shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] border border-white/5 overflow-hidden transition-all duration-500 ease-out transform",
            isAnimate ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
          )}>
            {/* Dynamic Glass Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1">Now Playing</span>
                <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                  {movieTitle} <span className="text-white/40 font-normal">Trailer</span>
                </h2>
              </div>
              
              <button
                className="group relative flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 p-3 text-white transition-all duration-300 border border-white/10 hover:border-white/20"
                onClick={closeModal}
                aria-label="Close trailer"
              >
                <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Video Container */}
            <div className="aspect-video bg-black pt-[88px]">
              <iframe
                title={`${movieTitle} trailer`}
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            
            {/* Subtle bottom accent */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}
