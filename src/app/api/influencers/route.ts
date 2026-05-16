import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { influencerSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "highest_rated";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? String(PAGE_SIZE));
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from("influencers")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  switch (sort) {
    case "most_reviewed":
      query = query.order("total_reviews", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "highest_rated":
    default:
      query = query.order("average_rating", { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = influencerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, category, bio, profile_image_url, social_links, website } =
    parsed.data;

  const slug = generateSlug(name);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("influencers")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("influencers")
    .insert({
      name,
      slug: finalSlug,
      category,
      bio: bio ?? null,
      profile_image_url: profile_image_url || null,
      social_links: social_links ?? {},
      website: website || null,
      status: "pending",
      submitted_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
