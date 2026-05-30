"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, User, MessageSquare } from "lucide-react";
import type { Influencer, Review } from "@/types";

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submissions, setSubmissions] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [reviewsRes, submissionsRes] = await Promise.all([
        fetch(`/api/reviews/user?userId=${user.id}`).catch(() => null),
        fetch(`/api/influencers/user?userId=${user.id}`).catch(() => null),
      ]);

      if (reviewsRes) {
        const j = await reviewsRes.json();
        setReviews(j.data ?? []);
      }
      if (submissionsRes) {
        const j = await submissionsRes.json();
        setSubmissions(j.data ?? []);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-8 w-8 text-indigo-500" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            My Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Submissions ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>You haven&apos;t written any reviews yet.</p>
              <Button
                variant="link"
                onClick={() => router.push("/influencers")}
                className="mt-2"
              >
                Browse influencers to review
              </Button>
            </div>
          ) : (
            reviews.map((review) => {
                const profile = review.profiles as { display_name?: string | null; username?: string | null; avatar_url?: string | null } | undefined;
                const authorName = profile?.username || profile?.display_name || "Anonymous";
                return (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{review.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">by {authorName}</p>
                </CardContent>
              </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven&apos;t submitted any influencers yet.</p>
              <Button
                variant="link"
                onClick={() => router.push("/submit")}
                className="mt-2"
              >
                Submit an influencer
              </Button>
            </div>
          ) : (
            submissions.map((inf) => (
              <Card key={inf.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{inf.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {inf.category}
                    </p>
                  </div>
                  <Badge
                    variant={
                      inf.status === "approved"
                        ? "default"
                        : inf.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {inf.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
