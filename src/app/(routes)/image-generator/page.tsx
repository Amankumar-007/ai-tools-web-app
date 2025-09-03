"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrlToAnalyze, setImageUrlToAnalyze] = useState("");
  const [question, setQuestion] = useState("What is in this image?");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisAnswer, setAnalysisAnswer] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setImageUrl(null);
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setImageUrl(data.dataUrl as string);
    } catch (err: any) {
      setError(err?.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    setAnalysisError(null);
    setAnalysisAnswer(null);
    if (!imageUrlToAnalyze.trim()) {
      setAnalysisError("Please enter an image URL");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrlToAnalyze, question }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setAnalysisAnswer(String(data.answer || ""));
    } catch (err: any) {
      setAnalysisError(err?.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="relative container mx-auto max-w-5xl px-4 py-10">
      {/* Fixed blurred background (light/dark) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: "url('/generated-image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "url(" + "'/generated-image (1).png'" + ")",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      <h1 className="text-3xl font-bold mb-6">Image Generator (OpenRouter Images)</h1>

      <Card className="p-6 space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <div className="flex items-center gap-3">
              <select
                id="size"
                className="border rounded-md px-3 py-2 bg-transparent"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="512x512">512 x 512</option>
                <option value="768x768">768 x 768</option>
                <option value="1024x1024">1024 x 1024</option>
                <option value="768x1024">768 x 1024 (portrait)</option>
                <option value="1024x768">1024 x 768 (landscape)</option>
              </select>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {imageUrl && (
          <div className="space-y-3">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full rounded-md border"
            />
            <div className="flex gap-3">
              <a href={imageUrl} download="gemini-image.png">
                <Button variant="secondary">Download</Button>
              </a>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(imageUrl)}
              >
                Copy Data URL
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Image understanding via OpenRouter (Gemini 2.5 Flash Image Preview) */}
      <Card className="p-6 space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Analyze an Image (OpenRouter)</h2>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrlToAnalyze}
              onChange={(e) => setImageUrlToAnalyze(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is in this image?"
            />
          </div>
          <Button type="submit" disabled={analyzing}>
            {analyzing ? "Analyzing..." : "Analyze Image"}
          </Button>
        </form>

        {analysisError && (
          <div className="text-sm text-red-500">{analysisError}</div>
        )}

        {analysisAnswer && (
          <div className="text-sm whitespace-pre-wrap">{analysisAnswer}</div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground mt-4">
        Set OPENROUTER_API_KEY in your environment. Optional (for rankings headers): NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SITE_NAME.
      </p>
    </div>
  );
}
