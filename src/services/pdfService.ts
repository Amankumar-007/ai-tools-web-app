import { authFetch } from '@/lib/auth-fetch';

// Cache for PDF.js worker to avoid repeated setup
let pdfjsLib: any = null;
let workerInitialized = false;

const initializePDFjs = async () => {
  if (pdfjsLib && workerInitialized) return pdfjsLib;

  // Dynamic import is required to prevent pdfjs from being evaluated during SSR/prerender.
  // Use the legacy build for better Node/SSR compatibility.
  const pdfjsModule: any = await import("pdfjs-dist/legacy/build/pdf");
  pdfjsLib = pdfjsModule?.default ?? pdfjsModule;

  // 🔴 THIS MUST MATCH THE FILE NAME IN /public (served from root)
  // Use absolute URL to avoid Next.js rewriting the path to `/_next/public/...`.
  if (!workerInitialized && typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
    workerInitialized = true;
  }

  return pdfjsLib;
};

export async function extractTextFromPdf(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF text extraction can only run in the browser.");
  }

  const pdfjs = await initializePDFjs();

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ 
    data: buffer,
    // Enable worker for better performance
    enableXfa: true,
    disableFontFace: true // Disable font face loading for text extraction only
  });
  
  const pdf = await loadingTask.promise;

  let text = "";

  // Process pages in parallel for better performance
  const pagePromises = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    pagePromises.push(extractPageText(pdf, i));
  }

  const pageTexts = await Promise.all(pagePromises);
  text = pageTexts.join("\n");

  return text.trim();
}

async function extractPageText(pdf: any, pageNumber: number): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent({
    // Optimize text extraction
    includeMarkedContent: false,
    disableNormalization: true
  });

  return content.items
    .map((item: any) => item.str)
    .join(" ");
}

/**
 * Step 2 of the pipeline: Convert raw extracted PDF text into a
 * clean, section-wise structured JSON object via an AI call.
 * This structured data is then passed to the analysis step for
 * significantly better, context-aware analysis.
 */
export async function structureResumeText(rawText: string): Promise<Record<string, any>> {
  const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

  const response = await authFetch("/api/structure-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText }),
  });

  if (!response.ok) {
    const err = await response.text();
    // If structuring fails, fall back gracefully — return raw text in a wrapper
    console.warn("Resume structuring failed, falling back to raw text:", err);
    return { rawText, sections: {} };
  }

  const data = await response.json();
  return data;
}
