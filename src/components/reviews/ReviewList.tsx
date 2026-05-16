"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { PenLine } from "lucide-react";
import type { Review } from "@/types";

interface ReviewListProps {
  influencerSlug: string;
}

export function ReviewList({ influencerSlug }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/influencers/${influencerSlug}/reviews?page=${page}&sort=${sort}`,
    );
    const json = await res.json();
    setReviews(json.data ?? []);
    setTotal(json.total);
    setTotalPages(json.totalPages);
    setLoading(false);
  }, [influencerSlug, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    setPage(1);
    fetchReviews();
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Reviews ({total})
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PenLine className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <ReviewForm
            influencerSlug={influencerSlug}
            onSubmitted={handleReviewSubmitted}
            onCancel={() => setShowForm(false)}
          />
          <Separator className="mt-6" />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3 p-4 border rounded-lg">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onUpdate={fetchReviews} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
