"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        social_link: socialLink.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Submission failed");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-24 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold">Submitted for Review</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          An admin will review <strong>{name}</strong>. Once approved, our AI will
          generate a full profile. The admin will review the generated content
          before publishing.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go Home
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            View Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit an Influencer</h1>
        <p className="text-muted-foreground mt-1">
          Just tell us their name. We&apos;ll handle the rest with AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Influencer Details</CardTitle>
          <CardDescription>
            After admin approval, AI will automatically research and generate
            their bio, category, social links, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Influencer Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MrBeast, Emma Chamberlain"
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Social Link (optional)
              </label>
              <Input
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="e.g. https://youtube.com/@mrbeast"
                type="url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A link to any of their social profiles helps AI generate a better page.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
