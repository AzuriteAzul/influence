import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const [
    { count: totalInfluencers },
    { count: pendingInfluencers },
    { count: totalReviews },
    { count: flaggedReviews },
  ] = await Promise.all([
    adminClient.from("influencers").select("*", { count: "exact", head: true }),
    adminClient.from("influencers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    adminClient.from("reviews").select("*", { count: "exact", head: true }),
    adminClient.from("reviews").select("*", { count: "exact", head: true }).eq("is_flagged", true),
  ]);

  return NextResponse.json({
    totalInfluencers: totalInfluencers ?? 0,
    pendingInfluencers: pendingInfluencers ?? 0,
    totalReviews: totalReviews ?? 0,
    flaggedReviews: flaggedReviews ?? 0,
  });
}
