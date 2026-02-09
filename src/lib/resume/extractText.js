import mammoth from "mammoth";

export async function extractText(buffer, mimeType) {
  // PDF
  if (mimeType === "application/pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse =
      pdfParseModule.default || pdfParseModule;

    const data = await pdfParse(buffer);
    return data.text;
  }

  // DOCX
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}
