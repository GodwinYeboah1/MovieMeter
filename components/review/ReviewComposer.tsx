"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Star, AlertCircle, X, Check } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(10),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(5000),
  spoiler: z.boolean(),
});

interface ReviewComposerProps {
  tmdbId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewComposer({ tmdbId, onSuccess, onCancel }: ReviewComposerProps) {
  const [rating, setRating] = useState(7);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validation = reviewSchema.safeParse({
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        spoiler,
      });

      if (!validation.success) {
        setError("Please check your input. Review must be at least 10 characters.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          ...validation.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create review");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-primary/20 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Write Your Review</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Your Rating</label>
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-lg font-black">
              <Star className="h-5 w-5 fill-current" />
              {rating}/10
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
            <span>Terrible</span>
            <span>Mediocre</span>
            <span>Masterpiece</span>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Review Title <span className="text-[10px] font-normal lowercase tracking-normal">(optional)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
            maxLength={200}
            placeholder="Sum up your thoughts in a few words..."
          />
        </div>

        {/* Body Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Your Thoughts</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[180px] font-light leading-relaxed"
            maxLength={5000}
            placeholder="What did you like or dislike? Would you recommend it?"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              {body.length} / 5000 characters
            </span>
            {body.length > 0 && body.length < 10 && (
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Needs {10 - body.length} more chars
              </span>
            )}
          </div>
        </div>

        {/* Spoiler Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={spoiler}
              onChange={(e) => setSpoiler(e.target.checked)}
            />
            <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Contains Spoilers</span>
        </div>

        {error && (
          <div className="flex items-center gap-3 text-sm text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="flex-grow h-14 rounded-full font-black uppercase tracking-widest italic text-lg shadow-xl shadow-primary/20"
          >
            {loading ? "Publishing..." : (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5" /> Publish Review
              </span>
            )}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="h-14 px-8 rounded-full font-bold uppercase tracking-widest text-gray-400 hover:text-white"
          >
            Discard
          </Button>
        </div>
      </form>
    </div>
  );
}
