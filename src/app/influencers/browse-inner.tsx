"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Influencer, Category, PaginatedResponse, SortOption } from "@/types";

export default function BrowsePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") ?? "highest_rated") as SortOption;
  const [query, setQuery] = useState(search);

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sort", sort);
    params.set("page", String(page));

    const res = await fetch(`/api/influencers?${params}`);
    const json: PaginatedResponse<Influencer> = await res.json();

    setInfluencers(json.data);
    setTotal(json.total);
    setTotalPages(json.totalPages);
    setLoading(false);
  }, [search, category, sort, page]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/influencers?${params}`);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", query);
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Influencers</h1>
        <p className="text-muted-foreground mt-1">
          {total} influencer{total !== 1 ? "s" : ""} reviewed
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="highest_rated">Highest Rated</option>
          <option value="most_reviewed">Most Reviewed</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Badge
          variant={!category ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => updateParams("category", "")}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={category === cat.name.toLowerCase() ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              updateParams(
                "category",
                category === cat.name.toLowerCase() ? "" : cat.name.toLowerCase(),
              )
            }
          >
            {cat.icon} {cat.name}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No influencers found.{" "}
            <a href="/submit" className="text-indigo-500 hover:underline">
              Submit one?
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((inf) => (
              <a key={inf.id} href={`/influencers/${inf.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {inf.name}
                        </h3>
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

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {renderStars(inf.average_rating)}
                        <span className="text-sm font-medium">
                          {inf.average_rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {inf.total_reviews} review{inf.total_reviews !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

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
                Page {page} of {totalPages}
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
        </>
      )}
    </div>
  );
}
