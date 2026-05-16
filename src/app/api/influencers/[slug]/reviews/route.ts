import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSchema } from "@/lib/validations";
import { REVIEW_PAGE_SIZE } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? String(REVIEW_PAGE_SIZE));
  const sort = searchParams.get("sort") ?? "newest";
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  const { data: influencer } = await supabase
    .from("influencers")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!influencer) {
    return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
  }

  let query = supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("influencer_id", influencer.id);

  switch (sort) {
    case "highest":
      query = query.order("rating", { ascending: false });
      break;
    case "lowest":
      query = query.order("rating", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data: reviews, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Batch fetch profiles for review authors
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const profilesMap: Record<string, { display_name: string; username: string; avatar_url: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
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

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function POST(
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

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { rating, title, body: reviewBody } = parsed.data;

  // Get influencer by slug
  const { data: influencer } = await supabase
    .from("influencers")
    .select("id, status")
    .eq("slug", slug)
    .single();

  if (!influencer || influencer.status !== "approved") {
    return NextResponse.json(
      { error: "Influencer not found or not approved" },
      { status: 404 },
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("reviews")
    .insert({
      influencer_id: influencer.id,
      user_id: user.id,
      rating,
      title,
      body: reviewBody,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already reviewed this influencer" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
