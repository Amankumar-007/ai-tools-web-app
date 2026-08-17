import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Resume Analyzer & Optimizer - Free ATS Check',
  description: 'Analyze and optimize your resume with AI. Get instant feedback, ATS compatibility scoring, and improvement suggestions to land more interviews.',
  keywords: ['AI resume analyzer', 'resume optimizer', 'ATS resume checker', 'AI resume feedback', 'resume scanner'],
  path: '/resume-analyzer',
})

export default function ResumeAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/resume-analyzer']} />
    </>
  )
}
