"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";
import type { Influencer } from "@/types";

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Influencer Management</h1>

      <Tabs value={status} onValueChange={(v) => setStatus(v ?? "pending")} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({influencers.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
          No {status} influencers.
        </p>
      ) : (
        <div className="space-y-4">
          {influencers.map((inf) => (
            <Card key={inf.id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">{inf.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {inf.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Slug: {inf.slug}
                    </span>
                  </div>
                  {inf.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {inf.bio}
                    </p>
                  )}
                  {inf.rejection_reason && (
                    <p className="text-sm text-destructive mt-1">
                      Rejected: {inf.rejection_reason}
                    </p>
                  )}
                </div>

                {status === "pending" && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(inf.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(inf.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
