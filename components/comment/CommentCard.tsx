"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

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

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === comment.user.id;
  const canModerate = session?.user?.role === "ADMIN";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className="border-l-2 pl-4 py-2">
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="font-medium text-sm">{comment.user.name || "Anonymous"}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        {(isOwner || canModerate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}
