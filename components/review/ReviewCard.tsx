"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/comment/CommentList";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Star, MessageCircle, ThumbsUp, AlertTriangle, User, Quote } from "lucide-react";
import Image from "next/image";
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

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.spoiler);
  const [liked, setLiked] = useState(review.liked || false);
  const [likeCount, setLikeCount] = useState(review._count.likes);

  const isOwner = session?.user?.id === review.user.id;

  const handleLikeToggle = async () => {
    if (!session?.user) {
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const method = wasLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method,
      });

      if (!response.ok) {
        setLiked(wasLiked);
        setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        const data = await response.json();
        console.error("Failed to toggle like:", data.error);
      } else {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Failed to toggle like:", error);
    }
  };
  
  return (
    <Card className="bg-[#1a1a1a] border-white/5 hover:border-primary/20 transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: User Info & Rating */}
          <div className="md:w-48 p-6 bg-white/[0.02] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 transition-colors shadow-2xl">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary/60" />
              )}
            </div>
            
            <div className="text-center">
              <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                {review.user.name || "Anonymous"}
              </h4>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div className="flex flex-col items-center bg-primary/10 rounded-xl p-3 border border-primary/20 w-full max-w-[100px]">
              <div className="text-2xl font-black text-primary leading-none">{review.rating}</div>
              <div className="text-[8px] uppercase tracking-widest text-primary/60 font-bold mt-1">out of 10</div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex-grow p-6 md:p-8 flex flex-col">
            <div className="flex-grow relative">
              {review.title && (
                <div className="relative mb-4">
                  <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/10 -z-10" />
                  <h3 className="text-2xl font-black text-white italic tracking-tight leading-tight">
                    {review.title}
                  </h3>
                </div>
              )}

              <div className="relative">
                {review.spoiler && !spoilerRevealed ? (
                  <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-2xl text-center space-y-4 my-4">
                    <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Spoiler Alert</p>
                      <p className="text-xs text-gray-500 mt-1">This review contains plot details.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSpoilerRevealed(true)}
                      className="rounded-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 h-10 px-6 font-bold uppercase tracking-widest text-[10px]"
                    >
                      Reveal Review
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-400 leading-relaxed whitespace-pre-wrap font-medium text-lg italic">
                    {review.body}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLikeToggle}
                  disabled={!session?.user}
                  className={cn(
                    "flex items-center gap-2 group/btn transition-all duration-300",
                    liked ? "text-primary" : "text-gray-500 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300",
                    liked ? "bg-primary/20" : "bg-white/5 group-hover/btn:bg-white/10"
                  )}>
                    <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{likeCount}</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className={cn(
                    "flex items-center gap-2 group/btn transition-all duration-300",
                    showComments ? "text-primary" : "text-gray-500 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300",
                    showComments ? "bg-primary/20" : "bg-white/5 group-hover/btn:bg-white/10"
                  )}>
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {review._count.comments}
                  </span>
                </button>
              </div>

              {isOwner && (
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                  Your Review
                </div>
              )}
            </div>
          </div>
        </div>

        {showComments && (
          <div className="bg-black/20 border-t border-white/5 p-6 md:p-8 animate-in fade-in slide-in-from-top-2">
            <CommentList reviewId={review.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
