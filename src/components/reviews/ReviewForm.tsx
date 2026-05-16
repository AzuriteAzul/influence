"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
  influencerSlug: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function ReviewForm({
  influencerSlug,
  onSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch(`/api/influencers/${influencerSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title, body }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit review");
      setLoading(false);
      return;
    }

    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-5 space-y-4 bg-card">
      <h3 className="font-semibold">Write a Review</h3>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-sm font-medium mb-1">
          Review
        </label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your detailed experience..."
          rows={4}
          required
          minLength={10}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {body.length}/2000 characters
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
