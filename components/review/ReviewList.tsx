"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewComposer } from "./ReviewComposer";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

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
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div>
      {session && !showComposer && (
        <div className="mb-6">
          <Button onClick={() => setShowComposer(true)}>Write a Review</Button>
        </div>
      )}

      {showComposer && (
        <div className="mb-6">
          <ReviewComposer
            tmdbId={tmdbId}
            onSuccess={handleReviewCreated}
            onCancel={() => setShowComposer(false)}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">Be the first to review this movie!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchReviews(nextPage);
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
