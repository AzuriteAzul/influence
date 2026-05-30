"use client";

import { Star } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  onUpdate?: () => void;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const profile = review.profiles as
    | { display_name?: string; username?: string; avatar_url?: string }
    | undefined;

  const displayName = profile?.username || profile?.display_name || "Anonymous";

  return (
    <div className="border rounded-lg p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(review.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium">{review.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{review.body}</p>
      </div>
    </div>
  );
}
