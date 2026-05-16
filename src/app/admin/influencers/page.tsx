"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import type { Influencer } from "@/types";

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchInfluencers = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/influencers?status=${status}`);
    const json = await res.json();
    setInfluencers(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInfluencers();
  }, [status]);

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    const res = await fetch("/api/admin/influencers/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: id }),
    });
    setGeneratingId(null);

    if (res.ok) {
      setStatus("pending_review");
    } else {
      alert("Generation failed. Check the API key.");
      fetchInfluencers();
    }
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/influencers/${id}/approve`, { method: "POST" });
    fetchInfluencers();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    await fetch(`/api/admin/influencers/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    fetchInfluencers();
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "pending":
        return { label: "Needs Generation", color: "secondary" as const };
      case "generating":
        return { label: "AI Generating...", color: "secondary" as const };
      case "pending_review":
        return { label: "Ready for Review", color: "default" as const };
      case "approved":
        return { label: "Published", color: "default" as const };
      case "rejected":
        return { label: "Rejected", color: "destructive" as const };
      default:
        return { label: s, color: "secondary" as const };
    }
  };

  const tabs = [
    { value: "pending", label: "New" },
    { value: "generating", label: "Generating" },
    { value: "pending_review", label: "To Review" },
    { value: "approved", label: "Published" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Influencer Management</h1>

      <Tabs
        value={status}
        onValueChange={(v) => setStatus(v ?? "pending")}
        className="mb-6"
      >
        <TabsList className="flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-24 bg-muted rounded-lg"
            />
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No {status.replace("_", " ")} influencers.
        </p>
      ) : (
        <div className="space-y-4">
          {influencers.map((inf) => {
            const s = statusLabel(inf.status);
            const socials = inf.social_links as Record<string, string>;
            return (
              <Card key={inf.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{inf.name}</h4>
                        <Badge variant={s.color}>{s.label}</Badge>
                      </div>

                      {/* Show submitted social link for pending */}
                      {inf.status === "pending" && socials?.link && (
                        <p className="text-xs text-muted-foreground">
                          Submitted link:{" "}
                          <a
                            href={socials.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-500 hover:underline"
                          >
                            {socials.link}
                          </a>
                        </p>
                      )}

                      {/* Show generated content for review */}
                      {(inf.status === "pending_review" ||
                        inf.status === "generating") && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                          {inf.category && inf.category !== "pending" && (
                            <p>
                              <span className="font-medium">Category:</span>{" "}
                              {inf.category}
                            </p>
                          )}
                          {inf.bio && (
                            <p>
                              <span className="font-medium">Bio:</span> {inf.bio}
                            </p>
                          )}
                          {socials?.instagram && (
                            <p>
                              <span className="font-medium">Instagram:</span>{" "}
                              {socials.instagram}
                            </p>
                          )}
                          {socials?.youtube && (
                            <p>
                              <span className="font-medium">YouTube:</span>{" "}
                              {socials.youtube}
                            </p>
                          )}
                          {socials?.tiktok && (
                            <p>
                              <span className="font-medium">TikTok:</span>{" "}
                              {socials.tiktok}
                            </p>
                          )}
                          {socials?.twitter && (
                            <p>
                              <span className="font-medium">Twitter:</span>{" "}
                              {socials.twitter}
                            </p>
                          )}
                          {inf.website && (
                            <p>
                              <span className="font-medium">Website:</span>{" "}
                              {inf.website}
                            </p>
                          )}
                          {inf.profile_image_url && (
                            <p className="truncate">
                              <span className="font-medium">Image:</span>{" "}
                              {inf.profile_image_url}
                            </p>
                          )}
                        </div>
                      )}

                      {inf.status === "approved" && inf.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {inf.bio}
                        </p>
                      )}

                      {inf.rejection_reason && (
                        <p className="text-sm text-destructive">
                          Reason: {inf.rejection_reason}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {inf.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleGenerate(inf.id)}
                            disabled={generatingId === inf.id}
                          >
                            {generatingId === inf.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-1" />
                            )}
                            Generate with AI
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(inf.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {inf.status === "generating" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          AI is generating...
                        </div>
                      )}

                      {inf.status === "pending_review" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(inf.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve & Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(inf.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
