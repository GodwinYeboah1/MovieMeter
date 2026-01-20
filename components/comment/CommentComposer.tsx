"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommentComposerProps {
  reviewId: string;
  onSuccess: () => void;
}

export function CommentComposer({ reviewId, onSuccess }: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (body.trim().length < 3) {
        setError("Comment must be at least 3 characters");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create comment");
        setLoading(false);
        return;
      }

      setBody("");
      onSuccess();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-h-[80px]"
        maxLength={1000}
        placeholder="Write a comment..."
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {body.length} / 1000 characters
        </div>
        {error && (
          <div className="text-xs text-destructive">{error}</div>
        )}
        <Button type="submit" size="sm" disabled={loading || body.trim().length < 3}>
          {loading ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
