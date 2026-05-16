"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Category } from "@/types";

const steps = ["Basic Info", "Social Links", "Details", "Review"];

export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    bio: "",
    profile_image_url: "",
    website: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    twitter: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = () => {
    if (step === 0) return form.name.length >= 2 && form.category !== "";
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const body = {
      name: form.name,
      category: form.category,
      bio: form.bio || undefined,
      profile_image_url: form.profile_image_url || undefined,
      website: form.website || undefined,
      social_links: {
        instagram: form.instagram || undefined,
        youtube: form.youtube || undefined,
        tiktok: form.tiktok || undefined,
        twitter: form.twitter || undefined,
      },
    };

    const res = await fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold">Submitted for Review</h1>
        <p className="text-muted-foreground">
          Your influencer submission has been sent to our team for approval.
          You'll be notified once it's reviewed.
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
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit an Influencer</h1>
        <p className="text-muted-foreground mt-1">
          Help the community by adding an influencer to our platform.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step
                  ? "bg-indigo-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i <= step ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${i < step ? "bg-indigo-500" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "What's the influencer's name and category?"}
            {step === 1 && "Add their social media handles (optional)"}
            {step === 2 && "Tell us more about them"}
            {step === 3 && "Review your submission before sending"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. MrBeast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) => update("category", v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {(["instagram", "youtube", "tiktok", "twitter"] as const).map(
                (platform) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {platform}
                    </label>
                    <Input
                      value={form[platform]}
                      onChange={(e) => update(platform, e.target.value)}
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ),
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Image URL
                </label>
                <Input
                  value={form.profile_image_url}
                  onChange={(e) => update("profile_image_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website
                </label>
                <Input
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Tell us about this influencer..."
                  rows={4}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Star className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                <div>
                  <p className="font-semibold">{form.name || "(No name)"}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {form.category || "No category"}
                  </p>
                </div>
              </div>
              {form.bio && (
                <p className="text-sm text-muted-foreground">{form.bio}</p>
              )}
              {form.website && (
                <p className="text-sm">
                  <span className="font-medium">Website:</span> {form.website}
                </p>
              )}
              {Object.entries({
                Instagram: form.instagram,
                YouTube: form.youtube,
                TikTok: form.tiktok,
                Twitter: form.twitter,
              }).some(([, v]) => v) && (
                <div>
                  <p className="text-sm font-medium mb-1">Social Links:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Object.entries({
                      Instagram: form.instagram,
                      YouTube: form.youtube,
                      TikTok: form.tiktok,
                      Twitter: form.twitter,
                    })
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <li key={k}>{k}: {v}</li>
                      ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-muted-foreground pt-2">
                Status: <span className="text-amber-500 font-medium">Pending approval</span>
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
