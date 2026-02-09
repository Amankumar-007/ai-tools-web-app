export async function extractTextFromPdf(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF text extraction can only run in the browser.");
  }

  // Dynamic import is required to prevent pdfjs from being evaluated during SSR/prerender.
  // Use the legacy build for better Node/SSR compatibility.
  const pdfjsModule: any = await import("pdfjs-dist/legacy/build/pdf");
  const pdfjsLib: any = pdfjsModule?.default ?? pdfjsModule;

  // 🔴 THIS MUST MATCH THE FILE NAME IN /public (served from root)
  // Use absolute URL to avoid Next.js rewriting the path to `/_next/public/...`.
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text +=
      content.items
        .map((item: any) => item.str)
        .join(" ") + "\n";
  }

  return text.trim();
}
