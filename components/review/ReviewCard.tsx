"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/comment/CommentList";
import { useState } from "react";
import { Star, MessageCircle, ThumbsUp, AlertTriangle, User } from "lucide-react";
import Image from "next/image";

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
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.spoiler);

  const isOwner = session?.user?.id === review.user.id;
  
  return (
    <div className="bg-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10 shadow-xl">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            {review.user.image ? (
              <Image
                src={review.user.image}
                alt={review.user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-white group-hover:text-primary transition-colors">
                {review.user.name || "Anonymous User"}
              </h4>
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold">
                <Star className="h-3 w-3 fill-current" />
                {review.rating}/10
              </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {review.title && (
          <h3 className="text-xl font-bold text-white mb-3 italic tracking-tight">
            "{review.title}"
          </h3>
        )}

        <div className="relative">
          {review.spoiler && !spoilerRevealed ? (
            <div className="bg-muted border border-yellow-500/20 p-6 rounded-xl text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-gray-400">This review contains spoilers</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpoilerRevealed(true)}
                className="rounded-full border-primary/50 text-primary hover:bg-primary/10"
              >
                Reveal Content
              </Button>
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-light">
              {review.body}
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors">
            <ThumbsUp className="h-4 w-4" />
            {review._count.likes}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${showComments ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <MessageCircle className="h-4 w-4" />
            {review._count.comments} {review._count.comments === 1 ? 'Comment' : 'Comments'}
          </button>
        </div>

        {showComments && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
            <CommentList reviewId={review.id} />
          </div>
        )}
      </div>
    </div>
  );
}
