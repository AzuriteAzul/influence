import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: reviews, error } = await adminClient
    .from("reviews")
    .select("*, influencers!inner(slug, name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Batch fetch profiles for review authors
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const profilesMap: Record<string, { id: string; display_name: string | null; username: string | null; avatar_url: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", userIds);

    (profiles ?? []).forEach((p) => {
      profilesMap[p.id] = p;
    });
  }

  const data = (reviews ?? []).map((review) => ({
    ...review,
    profiles: profilesMap[review.user_id] || null,
  }));

  return NextResponse.json({ data });
}
