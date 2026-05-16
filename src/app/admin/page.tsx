"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, MessageSquare, Flag } from "lucide-react";

interface AdminStats {
  totalInfluencers: number;
  pendingInfluencers: number;
  totalReviews: number;
  flaggedReviews: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Influencers",
      value: stats?.totalInfluencers ?? "-",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Pending Approval",
      value: stats?.pendingInfluencers ?? "-",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      href: "/admin/influencers",
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? "-",
      icon: MessageSquare,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Flagged Reviews",
      value: stats?.flaggedReviews ?? "-",
      icon: Flag,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      href: "/admin/reviews",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={card.href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
            onClick={() => card.href && router.push(card.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/admin/influencers")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Influencer Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review and approve pending influencer submissions.
            </p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/admin/reviews")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Review Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage flagged and reported reviews.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
