"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Search, TrendingUp, Users, Shield, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import type { Influencer, Category } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [trending, setTrending] = useState<Influencer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ influencers: 0, categories: 0 });

  useEffect(() => {
    fetch("/api/influencers?sort=most_reviewed&limit=6")
      .then((r) => r.json())
      .then((json) => setTrending(json.data ?? []))
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => {
        setCategories(data ?? []);
        setStats((s) => ({ ...s, categories: data?.length ?? 0 }));
      })
      .catch(() => {});

    fetch("/api/influencers?limit=1")
      .then((r) => r.json())
      .then((json) => setStats((s) => ({ ...s, influencers: json.total ?? 0 })))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/influencers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-background to-violet-50 dark:from-indigo-950/20 dark:via-background dark:to-violet-950/20" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/80 text-sm">
              <Shield className="h-4 w-4 text-indigo-500" />
              The Platform for Influencer Discovery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find Trustworthy{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Influencers
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Read honest reviews, share your experiences, and make informed decisions
              before following or collaborating.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex gap-3 max-w-lg mx-auto pt-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any influencer..."
                  className="w-full rounded-xl border bg-background pl-11 pr-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl">
                Search
              </Button>
            </form>

            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/influencers")}
              >
                Browse All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/submit")}
              >
                Submit an Influencer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-500">{stats.influencers}</p>
              <p className="text-sm text-muted-foreground">Influencers Reviewed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-500">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-500">
                <Users className="h-8 w-8 mx-auto text-indigo-500" />
              </p>
              <p className="text-sm text-muted-foreground">Community Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
                Trending Influencers
              </h2>
              <p className="text-muted-foreground mt-1">
                Most reviewed influencers on {SITE_NAME}
              </p>
            </div>
            <Button variant="ghost" onClick={() => router.push("/influencers")}>
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((inf) => (
              <a key={inf.id} href={`/influencers/${inf.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{inf.name}</h3>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {inf.category}
                        </Badge>
                      </div>
<Avatar className="h-12 w-12 ml-3 border border-border">
                          <AvatarImage src={inf.profile_image_url ?? undefined} alt={inf.name} />
                          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                            {getInitials(inf.name)}
                          </AvatarFallback>
                        </Avatar>
                    </div>
                    {inf.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {inf.bio}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(inf.average_rating)}
                        <span className="text-sm font-medium">
                          {inf.average_rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {inf.total_reviews} reviews
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-2">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Find influencers in your favorite niche
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {categories.slice(0, 10).map((cat) => (
              <a
                key={cat.id}
                href={`/influencers?category=${cat.name.toLowerCase()}`}
              >
                <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="text-sm font-medium mt-2">{cat.name}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-muted-foreground text-center mb-12">
          Three simple steps to informed decisions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Search,
              title: "Search",
              desc: "Look up any influencer by name or browse by category",
            },
            {
              icon: Star,
              title: "Read Reviews",
              desc: "See honest ratings and detailed experiences from real people",
            },
            {
              icon: Shield,
              title: "Make Informed Decisions",
              desc: "Decide who to follow or collaborate with based on reputation",
            },
          ].map((step, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
                <step.icon className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to share your experience?</h2>
          <p className="text-muted-foreground">
            Join the community and help others make informed decisions.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/submit")}>
              Submit an Influencer
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/influencers")}>
              Start Browsing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
