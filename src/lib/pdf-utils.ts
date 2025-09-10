// src/lib/pdf-utils.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Extract text content from a PDF file
 * Note: This is a simplified implementation. For production use, consider using a dedicated PDF text extraction library
 * @param pdfFile - The PDF file as a File object or ArrayBuffer
 * @returns Promise<string> - The extracted text content
 */
export const extractTextFromPDF = async (pdfFile: File | ArrayBuffer): Promise<string> => {
  let arrayBuffer: ArrayBuffer = new ArrayBuffer(0);
  
  try {
    if (pdfFile instanceof File) {
      arrayBuffer = await pdfFile.arrayBuffer();
    } else {
      arrayBuffer = pdfFile;
    }
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Get basic info about the PDF
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || (pdfFile instanceof File ? pdfFile.name : 'Unknown');
    const author = pdfDoc.getAuthor() || 'Unknown';
    const subject = pdfDoc.getSubject() || '';
    const keywords = pdfDoc.getKeywords() || '';
    
    // Create a more informative content description
    let content = `PDF Document: ${title}\n`;
    content += `Author: ${author}\n`;
    content += `Pages: ${pageCount}\n`;
    content += `File size: ${(pdfFile instanceof File ? pdfFile.size : arrayBuffer.byteLength / 1024).toFixed(2)} KB\n`;
    
    if (subject) {
      content += `Subject: ${subject}\n`;
    }
    
    if (keywords) {
      content += `Keywords: ${keywords}\n`;
    }
    
    content += `\n--- Document Content ---\n`;
    content += `This PDF contains ${pageCount} page${pageCount > 1 ? 's' : ''} of content. `;
    content += `To extract the actual text content from this PDF, you would need to implement a proper PDF text extraction library like pdfjs-dist.\n\n`;
    content += `For now, here's what we know about this document:\n`;
    content += `- Document title: ${title}\n`;
    content += `- Total pages: ${pageCount}\n`;
    content += `- File size: ${(pdfFile instanceof File ? pdfFile.size : arrayBuffer.byteLength / 1024).toFixed(2)} KB\n`;
    
    if (subject) {
      content += `- Subject: ${subject}\n`;
    }
    
    if (keywords) {
      content += `- Keywords: ${keywords}\n`;
    }
    
    content += `\n[Note: This is enhanced placeholder content. For actual text extraction, please implement PDF text extraction using pdfjs-dist or a server-side API.]`;
    
    return content;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Fallback to basic file info if PDF parsing fails
    const fallbackSize = pdfFile instanceof File ? pdfFile.size : (arrayBuffer ? arrayBuffer.byteLength : 0);
    return `PDF Document: ${pdfFile instanceof File ? pdfFile.name : 'Unknown'}\n` +
           `File size: ${(fallbackSize / 1024).toFixed(2)} KB\n` +
           `\n[Note: Could not parse PDF metadata. This appears to be a PDF file that contains content. For actual text extraction, please implement PDF text extraction using pdfjs-dist or a server-side API.]`;
  }
};

/**
 * Extract text from PDF using a more robust approach with pdfjs-dist
 * This requires installing pdfjs-dist: npm install pdfjs-dist
 * @param pdfFile - The PDF file as a File object or ArrayBuffer
 * @returns Promise<string> - The extracted text content
 */
export const extractTextFromPDFWithPDFJS = async (pdfFile: File | ArrayBuffer): Promise<string> => {
  try {
    // This is a placeholder for pdfjs-dist implementation
    // In a real implementation, you would:
    // 1. Import pdfjs-dist
    // 2. Configure the worker
    // 3. Load the PDF document
    // 4. Extract text from each page
    
    throw new Error('PDF text extraction requires pdfjs-dist library. Please install it with: npm install pdfjs-dist');
  } catch (error) {
    console.error('Error extracting text from PDF with PDFJS:', error);
    throw error;
  }
};

/**
 * Alternative: Extract text from PDF by sending it to a server-side API
 * This is useful when client-side PDF processing is limited
 * @param pdfFile - The PDF file as a File object
 * @param apiEndpoint - The API endpoint for PDF text extraction
 * @returns Promise<string> - The extracted text content
 */
export const extractTextFromPDFAPI = async (pdfFile: File, apiEndpoint: string = '/api/extract-pdf-text'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF via API:', error);
    throw new Error('Failed to extract text from PDF via API');
  }
};

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
    summary?: string;
  };
  experience: Array<{
    position?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education: Array<{
    degree?: string;
    institution?: string;
    year?: string;
    gpa?: string;
  }>;
  skills: string[];
  additionalSections: Array<{
    title?: string;
    content?: string;
  }>;
}

/**
 * Fill a PDF template with text from ResumeData and download it.
 * templatePath is relative to the public folder, e.g. "/resume-template.pdf"
 */
export const fillPdfWithResume = async (
  data: ResumeData,
  templatePath = "/resume-template.pdf",
  filename = "resume-filled.pdf"
) => {
  try {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error(`Failed to load template: ${templatePath}`);
    const templateBytes = await res.arrayBuffer();

    const pdfDoc = await PDFDocument.load(templateBytes);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Styling choices
    const nameFontSize = 20;
    const headingFontSize = 10;
    const bodyFontSize = 9;
    const lineHeight = 12;
    const accentColor = rgb(0.42, 0.45, 0.64);

    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Header: centered name and short title
    const nameText = data.personalInfo.fullName || "";
    const titleText = (data.personalInfo.summary || "").split(".")[0] || "PROFESSIONAL";

    const nameWidth = helvetica.widthOfTextAtSize(nameText, nameFontSize);
    page.drawText(nameText, {
      x: Math.max(40, (width - nameWidth) / 2),
      y: height - 70,
      size: nameFontSize,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    const titleWidth = helvetica.widthOfTextAtSize(titleText, headingFontSize);
    page.drawText(titleText, {
      x: Math.max(40, (width - titleWidth) / 2),
      y: height - 92,
      size: headingFontSize,
      font: helvetica,
      color: accentColor,
    });

    // Left and right column starting points (adjust later if needed)
    const leftX = 40;
    const rightX = 260;
    let leftY = height - 130;
    let rightY = height - 130;

    // Contact block
    const contact = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
      data.personalInfo.linkedin,
      data.personalInfo.portfolio,
    ].filter(Boolean);

    if (contact.length > 0) {
      page.drawText("Contact", { x: leftX, y: leftY, size: headingFontSize, font: helvetica });
      leftY -= lineHeight + 4;
      contact.forEach((c) => {
        page.drawText(String(c), { x: leftX, y: leftY, size: bodyFontSize, font: helvetica });
        leftY -= lineHeight;
      });
      leftY -= 6;
    }

    // Career Objective / Summary
    if (data.personalInfo.summary) {
      page.drawText("Career Objective", { x: leftX, y: leftY, size: headingFontSize, font: helvetica });
      leftY -= lineHeight + 4;
      const summaryLines = wrapText(data.personalInfo.summary, 40);
      summaryLines.forEach((ln) => {
        page.drawText(ln, { x: leftX, y: leftY, size: bodyFontSize, font: helvetica });
        leftY -= lineHeight;
      });
      leftY -= 6;
    }

    // Education
    if (data.education && data.education.length > 0) {
      page.drawText("Education", { x: leftX, y: leftY, size: headingFontSize, font: helvetica });
      leftY -= lineHeight + 4;
      data.education.forEach((edu) => {
        page.drawText(`${edu.degree || ""} — ${edu.institution || ""}`, { x: leftX, y: leftY, size: bodyFontSize, font: helvetica });
        leftY -= lineHeight;
        page.drawText(`${edu.year || ""}${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}`, { x: leftX, y: leftY, size: bodyFontSize, font: helvetica });
        leftY -= lineHeight + 6;
      });
      leftY -= 4;
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      page.drawText("Skills", { x: leftX, y: leftY, size: headingFontSize, font: helvetica });
      leftY -= lineHeight + 4;
      const skillsLines = wrapText(data.skills.join(", "), 40);
      skillsLines.forEach((ln) => {
        page.drawText(ln, { x: leftX, y: leftY, size: bodyFontSize, font: helvetica });
        leftY -= lineHeight;
      });
      leftY -= 6;
    }

    // Work experience (right column)
    if (data.experience && data.experience.length > 0) {
      page.drawText("Work Experience", { x: rightX, y: rightY, size: headingFontSize, font: helvetica });
      rightY -= lineHeight + 6;
      data.experience.forEach((exp) => {
        page.drawText(`${exp.position || ""}`, { x: rightX, y: rightY, size: bodyFontSize + 1, font: helvetica });
        rightY -= lineHeight;
        page.drawText(`${exp.company || ""}${exp.duration ? ` • ${exp.duration}` : ""}`, { x: rightX, y: rightY, size: bodyFontSize, font: helvetica });
        rightY -= lineHeight;
        if (exp.description) {
          const descLines = wrapText(exp.description, 60);
          descLines.forEach((ln) => {
            page.drawText(ln, { x: rightX, y: rightY, size: bodyFontSize, font: helvetica });
            rightY -= lineHeight;
          });
        }
        rightY -= 6;
      });
    }

    // Projects & additional (right)
    const projectSections = (data.additionalSections || []).filter((s) => /project/i.test(s.title || ""));
    if (projectSections.length > 0) {
      page.drawText("Projects", { x: rightX, y: rightY, size: headingFontSize, font: helvetica });
      rightY -= lineHeight + 6;
      projectSections.forEach((p) => {
        page.drawText((p.title || "Project").replace(/projects?/i, "").trim(), { x: rightX, y: rightY, size: bodyFontSize + 1, font: helvetica });
        rightY -= lineHeight;
        const lines = wrapText(p.content || "", 60);
        lines.forEach((ln) => {
          page.drawText(ln, { x: rightX, y: rightY, size: bodyFontSize, font: helvetica });
          rightY -= lineHeight;
        });
        rightY -= 6;
      });
    }

    // Save and download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error filling PDF template:", error);
    throw error;
  }
};

// Simple wrapper to break text into rough lines (keeps code fast)
function wrapText(text: string, maxChars = 40) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (test.length <= maxChars) current = test;
    else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}
