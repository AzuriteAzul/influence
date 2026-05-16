import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: influencer, error } = await supabase
    .from("influencers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !influencer) {
    return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
  }

  // Get rating distribution
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("influencer_id", influencer.id);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews?.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });

  return NextResponse.json({
    data: {
      ...influencer,
      rating_distribution: distribution,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: influencer } = await supabase
    .from("influencers")
    .select("claimed_by")
    .eq("slug", slug)
    .single();

  if (!influencer || influencer.claimed_by !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("influencers")
    .update({
      bio: body.bio,
      profile_image_url: body.profile_image_url,
      social_links: body.social_links,
      website: body.website,
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
