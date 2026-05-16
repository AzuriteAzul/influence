"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Flag, Trash2 } from "lucide-react";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews`);
    const json = await res.json();
    setReviews(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const handleToggleFlag = async (review: Review) => {
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_flagged: !review.is_flagged }),
    });
    fetchReviews();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Review Moderation</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-24 bg-muted rounded-lg"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No reviews found.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={review.is_flagged ? "border-red-300 dark:border-red-800" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      {review.is_flagged && (
                        <Flag className="h-4 w-4 text-red-500 fill-red-500 ml-2" />
                      )}
                    </div>
                    <h4 className="font-medium">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{review.body}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant={review.is_flagged ? "default" : "outline"}
                      onClick={() => handleToggleFlag(review)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {review.is_flagged ? "Unflag" : "Flag"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
