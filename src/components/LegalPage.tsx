import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

// Server component shared by /privacy and /terms so both legal pages render
// fully in the initial HTML (no client gating), each with exactly one <h1>
// and a crawlable in-page nav.
export default function LegalPage({
  title,
  intro,
  lastUpdated,
  sections,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070709] transition-colors duration-500">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#070709]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              About
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              On this page
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {section.heading}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
            Last updated: {lastUpdated}
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
            {intro}
          </p>

          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-4 text-slate-600 dark:text-slate-300 leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_li]:list-disc [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_strong]:text-slate-900 dark:[&_strong]:text-white">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
            Questions about this page? Email{" "}
            <a href="mailto:support@tomatoai.in" className="text-blue-600 dark:text-blue-400 underline">
              support@tomatoai.in
            </a>
            , or read more{" "}
            <Link href="/about" className="text-blue-600 dark:text-blue-400 underline">
              about TomatoAi
            </Link>
            .
          </div>
        </main>
      </div>
    </div>
  );
}
