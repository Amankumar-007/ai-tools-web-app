// src/lib/resume-templates.ts
export interface ResumeData {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      portfolio: string;
      summary: string;
    };
    experience: Array<{
      position: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa: string;
    }>;
    skills: string[];
    additionalSections: Array<{
      title: string;
      content: string;
    }>;
  }
  
  export const generateResumeTemplate = (data: ResumeData): string => {
    const { personalInfo, experience, education, skills, additionalSections } = data;
  
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.fullName} - Resume</title>
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }

    /* Page */
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 28px;
      line-height: 1.5;
      font-size: 12px;
    }

    @media print {
      body { padding: 24px; font-size: 11px; }
      a { color: inherit; text-decoration: none; }
    }

    /* Header */
    .header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 16px;
    }
    .name { font-size: 26px; font-weight: 700; letter-spacing: 0.2px; }
    .contact { display: flex; flex-wrap: wrap; gap: 10px 16px; color: #444; }
    .contact-item { display: inline-flex; gap: 6px; }

    /* Section */
    .section { margin-top: 16px; }
    .section-title {
      font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #222;
      border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-bottom: 8px;
      text-transform: uppercase;
    }

    /* Lists */
    ul { margin: 0; padding-left: 18px; }
    li { margin: 4px 0; }

    /* Grid (for Education + Skills side-by-side on wide screens) */
    .grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media screen and (min-width: 700px) {
      .grid.two { grid-template-columns: 1.1fr 0.9fr; }
    }

    /* Items */
    .item { margin-bottom: 10px; }
    .role { font-weight: 700; color: #111; }
    .meta { color: #444; }
    .muted { color: #555; }
  </style>
</head>
<body>
  <header class="header" aria-label="intro">
    <div class="name">${personalInfo.fullName}</div>
    <div class="contact">
      ${personalInfo.email ? `<span class="contact-item">${personalInfo.email}</span>` : ''}
      ${personalInfo.phone ? `<span class="contact-item">${personalInfo.phone}</span>` : ''}
      ${personalInfo.location ? `<span class="contact-item">${personalInfo.location}</span>` : ''}
      ${personalInfo.linkedin ? `<span class="contact-item">${personalInfo.linkedin}</span>` : ''}
      ${personalInfo.portfolio ? `<span class="contact-item">${personalInfo.portfolio}</span>` : ''}
    </div>
  </header>

  ${personalInfo.summary ? `
  <section class="section" aria-label="summary">
    <div class="section-title">Summary</div>
    <div class="muted">${personalInfo.summary}</div>
  </section>
  ` : ''}

  ${experience.length > 0 ? `
  <section class="section" aria-label="experience">
    <div class="section-title">Experience</div>
    ${experience.map(exp => `
      <div class="item">
        <div class="role">${exp.position || ''}</div>
        <div class="meta">${exp.company || ''}${exp.duration ? ` • ${exp.duration}` : ''}</div>
        ${exp.description ? `<div class="muted">${exp.description}</div>` : ''}
      </div>
    `).join('')}
  </section>
  ` : ''}

  <section class="section" aria-label="education-skills">
    <div class="grid two">
      ${education.length > 0 ? `
      <div>
        <div class="section-title">Education</div>
        ${education.map(edu => `
          <div class="item">
            <div class="role">${edu.degree || ''}</div>
            <div class="meta">${edu.institution || ''}</div>
            <div class="muted">${edu.year || ''}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${skills.length > 0 ? `
      <div>
        <div class="section-title">Skills</div>
        <ul>
          ${skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </section>

  ${additionalSections.length > 0 ? `
  <section class="section" aria-label="additional">
    ${additionalSections.map(section => `
      <div class="item">
        <div class="section-title">${section.title}</div>
        <div class="muted">${section.content}</div>
      </div>
    `).join('')}
  </section>
  ` : ''}
</body>
</html>
    `.trim();
  };
  
  // src/lib/pdf-utils.ts
  export const downloadAsPDF = async (html: string) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }
      
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load
      await new Promise((resolve) => {
        printWindow.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });
      
      // Print to PDF
      printWindow.print();
      
      // Close the window after a short delay
      setTimeout(() => {
        printWindow.close();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };
  
  export const downloadAsHTML = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // src/lib/resume-prompts.ts
  export const createResumePrompt = (data: ResumeData): string => {
    const { personalInfo, experience, education, skills, additionalSections } = data;
    
    return `
  Create a professional, ATS-friendly resume based on the following information. Make it clean, traditional, and well-structured with a two-column layout.
  
  PERSONAL INFORMATION:
  Name: ${personalInfo.fullName}
  Email: ${personalInfo.email || 'Not provided'}
  Phone: ${personalInfo.phone || 'Not provided'}
  Location: ${personalInfo.location || 'Not provided'}
  LinkedIn: ${personalInfo.linkedin || 'Not provided'}
  Portfolio: ${personalInfo.portfolio || 'Not provided'}
  
  PROFESSIONAL SUMMARY:
  ${personalInfo.summary || 'Please create a compelling 2-3 sentence professional summary based on the work experience and skills provided below.'}
  
  WORK EXPERIENCE:
  ${experience.length > 0 ? experience.map((exp, index) => `
  Experience ${index + 1}:
  - Position: ${exp.position}
  - Company: ${exp.company}
  - Duration: ${exp.duration}
  - Description: ${exp.description || 'Please create relevant job responsibilities and achievements for this role.'}
  `).join('\n') : 'No work experience provided - please create relevant example experience based on the skills and education.'}
  
  EDUCATION:
  ${education.length > 0 ? education.map((edu, index) => `
  Education ${index + 1}:
  - Degree: ${edu.degree}
  - Institution: ${edu.institution}
  - Year: ${edu.year}
  - GPA: ${edu.gpa || 'Not provided'}
  `).join('\n') : 'No education provided - please create relevant educational background.'}
  
  SKILLS:
  ${skills.length > 0 ? skills.join(', ') : 'Please suggest relevant skills based on the experience and education provided.'}
  
  ADDITIONAL SECTIONS:
  ${additionalSections.length > 0 ? additionalSections.map((section) => `
  ${section.title}: ${section.content}
  `).join('\n') : 'No additional sections provided.'}
  
  REQUIREMENTS:
  1. Create a professional, clean HTML resume with traditional layout
  2. Use a colored header section (like #6B73A3) with white text
  3. Two-column layout: left column for contact, education, skills; right column for experience and projects
  4. Use Arial or similar clean fonts
  5. Make it ATS-friendly with semantic HTML structure
  6. Ensure proper typography and spacing
  7. Make it print-friendly and responsive
  8. Include all necessary sections with proper hierarchy
  9. If any information is missing, create professional placeholder content
  10. Use bullet points and clean formatting
  11. Optimize for both screen viewing and printing
  
  Return ONLY the complete HTML code with embedded CSS. Do not include any explanations or additional text.
    `.trim();
  };