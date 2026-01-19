"use client";

import { useEffect, useState } from "react";
import { CommentCard } from "./CommentCard";
import { CommentComposer } from "./CommentComposer";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentListProps {
  reviewId: string;
}

export function CommentList({ reviewId }: CommentListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const handleCommentCreated = () => {
    fetchComments();
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {session && (
        <CommentComposer reviewId={reviewId} onSuccess={handleCommentCreated} />
      )}
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {session ? "No comments yet. Be the first to comment!" : "Sign in to comment"}
        </div>
      ) : (
        comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}
