"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Globe, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ReviewList } from "@/components/reviews/ReviewList";
import type { InfluencerWithStats } from "@/types";

export default function InfluencerProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [influencer, setInfluencer] = useState<InfluencerWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/influencers/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(({ data }) => {
        setInfluencer(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Influencer not found");
        setLoading(false);
      });
  }, [slug]);

  const renderStars = (rating: number, size = "default") => {
    const cls = size === "lg" ? "h-6 w-6" : "h-4 w-4";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${cls} ${
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !influencer) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Influencer not found</h1>
        <p className="text-muted-foreground mt-2">
          This influencer doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const dist = influencer.rating_distribution;
  const total = influencer.total_reviews;
  const socials = influencer.social_links as Record<string, string>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Hero section */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={influencer.profile_image_url ?? undefined} alt={influencer.name} />
            <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              {getInitials(influencer.name)}
            </AvatarFallback>
          </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{influencer.name}</h1>
            <Badge className="capitalize">{influencer.category}</Badge>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {renderStars(influencer.average_rating, "lg")}
            <span className="text-2xl font-bold">
              {influencer.average_rating}
            </span>
            <span className="text-muted-foreground">
              ({influencer.total_reviews} review{influencer.total_reviews !== 1 ? "s" : ""})
            </span>
          </div>

          {influencer.bio && (
            <p className="text-muted-foreground">{influencer.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            {influencer.website && (
              <a
                href={influencer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600"
              >
                <Globe className="h-4 w-4" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600"
              >
                Instagram
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socials.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600"
              >
                YouTube
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socials.tiktok && (
              <a
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600"
              >
                TikTok
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600"
              >
                Twitter
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Rating distribution */}
      {dist && total > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          <div className="space-y-2 max-w-md">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm w-8 text-right">{star} ★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewList influencerSlug={slug} />
    </div>
  );
}
