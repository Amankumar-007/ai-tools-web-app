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
              font-family: 'Arial', sans-serif;
              line-height: 1.4;
              color: #333;
              background-color: #ffffff;
              max-width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              font-size: 10pt;
          }
          
          @media print {
              body {
                  padding: 15mm;
                  font-size: 9pt;
              }
          }
          
          .header {
              background-color: #6B73A3;
              color: white;
              text-align: center;
              padding: 25px 20px;
              margin-bottom: 0;
          }
          
          .name {
              font-size: 32pt;
              font-weight: bold;
              letter-spacing: 3px;
              margin-bottom: 8px;
              text-transform: uppercase;
          }
          
          .title {
              font-size: 12pt;
              font-style: italic;
              letter-spacing: 1px;
              opacity: 0.9;
          }
          
          .main-content {
              display: grid;
              grid-template-columns: 1fr 2fr;
              gap: 30px;
              margin-top: 25px;
          }
          
          .left-column {
              padding-right: 15px;
          }
          
          .right-column {
              padding-left: 15px;
          }
          
          .section {
              margin-bottom: 25px;
          }
          
          .section-title {
              font-size: 11pt;
              font-weight: bold;
              color: #333;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
              margin-bottom: 12px;
          }
          
          .contact-info {
              list-style: none;
              padding: 0;
          }
          
          .contact-info li {
              margin-bottom: 8px;
              font-size: 9pt;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          
          .contact-info li::before {
              content: "●";
              color: #6B73A3;
              font-weight: bold;
              font-size: 8pt;
          }
          
          .education-item {
              margin-bottom: 15px;
          }
          
          .degree {
              font-weight: bold;
              font-size: 10pt;
              color: #333;
          }
          
          .institution {
              font-size: 9pt;
              color: #666;
              margin-top: 2px;
          }
          
          .year-gpa {
              font-size: 9pt;
              color: #666;
              margin-top: 2px;
          }
          
          .skills-list {
              list-style: none;
              padding: 0;
          }
          
          .skills-list li {
              margin-bottom: 6px;
              font-size: 9pt;
              padding-left: 12px;
              position: relative;
          }
          
          .skills-list li::before {
              content: "•";
              position: absolute;
              left: 0;
              color: #6B73A3;
              font-weight: bold;
          }
          
          .additional-section {
              margin-bottom: 20px;
          }
          
          .additional-content {
              font-size: 9pt;
              line-height: 1.5;
          }
          
          .summary {
              font-size: 10pt;
              line-height: 1.6;
              text-align: justify;
              margin-bottom: 20px;
          }
          
          .experience-item {
              margin-bottom: 20px;
          }
          
          .position-header {
              margin-bottom: 8px;
          }
          
          .position {
              font-weight: bold;
              font-size: 11pt;
              color: #333;
          }
          
          .company-duration {
              font-size: 9pt;
              color: #666;
              margin-top: 2px;
          }
          
          .company {
              font-weight: 500;
          }
          
          .duration {
              font-style: italic;
          }
          
          .description {
              font-size: 9pt;
              line-height: 1.5;
              margin-top: 8px;
          }
          
          .description ul {
              margin-left: 15px;
              margin-top: 5px;
          }
          
          .description li {
              margin-bottom: 4px;
          }
          
          .projects-section {
              margin-top: 20px;
          }
          
          .project-item {
              margin-bottom: 15px;
          }
          
          .project-title {
              font-weight: bold;
              font-size: 10pt;
              color: #333;
              margin-bottom: 4px;
          }
          
          .project-description {
              font-size: 9pt;
              line-height: 1.5;
          }
          
          .project-description ul {
              margin-left: 15px;
              margin-top: 3px;
          }
          
          .project-description li {
              margin-bottom: 3px;
          }
          
          @media (max-width: 768px) {
              body {
                  padding: 15px;
              }
              
              .main-content {
                  grid-template-columns: 1fr;
                  gap: 20px;
              }
              
              .left-column,
              .right-column {
                  padding: 0;
              }
              
              .name {
                  font-size: 24pt;
              }
          }
      </style>
  </head>
  <body>
      <!-- Header Section -->
      <div class="header">
          <h1 class="name">${personalInfo.fullName}</h1>
          <div class="title">${personalInfo.summary ? personalInfo.summary.split('.')[0] : 'PROFESSIONAL'}</div>
      </div>
      
      <div class="main-content">
          <!-- Left Column -->
          <div class="left-column">
              <!-- Contact Information -->
              <div class="section">
                  <h2 class="section-title">Contact</h2>
                  <ul class="contact-info">
                      ${personalInfo.email ? `<li>${personalInfo.email}</li>` : ''}
                      ${personalInfo.phone ? `<li>${personalInfo.phone}</li>` : ''}
                      ${personalInfo.location ? `<li>${personalInfo.location}</li>` : ''}
                      ${personalInfo.linkedin ? `<li>${personalInfo.linkedin}</li>` : ''}
                      ${personalInfo.portfolio ? `<li>${personalInfo.portfolio}</li>` : ''}
                  </ul>
              </div>
              
              <!-- Career Objective -->
              ${personalInfo.summary ? `
              <div class="section">
                  <h2 class="section-title">Career Objective</h2>
                  <div class="summary">${personalInfo.summary}</div>
              </div>
              ` : ''}
              
              <!-- Education -->
              ${education.length > 0 ? `
              <div class="section">
                  <h2 class="section-title">Education</h2>
                  ${education.map(edu => `
                  <div class="education-item">
                      <div class="degree">${edu.degree}</div>
                      <div class="institution">${edu.institution}</div>
                      <div class="year-gpa">${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                  </div>
                  `).join('')}
              </div>
              ` : ''}
              
              <!-- Skills -->
              ${skills.length > 0 ? `
              <div class="section">
                  <h2 class="section-title">Skills</h2>
                  <ul class="skills-list">
                      ${skills.map(skill => `<li>${skill}</li>`).join('')}
                  </ul>
              </div>
              ` : ''}
              
              <!-- Additional Sections (Left Column) -->
              ${additionalSections.filter((_, index) => index % 2 === 0).map(section => `
              <div class="section">
                  <h2 class="section-title">${section.title}</h2>
                  <div class="additional-content">${section.content}</div>
              </div>
              `).join('')}
          </div>
          
          <!-- Right Column -->
          <div class="right-column">
              <!-- Work Experience -->
              ${experience.length > 0 ? `
              <div class="section">
                  <h2 class="section-title">Work Experience</h2>
                  ${experience.map(exp => `
                  <div class="experience-item">
                      <div class="position-header">
                          <div class="position">${exp.position}</div>
                          <div class="company-duration">
                              <span class="company">${exp.company}</span>
                              ${exp.duration ? ` • <span class="duration">${exp.duration}</span>` : ''}
                          </div>
                      </div>
                      ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                  </div>
                  `).join('')}
              </div>
              ` : ''}
              
              <!-- Projects Section (if additional sections exist) -->
              ${additionalSections.filter(section => section.title.toLowerCase().includes('project')).length > 0 ? `
              <div class="section projects-section">
                  <h2 class="section-title">Projects</h2>
                  ${additionalSections.filter(section => section.title.toLowerCase().includes('project')).map(section => `
                  <div class="project-item">
                      <div class="project-title">${section.title.replace(/projects?/i, '').trim() || 'Project'}</div>
                      <div class="project-description">${section.content}</div>
                  </div>
                  `).join('')}
              </div>
              ` : ''}
              
              <!-- Additional Sections (Right Column) -->
              ${additionalSections.filter((section, index) => index % 2 === 1 && !section.title.toLowerCase().includes('project')).map(section => `
              <div class="section">
                  <h2 class="section-title">${section.title}</h2>
                  <div class="additional-content">${section.content}</div>
              </div>
              `).join('')}
          </div>
      </div>
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