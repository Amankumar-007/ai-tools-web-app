import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tool Analysis & Comparison | TomatoAI",
  description: "Expert, real-time comparison of leading AI tools and platforms. Get structured insights, performance metrics, and professional feature mapping.",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
