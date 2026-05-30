import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
}

interface TavilySearchResponse {
  results?: TavilyResult[];
  images?: string[];
  answer?: string;
}

interface DeepSeekMessage {
  role: "system" | "user";
  content: string;
}

async function tavilySearch(query: string, includeImages = false): Promise<TavilySearchResponse> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return { results: [], images: [] };

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: "advanced",
        include_answer: true,
        include_images: includeImages,
        max_results: 5,
      }),
    });
    if (!res.ok) return { results: [], images: [] };
    return await res.json();
  } catch {
    return { results: [], images: [] };
  }
}

async function callDeepSeek(messages: DeepSeekMessage[]) {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? null;
}

function extractJSON(content: string): object | null {
  try { return JSON.parse(content); } catch {}
  const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1].trim()); } catch { return null; } }
  return null;
}

function dedupeUrls(list: string[]): string[] {
  return [...new Set(list)];
}

export async function POST(request: NextRequest) {
  try {
    const { influencerId } = await request.json();
    if (!influencerId) {
      return NextResponse.json({ error: "Missing influencerId" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: influencer, error: fetchError } = await adminClient
      .from("influencers")
      .select("*")
      .eq("id", influencerId)
      .single();

    if (fetchError || !influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    await adminClient
      .from("influencers")
      .update({ status: "generating" })
      .eq("id", influencerId);

    const name = influencer.name;

    // Step 1: Search the web — all include images, plus a dedicated image query
    const [profileSearch, socialSearch, imageSearch] = await Promise.all([
      tavilySearch(`"${name}" influencer bio content creator what they do`, true),
      tavilySearch(`"${name}" instagram youtube tiktok twitter social media`, true),
      tavilySearch(`"${name}" photo face profile picture`, true),
    ]);

    const totalResults = [
      ...(profileSearch.results ?? []),
      ...(socialSearch.results ?? []),
    ];

    const allImages = dedupeUrls([
      ...(profileSearch.images ?? []),
      ...(socialSearch.images ?? []),
      ...(imageSearch.images ?? []),
    ]);

    const aiAnswer = profileSearch.answer ?? socialSearch.answer ?? "";

    console.log(
      `Tavily: ${totalResults.length} results, ${allImages.length} images for "${name}"`
    );

    const webData = totalResults
      .slice(0, 8)
      .map(
        (r: TavilyResult, i: number) =>
          `[${i + 1}] ${r.title ?? "untitled"}\nURL: ${r.url ?? "N/A"}\n${(r.content ?? "").slice(0, 600)}`
      )
      .join("\n\n");

    const imageUrls = allImages
      .slice(0, 5)
      .map((url, i) => `[IMG${i + 1}] ${url}`)
      .join("\n");

    // Step 2: Generate with DeepSeek using real data
    const systemPrompt =
      "You create accurate influencer profile pages from real web search results. " +
      "Use ONLY information found in the provided search results. " +
      "Extract social media URLs exactly as they appear in the results. " +
      "Pick the most professional-looking profile image URL from the image list. " +
      "Never include age, follower/subscriber counts, or numeric statistics that change over time. " +
      "Focus on what the creator does, their content style, and their niche. " +
      "Respond with ONLY valid JSON, no markdown, no code fences.";

    const userPrompt = `Create a profile for "${name}".
${aiAnswer ? `\nWeb search summary:\n${aiAnswer.slice(0, 500)}\n` : ""}

WEB SEARCH RESULTS:
${webData || "No results found."}

IMAGE RESULTS:
${imageUrls || "No images found."}

Return a JSON object:
{
  "name": "${name}",
  "category": "beauty|gaming|fitness|tech|fashion|food|travel|music|comedy|lifestyle|finance|education|sports|parenting|diy",
  "bio": "2-3 timeless sentences about who they are, what kind of content they create, and their niche. Never include age, follower counts, subscriber numbers, or numeric statistics that change over time.",
  "social_links": {
    "instagram": "full URL from results or ''",
    "youtube": "full URL from results or ''",
    "tiktok": "full URL from results or ''",
    "twitter": "full URL from results or ''"
  },
  "website": "official site URL or ''",
  "profile_image_url": "best image URL from the image list or ''"
}`;

    const content = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    if (!content) {
      await adminClient
        .from("influencers")
        .update({ status: "pending" })
        .eq("id", influencerId);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const parsed = extractJSON(content);
    if (!parsed) {
      await adminClient
        .from("influencers")
        .update({ status: "pending" })
        .eq("id", influencerId);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const p = parsed as Record<string, unknown>;
    const { data: updated, error: updateError } = await adminClient
      .from("influencers")
      .update({
        category: ((p.category as string) || "lifestyle").toLowerCase(),
        bio: (p.bio as string) || null,
        profile_image_url: (p.profile_image_url as string) || null,
        social_links: (p.social_links as object) || {},
        website: (p.website as string) || null,
        status: "pending_review",
      })
      .eq("id", influencerId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to save generated content" }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
