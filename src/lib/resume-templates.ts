// src/lib/utils.ts


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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #ffffff;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            font-size: 11pt;
        }
        
        @media print {
            body {
                padding: 15mm;
                font-size: 10pt;
            }
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #FF6B35;
            padding-bottom: 20px;
        }
        
        .name {
            font-size: 28pt;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 10pt;
            color: #666;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #FF6B35;
            border-bottom: 2px solid #FF6B35;
            padding-bottom: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .summary {
            text-align: justify;
            font-style: italic;
            background-color: #FFF7F0;
            padding: 15px;
            border-left: 4px solid #FF6B35;
            border-radius: 0 8px 8px 0;
        }
        
        .experience-item, .education-item, .additional-item {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #FAFAFA;
            border-radius: 8px;
            border-left: 3px solid #FF6B35;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            flex-wrap: wrap;
        }
        
        .position {
            font-size: 12pt;
            font-weight: bold;
            color: #FF6B35;
        }
        
        .company {
            font-size: 11pt;
            font-weight: 600;
            color: #333;
            margin-top: 2px;
        }
        
        .duration {
            font-size: 9pt;
            color: #666;
            font-style: italic;
            background-color: #FF6B35;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            white-space: nowrap;
        }
        
        .description {
            margin-top: 10px;
            text-align: justify;
        }
        
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .skill-tag {
            background-color: #FF6B35;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 500;
            display: inline-block;
        }
        
        .education-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .degree {
            font-weight: bold;
            color: #FF6B35;
            font-size: 11pt;
        }
        
        .institution {
            color: #333;
            font-weight: 500;
        }
        
        .year-gpa {
            font-size: 9pt;
            color: #666;
        }
        
        .additional-section-title {
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 8px;
            font-size: 11pt;
        }
        
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 15px;
                font-size: 10pt;
            }
            
            .name {
                font-size: 24pt;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 8px;
            }
            
            .item-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .two-column {
                grid-template-columns: 1fr;
            }
        }
        
        .icon {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <h1 class="name">${personalInfo.fullName}</h1>
        <div class="contact-info">
            ${personalInfo.email ? `<div class="contact-item">📧 ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item">📱 ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="contact-item">📍 ${personalInfo.location}</div>` : ''}
            ${personalInfo.linkedin ? `<div class="contact-item">💼 ${personalInfo.linkedin}</div>` : ''}
            ${personalInfo.portfolio ? `<div class="contact-item">🌐 ${personalInfo.portfolio}</div>` : ''}
        </div>
    </div>
    
    <!-- Professional Summary -->
    ${personalInfo.summary ? `
    <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <div class="summary">${personalInfo.summary}</div>
    </div>
    ` : ''}
    
    <!-- Work Experience -->
    ${experience.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Professional Experience</h2>
        ${experience.map(exp => `
        <div class="experience-item">
            <div class="item-header">
                <div>
                    <div class="position">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                </div>
                <div class="duration">${exp.duration}</div>
            </div>
            ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    <!-- Education -->
    ${education.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Education</h2>
        ${education.map(edu => `
        <div class="education-item">
            <div class="education-details">
                <div>
                    <div class="degree">${edu.degree}</div>
                    <div class="institution">${edu.institution}</div>
                </div>
                <div class="year-gpa">
                    ${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                </div>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    <!-- Skills -->
    ${skills.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Technical Skills</h2>
        <div class="skills-container">
            ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}
    
    <!-- Additional Sections -->
    ${additionalSections.length > 0 ? additionalSections.map(section => `
    <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div class="additional-item">
            <div>${section.content}</div>
        </div>
    </div>
    `).join('') : ''}
</body>
</html>
  `.trim();
};

// src/lib/pdf-utils.ts
export const downloadAsPDF = async (html: string, filename: string) => {
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
Create a professional, ATS-friendly resume based on the following information. Make it clean, modern, and well-structured.

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
${additionalSections.length > 0 ? additionalSections.map((section, index) => `
${section.title}: ${section.content}
`).join('\n') : 'No additional sections provided.'}

REQUIREMENTS:
1. Create a professional, clean HTML resume
2. Use modern CSS with embedded styles
3. Make it ATS-friendly with semantic HTML structure
4. Use orange (#FF6B35) and white colors as the primary theme
5. Ensure proper typography and spacing
6. Make it print-friendly and responsive
7. Include all necessary sections with proper hierarchy
8. If any information is missing, create professional placeholder content
9. Use subtle shadows, borders, and modern design elements
10. Optimize for both screen viewing and printing
11. Include professional icons or symbols where appropriate
12. Make the layout clean and scannable

Return ONLY the complete HTML code with embedded CSS. Do not include any explanations or additional text.
  `.trim();
};