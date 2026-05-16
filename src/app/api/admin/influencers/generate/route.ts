import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { influencerId } = await request.json();

    if (!influencerId) {
      return NextResponse.json({ error: "Missing influencerId" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get the influencer
    const { data: influencer, error: fetchError } = await adminClient
      .from("influencers")
      .select("*")
      .eq("id", influencerId)
      .single();

    if (fetchError || !influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    // Set status to generating
    await adminClient
      .from("influencers")
      .update({ status: "generating" })
      .eq("id", influencerId);

    // Extract social link from the stored data
    const socialLink = influencer.social_links?.link || "";

    // Call DeepSeek to generate the profile
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that researches influencers and creates detailed profile pages. " +
              "Respond ONLY with valid JSON, no markdown, no code fences.",
          },
          {
            role: "user",
            content: `Research this influencer and create a profile page. 
Name: "${influencer.name}"
Social link provided by submitter: ${socialLink || "none"}

Return ONLY a JSON object with these fields:
{
  "name": "the full display name",
  "category": "one of: beauty, gaming, fitness, tech, fashion, food, travel, music, comedy, lifestyle, finance, education, sports, parenting, diy",
  "bio": "a compelling 2-3 sentence bio describing who they are, what they do, and why people follow them. Make it engaging and factual",
  "social_links": {
    "instagram": "full instagram URL or empty string",
    "youtube": "full youtube URL or empty string", 
    "tiktok": "full tiktok URL or empty string",
    "twitter": "full twitter URL or empty string"
  },
  "website": "their official website URL or empty string",
  "profile_image_url": "a direct URL to their profile photo (from a well-known CDN if possible) or empty string"
}

If you don't know a field for certain, leave it as an empty string. Do not fabricate URLs.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);

      // Set back to pending on error
      await adminClient
        .from("influencers")
        .update({ status: "pending" })
        .eq("id", influencerId);

      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      await adminClient
        .from("influencers")
        .update({ status: "pending" })
        .eq("id", influencerId);

      return NextResponse.json({ error: "No content generated" }, { status: 500 });
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch {
          await adminClient
            .from("influencers")
            .update({ status: "pending" })
            .eq("id", influencerId);
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      } else {
        await adminClient
          .from("influencers")
          .update({ status: "pending" })
          .eq("id", influencerId);
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    }

    // Update the influencer with generated content
    const { data: updated, error: updateError } = await adminClient
      .from("influencers")
      .update({
        category: (parsed.category || "lifestyle").toLowerCase(),
        bio: parsed.bio || null,
        profile_image_url: parsed.profile_image_url || null,
        social_links: parsed.social_links || {},
        website: parsed.website || null,
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
