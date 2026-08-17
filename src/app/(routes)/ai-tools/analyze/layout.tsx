import type { Metadata } from "next";
import { createPageMetadata } from "@/metadata-utils";

export const metadata: Metadata = createPageMetadata({
  title: "AI Tool Analysis & Comparison",
  description: "Expert, real-time comparison of leading AI tools and platforms. Get structured insights, performance metrics, and professional feature mapping.",
  keywords: ["AI tool comparison", "compare AI tools", "AI tool analysis", "AI software comparison"],
  path: "/ai-tools/analyze",
  // The comparison view needs at least two tools passed in the query string;
  // without them there is nothing to index, so keep it out of the index.
  noIndex: true,
});

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
