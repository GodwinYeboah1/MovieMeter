"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewComposer } from "./ReviewComposer";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  spoiler: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  liked?: boolean;
}

interface ReviewListProps {
  tmdbId: number;
}

export function ReviewList({ tmdbId }: ReviewListProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  const fetchReviews = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/reviews?tmdbId=${tmdbId}&page=${pageNum}&limit=10`);
      const data = await response.json();
      
      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId]);

  const handleReviewCreated = () => {
    setShowComposer(false);
    fetchReviews(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Fetching Reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {session && !showComposer && (
        <div className="flex items-center justify-center py-6">
          <Button 
            onClick={() => setShowComposer(true)}
            className="group relative h-16 px-10 rounded-full bg-primary overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Plus className="h-6 w-6 stroke-[3]" />
              <span className="text-lg font-black italic uppercase tracking-tighter">Share Your Verdict</span>
            </div>
          </Button>
        </div>
      )}

      {showComposer && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <ReviewComposer
            tmdbId={tmdbId}
            onSuccess={handleReviewCreated}
            onCancel={() => setShowComposer(false)}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <MessageSquare className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Silence is golden</h3>
          <p className="text-gray-500 max-w-[280px] text-sm font-medium leading-relaxed">
            But your opinion matters. Be the first to break the silence on this title.
          </p>
          {!session && (
            <div className="mt-8 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Login to write a review</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6">
            {reviews.map((review, idx) => (
              <div 
                key={review.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchReviews(nextPage);
                }}
                className="h-14 px-12 rounded-full border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white font-bold uppercase tracking-[0.2em] text-[10px] group transition-all"
              >
                <span className="flex items-center gap-2">
                  Show More Reviews
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
