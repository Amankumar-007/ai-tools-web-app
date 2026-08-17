import JsonLd, { faqPageStructuredData } from '@/components/JsonLd'

export interface ToolAboutContent {
  /** Heading for the explainer block, e.g. "About the AI Summarizer". */
  heading: string
  /** One or two paragraphs describing what the tool does and who it is for. */
  intro: string[]
  /** Numbered "how to use it" steps. */
  steps: Array<{ title: string; text: string }>
  faqs: Array<{ question: string; answer: string }>
}

// Server-rendered explainer + FAQ that sits below an interactive tool.
//
// The tool UIs themselves are a heading, an input and a button — perfectly
// usable, but only a few dozen words of indexable text, which is why they were
// all flagged as thin content. This block gives each page the substance a
// search engine (and a first-time visitor) needs, and ships FAQ structured
// data alongside it.
export default function ToolPageAbout({ content }: { content: ToolAboutContent }) {
  return (
    <section className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#070709]">
      <JsonLd data={faqPageStructuredData(content.faqs)} />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
          {content.heading}
        </h2>

        <div className="flex flex-col gap-4 mb-12">
          {content.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">How to use it</h3>
        <ol className="flex flex-col gap-6 mb-12">
          {content.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Frequently asked questions
        </h3>
        <div className="flex flex-col gap-6">
          {content.faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
