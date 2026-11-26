import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FileText,
  Monitor,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";

import JsonLd, {
  breadcrumbListStructuredData,
  faqPageStructuredData,
} from "@/components/JsonLd";
import ToolPageNavbar from "@/components/ToolPageNavbar";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { SITE_URL } from "@/metadata-utils";

import styles from "./page.module.scss";

const entryPoints = [
  { href: "/ai-tools", title: "AI Tools Directory", detail: "Find AI tools by task and pricing", icon: Search },
  { href: "/tomato-ai", title: "TomatoAi Assistant", detail: "Ask, brainstorm, and draft", icon: Sparkles },
  { href: "/tools", title: "Daily Tools", detail: "Work with PDFs, images, and more", icon: FileText },
  { href: "/n8n-templates", title: "n8n Templates", detail: "Start with a ready-made workflow", icon: Workflow },
];

const steps = [
  {
    title: "Choose a tool",
    description: "Browse the directory when you need to find software. Open Daily Tools or the Assistant when you have a task to finish.",
  },
  {
    title: "Add what the tool needs",
    description: "Enter a search term, describe what you want to create, or select a file. An AI tool may ask you to sign in before it runs.",
  },
  {
    title: "Use the result",
    description: "Open a listing to visit its provider, review and refine an AI draft, or copy or download a result where the tool supports it.",
  },
];

const faqs = [
  {
    question: "Do I need an account to use TomatoAi?",
    answer: "You can browse the AI directory and use browser-based tools like the GST calculator without an account. AI features such as the Email Writer require sign-in and count toward your plan’s usage limits.",
  },
  {
    question: "Can I run n8n workflows in TomatoAi?",
    answer: "Browse the template library, copy or download a workflow’s JSON, then import it into your own n8n instance. Connect the accounts the workflow needs and test it there.",
  },
  {
    question: "Can I use the AI tools in languages other than English?",
    answer: "The AI tools in Daily Tools can write in Hindi, Hinglish, and other languages. Pick an output language in a tool such as the Email Writer or Translator.",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={[
        breadcrumbListStructuredData([
          { name: "Home", url: SITE_URL },
          { name: "About TomatoAi", url: `${SITE_URL}/about` },
        ]),
        faqPageStructuredData(faqs),
      ]} />
      <ToolPageNavbar />

      <main id="about-content" className={styles.container}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>About TomatoAi</p>
            <h1 className={styles.headline}>Find the right tool. <span>Get it done.</span></h1>
            <p className={styles.intro}>
              TomatoAi brings AI discovery and everyday tools together. Find software for a task,
              get help writing or researching, or handle PDFs, images, and calculations in your browser.
            </p>
            <div className={styles.actions}>
              <Link href="/tools" className={styles.primaryLink}>
                Explore Daily Tools <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <a href="#how-it-works" className={styles.textLink}>
                See how it works <ArrowDown aria-hidden="true" size={16} />
              </a>
            </div>
          </div>

          <nav className={styles.toolPanel} aria-labelledby="start-title">
            <h2 id="start-title">What do you want to do?</h2>
            <ul>
              {entryPoints.map(({ href, title, detail, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={styles.toolLink}>
                    <span className={styles.toolIcon}><Icon aria-hidden="true" size={19} /></span>
                    <span>
                      <span className={styles.toolTitle}>{title}</span>
                      <span className={styles.toolDetail}>{detail}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" size={17} className={styles.toolArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section id="how-it-works" aria-labelledby="how-title" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2 id="how-title">How TomatoAi works</h2>
            <p>Start with the task you have in mind and follow the tool’s instructions.</p>
          </div>
          <ol className={styles.steps}>
            {steps.map(({ title, description }, index) => (
              <li key={title} className={styles.step}>
                <span aria-hidden="true" className={styles.stepNumber}>{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="processing-title" className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2 id="processing-title">What happens to your input?</h2>
            <p>How TomatoAi handles your files and text depends on the tool you choose.</p>
          </div>
          <div className={styles.processingGrid}>
            <article className={styles.processingCard}>
              <span className={styles.processIcon}><Monitor aria-hidden="true" size={21} /></span>
              <h3>Tools that run in your browser</h3>
              <p>Utilities such as the GST calculator and image compressor process their inputs on your device. Those inputs stay in your browser.</p>
              <Link href="/tools/gst-calculator" className={styles.textLink}>Try the GST calculator <ArrowRight aria-hidden="true" size={16} /></Link>
            </article>
            <article className={styles.processingCard}>
              <span className={styles.processIcon}><Sparkles aria-hidden="true" size={21} /></span>
              <h3>Tools that use an AI model</h3>
              <p>Tools such as the Email Writer send the details you enter to TomatoAi’s server. The server passes the request to an AI provider and returns a draft you can refine.</p>
              <Link href="/tools/email-writer" className={styles.textLink}>Try the Email Writer <ArrowRight aria-hidden="true" size={16} /></Link>
            </article>
          </div>
          <Link href="/privacy" className={styles.privacyLink}>Read the Privacy Policy <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </section>

        <section aria-labelledby="why-title" className={`${styles.section} ${styles.project}`}>
          <div>
            <h2 id="why-title">Why we built TomatoAi</h2>
            <p>
              Finding a tool often means sorting through lists and switching between tabs. We built
              TomatoAi to bring that search and common tasks like compressing an image or drafting an
              email into one place.
            </p>
          </div>
          <div>
            <h3>Start with an example</h3>
            <p>Browse reusable prompts for writing, research, and coding, or start with an n8n template for a task you repeat.</p>
            <div className={styles.projectLinks}>
              <Link href="/prompts" className={styles.textLink}>Prompt library <ArrowUpRight aria-hidden="true" size={16} /></Link>
              <Link href="/n8n-templates" className={styles.textLink}>n8n templates <ArrowUpRight aria-hidden="true" size={16} /></Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-title" className={`${styles.section} ${styles.faq}`}>
          <h2 id="faq-title">Common questions</h2>
          <div>
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}<ChevronDown aria-hidden="true" size={18} /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="updates-title" className={styles.updates}>
          <div>
            <h2 id="updates-title">Get TomatoAi updates</h2>
            <p>Sign up for new tool discoveries and practical tips.</p>
          </div>
          <NewsletterSignup source="about" />
        </section>

        <footer className={styles.footer}>
          <Link href="/">TomatoAi home</Link>
          <Link href="/pricing">Plans and limits</Link>
          <a href="mailto:support@tomatoai.in">Contact support</a>
        </footer>
      </main>
    </div>
  );
}
