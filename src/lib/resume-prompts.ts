// src/lib/resume-prompts.ts
import { ResumeData } from './resume-templates';

// Main prompt for generating complete resume HTML
export const createResumePrompt = (data: ResumeData): string => {
  const { personalInfo, experience, education, skills, additionalSections } = data;
  
  return `
Create a professional, ATS-friendly HTML resume with the following specifications:

PERSONAL INFORMATION:
Name: ${personalInfo.fullName}
Email: ${personalInfo.email || 'Not provided'}
Phone: ${personalInfo.phone || 'Not provided'}
Location: ${personalInfo.location || 'Not provided'}
LinkedIn: ${personalInfo.linkedin || 'Not provided'}
Portfolio: ${personalInfo.portfolio || 'Not provided'}

PROFESSIONAL SUMMARY:
${personalInfo.summary || 'Create a compelling 2-3 sentence professional summary highlighting key strengths and value proposition.'}

WORK EXPERIENCE:
${experience.length > 0 ? experience.map((exp, index) => `
Position ${index + 1}:
- Role: ${exp.position}
- Company: ${exp.company}
- Duration: ${exp.duration}
- Description: ${exp.description || 'Create 3-4 impactful bullet points with quantifiable achievements'}
`).join('\n') : 'No experience provided - focus on skills and education'}

EDUCATION:
${education.length > 0 ? education.map((edu, index) => `
Degree ${index + 1}:
- Degree: ${edu.degree}
- Institution: ${edu.institution}
- Year: ${edu.year}
- GPA: ${edu.gpa || 'Not mentioned'}
`).join('\n') : 'Create appropriate educational background'}

SKILLS:
${skills.length > 0 ? skills.join(', ') : 'Suggest relevant technical and soft skills'}

ADDITIONAL SECTIONS:
${additionalSections.length > 0 ? additionalSections.map(section => `
${section.title}: ${section.content}
`).join('\n') : ''}

DESIGN REQUIREMENTS:
1. Use a modern, clean design with orange (#FF6B35) as the primary accent color
2. Include embedded CSS styles - no external stylesheets
3. Make it fully responsive and print-friendly
4. Use semantic HTML5 elements for ATS compatibility
5. Include proper heading hierarchy (h1 for name, h2 for sections)
6. Add subtle visual elements (borders, shadows) for professional appearance
7. Ensure optimal typography with readable fonts and proper spacing
8. Use icons or symbols sparingly for visual enhancement
9. Keep the layout single-column for ATS scanning
10. Include proper meta tags and document structure

OUTPUT FORMAT:
Return ONLY the complete HTML code with embedded CSS. Start with <!DOCTYPE html> and end with </html>.
Do not include any markdown formatting or explanations.
  `.trim();
};

// Prompt for enhancing professional summary
export const createSummaryPrompt = (data: Partial<ResumeData>): string => {
  return `
Create a compelling professional summary (2-3 sentences) for a resume.

CONTEXT:
${data.experience?.length ? `Experience: ${data.experience.map(e => `${e.position} at ${e.company}`).join(', ')}` : ''}
${data.skills?.length ? `Skills: ${data.skills.join(', ')}` : ''}
${data.education?.length ? `Education: ${data.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}` : ''}

REQUIREMENTS:
- Write in first-person (implied, no "I" statements)
- Highlight key strengths and unique value proposition
- Include years of experience if applicable
- Mention 1-2 key technical skills or domain expertise
- Keep it concise (50-80 words)
- Make it impactful and results-oriented
- Avoid generic phrases and clichés

Return only the summary text, no additional formatting or explanation.
  `.trim();
};

// Prompt for enhancing job descriptions
export const createJobDescriptionPrompt = (job: {
  position: string;
  company: string;
  description?: string;
}): string => {
  return `
Enhance this job experience for a resume with professional bullet points.

POSITION: ${job.position}
COMPANY: ${job.company}
CURRENT DESCRIPTION: ${job.description || 'Create from scratch based on typical responsibilities'}

REQUIREMENTS:
- Create 3-4 bullet points
- Start each with a strong action verb (Led, Developed, Implemented, Achieved, etc.)
- Include quantifiable results where possible (percentages, numbers, timeframes)
- Show impact and value delivered
- Use industry-relevant keywords
- Keep each bullet point concise (1-2 lines)
- Focus on achievements over duties
- Use past tense for previous roles

FORMAT:
• [Action verb] [what you did] [result/impact]

Return only the bullet points, one per line, starting with "•".
  `.trim();
};

// Prompt for suggesting skills based on profile
export const createSkillsPrompt = (data: Partial<ResumeData>, count: number = 10): string => {
  return `
Suggest ${count} relevant skills for this professional profile.

BACKGROUND:
${data.experience?.length ? `Experience: ${data.experience.map(e => e.position).join(', ')}` : ''}
${data.education?.length ? `Education: ${data.education.map(e => e.degree).join(', ')}` : ''}
${data.skills?.length ? `Current skills: ${data.skills.join(', ')}` : ''}

REQUIREMENTS:
- Mix of technical/hard skills and soft skills
- Industry-relevant and in-demand skills
- Specific rather than generic (e.g., "React.js" not just "Web Development")
- ATS-friendly keywords
- Skills that complement the experience level
- Modern and current technologies/methodologies

Return a comma-separated list of skills. Be specific and relevant.
  `.trim();
};

// Prompt for creating achievements from basic descriptions
export const createAchievementPrompt = (description: string): string => {
  return `
Transform this basic job description into achievement-focused bullet points.

ORIGINAL: ${description}

TRANSFORMATION RULES:
- Convert responsibilities into achievements
- Add metrics where logical (even if estimated)
- Use the CAR format (Challenge-Action-Result) where applicable
- Emphasize value created or problems solved
- Include tools/technologies used
- Show leadership, initiative, or innovation

Create 2-3 achievement-based bullet points that would impress recruiters.
Return only the bullet points, starting with "•".
  `.trim();
};

// Prompt for optimizing resume for specific job
export const createJobOptimizationPrompt = (
  resumeData: ResumeData,
  jobDescription: string
): string => {
  return `
Optimize this resume content for a specific job posting.

CURRENT RESUME SUMMARY:
${resumeData.personalInfo.summary}

TARGET JOB DESCRIPTION:
${jobDescription}

TASK:
1. Identify key keywords and requirements from the job description
2. Rewrite the professional summary to align with the job requirements
3. Suggest which skills to emphasize
4. Recommend experience points to highlight
5. Ensure ATS compatibility with relevant keywords

Return an optimized professional summary that matches the job requirements while remaining truthful to the candidate's background.
  `.trim();
};

// Prompt for creating cover letter based on resume
export const createCoverLetterPrompt = (
  resumeData: ResumeData,
  company?: string,
  position?: string
): string => {
  return `
Create a professional cover letter based on this resume.

CANDIDATE PROFILE:
Name: ${resumeData.personalInfo.fullName}
Summary: ${resumeData.personalInfo.summary}
Key Experience: ${resumeData.experience[0]?.position} at ${resumeData.experience[0]?.company}
Top Skills: ${resumeData.skills.slice(0, 5).join(', ')}

TARGET:
Company: ${company || '[Company Name]'}
Position: ${position || '[Position Title]'}

STRUCTURE:
1. Opening paragraph - Express interest and how you learned about the position
2. Body paragraph 1 - Highlight relevant experience and achievements
3. Body paragraph 2 - Explain why you're interested in this company/role
4. Closing paragraph - Call to action and availability for interview

Keep it concise (250-350 words), professional, and enthusiastic.
  `.trim();
};

// Prompt for generating interview questions based on resume
export const createInterviewPrepPrompt = (resumeData: ResumeData): string => {
  return `
Based on this resume, generate 5 likely interview questions and suggested answers.

CANDIDATE PROFILE:
Experience: ${resumeData.experience.map(e => `${e.position} at ${e.company}`).join(', ')}
Skills: ${resumeData.skills.join(', ')}
Education: ${resumeData.education.map(e => `${e.degree}`).join(', ')}

Generate:
1. Five behavioral or technical questions likely to be asked
2. Brief suggested answer approach for each (2-3 sentences)
3. Focus on STAR method (Situation, Task, Action, Result) where applicable

Format as:
Q1: [Question]
A1: [Answer approach]
  `.trim();
};

// Prompt for creating LinkedIn headline
export const createLinkedInHeadlinePrompt = (resumeData: ResumeData): string => {
  return `
Create a compelling LinkedIn headline based on this resume.

CURRENT ROLE: ${resumeData.experience[0]?.position || 'Professional'}
COMPANY: ${resumeData.experience[0]?.company || ''}
KEY SKILLS: ${resumeData.skills.slice(0, 3).join(', ')}

REQUIREMENTS:
- Maximum 120 characters
- Include current role or expertise area
- Add 1-2 key skills or specializations
- Make it keyword-rich for search
- Show value proposition
- Avoid overused terms like "guru" or "ninja"

Return only the headline text.
  `.trim();
};

// Prompt templates for different career levels
export const careerLevelPrompts = {
  entry: `Focus on education, internships, projects, and potential. Emphasize eagerness to learn and any relevant coursework or certifications.`,
  
  mid: `Highlight progression, key achievements, and specialized skills. Show leadership potential and ability to work independently.`,
  
  senior: `Emphasize leadership, strategic thinking, and measurable business impact. Include mentoring, team building, and cross-functional collaboration.`,
  
  executive: `Focus on vision, transformation, P&L responsibility, and organizational impact. Highlight board presentations, M&A, and strategic initiatives.`
};

// Industry-specific prompt templates
export const industryPrompts = {
  tech: `Include programming languages, frameworks, methodologies (Agile/Scrum), cloud platforms, and open-source contributions.`,
  
  healthcare: `Emphasize patient care, compliance (HIPAA), medical technologies, certifications, and quality improvement initiatives.`,
  
  finance: `Highlight analytical skills, regulatory knowledge, risk management, financial modeling, and quantitative achievements.`,
  
  marketing: `Focus on campaigns, ROI, digital marketing tools, brand development, and measurable marketing metrics.`,
  
  education: `Include curriculum development, student achievement, educational technology, and professional development.`,
  
  sales: `Emphasize quota achievement, pipeline development, CRM tools, and revenue generation with specific numbers.`
};

// Prompt for different resume formats
export const formatPrompts = {
  chronological: `Organize experience in reverse chronological order, emphasizing career progression and stability.`,
  
  functional: `Group achievements by skill area rather than timeline, ideal for career changers or gaps in employment.`,
  
  combination: `Start with a skills summary, then include chronological experience, balancing skills and timeline.`,
  
  targeted: `Customize every section specifically for one job posting, mirroring language and requirements.`
};

// ATS optimization prompt
export const createATSOptimizationPrompt = (content: string): string => {
  return `
Optimize this resume content for ATS (Applicant Tracking Systems).

CONTENT: ${content}

OPTIMIZATION RULES:
1. Use standard section headings (Experience, Education, Skills)
2. Include job-specific keywords naturally
3. Avoid tables, columns, headers/footers
4. Use standard bullet points (•)
5. Include full spelled-out terms before acronyms
6. Use simple, standard fonts
7. Avoid graphics, images, or special characters
8. Include both hard and soft skills
9. Use standard date formats (MM/YYYY)
10. Ensure consistent formatting

Return the optimized version with improved ATS compatibility.
  `.trim();
};

// Prompt for generating missing sections
export const createMissingSectionPrompt = (
  sectionType: 'certifications' | 'projects' | 'volunteer' | 'awards',
  context: Partial<ResumeData>
): string => {
  const prompts = {
    certifications: `Suggest relevant professional certifications for someone with experience in ${context.experience?.[0]?.position || 'this field'}. Include certification names, issuing organizations, and why they're valuable.`,
    
    projects: `Create 2-3 relevant project descriptions that would complement this profile. Include project name, technologies used, and impact/results.`,
    
    volunteer: `Suggest volunteer experiences that would enhance this professional profile. Include organization, role, and transferable skills developed.`,
    
    awards: `Suggest professional awards or recognitions that would be relevant for this career level and industry. Be realistic and specific.`
  };

  return prompts[sectionType];
};

// Export all prompts as a collection
export const resumePrompts = {
  createResumePrompt,
  createSummaryPrompt,
  createJobDescriptionPrompt,
  createSkillsPrompt,
  createAchievementPrompt,
  createJobOptimizationPrompt,
  createCoverLetterPrompt,
  createInterviewPrepPrompt,
  createLinkedInHeadlinePrompt,
  createATSOptimizationPrompt,
  createMissingSectionPrompt,
  careerLevelPrompts,
  industryPrompts,
  formatPrompts
};

// Helper function to select appropriate prompts based on context
export const selectPromptStrategy = (data: ResumeData): string => {
  const yearsOfExperience = data.experience.length;
  const hasEducation = data.education.length > 0;

  let strategy = '';

  // Determine career level
  if (yearsOfExperience === 0 && hasEducation) {
    strategy += careerLevelPrompts.entry;
  } else if (yearsOfExperience <= 2) {
    strategy += careerLevelPrompts.entry;
  } else if (yearsOfExperience <= 5) {
    strategy += careerLevelPrompts.mid;
  } else if (yearsOfExperience <= 10) {
    strategy += careerLevelPrompts.senior;
  } else {
    strategy += careerLevelPrompts.executive;
  }

  // Add industry-specific guidance if identifiable
  const positions = data.experience.map(e => e.position.toLowerCase()).join(' ');
  const skills = data.skills.join(' ').toLowerCase();
  
  if (skills.includes('javascript') || skills.includes('python') || positions.includes('developer')) {
    strategy += '\n' + industryPrompts.tech;
  } else if (positions.includes('nurse') || positions.includes('doctor') || positions.includes('medical')) {
    strategy += '\n' + industryPrompts.healthcare;
  } else if (positions.includes('analyst') || positions.includes('accountant') || positions.includes('financial')) {
    strategy += '\n' + industryPrompts.finance;
  } else if (positions.includes('marketing') || positions.includes('brand') || positions.includes('social media')) {
    strategy += '\n' + industryPrompts.marketing;
  } else if (positions.includes('teacher') || positions.includes('professor') || positions.includes('instructor')) {
    strategy += '\n' + industryPrompts.education;
  } else if (positions.includes('sales') || positions.includes('account') || positions.includes('business development')) {
    strategy += '\n' + industryPrompts.sales;
  }

  return strategy;
};

// Validation prompts for AI-generated content
export const validateContentPrompt = (content: string, type: 'summary' | 'experience' | 'skills'): string => {
  return `
Validate and improve this AI-generated resume content:

CONTENT TYPE: ${type}
CONTENT: ${content}

CHECK FOR:
1. Truthfulness - Remove any exaggerations
2. Clarity - Ensure clear, concise language
3. Grammar - Fix any grammatical errors
4. Professionalism - Maintain professional tone
5. Relevance - Ensure content is relevant and impactful
6. Keywords - Include industry-standard terms
7. Quantification - Add metrics where appropriate

Return the validated and improved version.
  `.trim();
};

export default resumePrompts;