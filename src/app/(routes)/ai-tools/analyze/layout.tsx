import type { Metadata } from "next";
import { createPageMetadata, SITE_URL } from "@/metadata-utils";
import JsonLd, {
  breadcrumbListStructuredData,
  faqPageStructuredData,
  itemListStructuredData
} from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "AI Tool Comparison & Analysis Engine | Compare Top AI Software Side-by-Side",
  description: "Compare leading AI tools side-by-side with real-time benchmarks, neural radar metrics, feature matrix, pricing breakdowns, and expert strategic recommendations.",
  keywords: [
    "AI tool comparison",
    "compare AI tools",
    "AI software comparison",
    "ChatGPT vs Claude",
    "Cursor vs GitHub Copilot",
    "Midjourney vs Flux",
    "Perplexity vs Gemini",
    "best AI tools 2026",
    "AI tools benchmark",
    "AI feature matrix"
  ],
  path: "/ai-tools/analyze",
});

const FAQ_DATA = [
  {
    question: "How does the AI Tool Analysis Engine compare software?",
    answer: "Our analysis engine evaluates AI tools across multiple objective vectors including speed/latency, accuracy and reasoning depth, cost efficiency, ease of integration, multimodal support, and enterprise security to generate real-time side-by-side comparisons."
  },
  {
    question: "Can I compare any AI tools from the directory?",
    answer: "Yes, you can search and select any 2 to 4 AI platforms from our curated library of 100+ verified tools to instantly generate multi-dimensional radar charts, feature matrices, and strategic verdicts."
  },
  {
    question: "How is the neural radar score calculated?",
    answer: "The neural radar score evaluates 5 core dimensions: Speed (time-to-first-token & throughput), Accuracy (benchmark reasoning performance), Value (features per dollar), Innovation (frontier architecture & unique capabilities), and Ease of Use (API clarity & UI friction)."
  },
  {
    question: "Which tool is best for coding: Cursor, Claude, or ChatGPT?",
    answer: "Cursor excels in whole-codebase context and IDE autocompletion; Claude 3.7 / Sonnet leads in complex multi-file logic and architectural refactoring; ChatGPT (GPT-4o) provides versatile scripting, rapid prototyping, and broad tool integration."
  },
  {
    question: "Are free vs paid AI tier limits compared?",
    answer: "Yes, each comparison includes transparent breakdowns of free tier allowances, token rate limits, monthly subscription pricing, and pay-as-you-go API costs."
  }
];

const POPULAR_COMPARISONS = [
  { name: "ChatGPT vs Claude", url: `${SITE_URL}/ai-tools/analyze?names=ChatGPT,Claude`, description: "Frontier LLM comparison for reasoning, writing, and coding." },
  { name: "Cursor vs GitHub Copilot", url: `${SITE_URL}/ai-tools/analyze?names=Cursor,GitHub%20Copilot`, description: "AI coding assistant and agentic IDE comparison." },
  { name: "Perplexity vs Gemini", url: `${SITE_URL}/ai-tools/analyze?names=Perplexity,Gemini`, description: "AI research and real-time search engine analysis." },
  { name: "Midjourney vs DALL-E 3", url: `${SITE_URL}/ai-tools/analyze?names=Midjourney,DALL-E%203`, description: "Generative image quality, style control, and prompt fidelity comparison." },
];

const webAppStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TomatoAI Tool Comparison & Intelligence Engine",
  url: `${SITE_URL}/ai-tools/analyze`,
  description: "Interactive AI software comparison engine with multi-dimensional radar charts, feature matrices, and live architectural benchmarks.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  creator: {
    "@type": "Organization",
    name: "TomatoAI",
    url: SITE_URL
  }
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppStructuredData} />
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: "Home", url: SITE_URL },
          { name: "AI Tools", url: `${SITE_URL}/ai-tools` },
          { name: "Compare & Analyze", url: `${SITE_URL}/ai-tools/analyze` },
        ])}
      />
      <JsonLd data={faqPageStructuredData(FAQ_DATA)} />
      <JsonLd data={itemListStructuredData(POPULAR_COMPARISONS)} />
      {children}
    </>
  );
}
