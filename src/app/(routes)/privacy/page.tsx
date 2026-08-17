import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, SITE_URL } from "@/metadata-utils";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd, { breadcrumbListStructuredData } from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How TomatoAi collects, uses and protects your data: account details, AI prompt handling, cookies, analytics, third-party model providers, and your rights.",
  keywords: ["TomatoAi privacy policy", "AI tools data protection", "AI prompt privacy", "cookie policy"],
  path: "/privacy",
});

const LAST_UPDATED = "17 August 2026";

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    heading: "Information we collect",
    body: (
      <>
        <p>We keep data collection to what the service actually needs to work:</p>
        <ul>
          <li>
            <strong>Account information.</strong> If you create an account, we store your email address and
            authentication identifiers through our authentication provider, Supabase.
          </li>
          <li>
            <strong>Content you submit.</strong> Prompts, documents, resumes and images you upload to tools such as the
            summarizer, resume analyzer or prompt generator are processed to return your result.
          </li>
          <li>
            <strong>Payment information.</strong> Paid plans are processed by Stripe. Card numbers never reach our
            servers &mdash; we only receive a subscription status and a customer reference.
          </li>
          <li>
            <strong>Usage data.</strong> Standard request logs (IP address, browser type, pages visited, timestamps),
            used for security, rate limiting and diagnosing errors.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    heading: "How we use your information",
    body: (
      <>
        <p>We use the information above to:</p>
        <ul>
          <li>Deliver the AI tools you request and return their output to you.</li>
          <li>Authenticate you, keep your session active and apply your plan&apos;s entitlements.</li>
          <li>Protect the service from abuse, including per-IP rate limiting on our API routes.</li>
          <li>Understand which pages and tools are used so we can prioritise improvements.</li>
          <li>Send service messages such as billing receipts and account notices.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use the content you submit to train our own models.
        </p>
      </>
    ),
  },
  {
    id: "ai-providers",
    heading: "Third-party AI providers",
    body: (
      <>
        <p>
          TomatoAi does not train or host its own large language models. When you use a tool, your prompt and any
          attached content are forwarded to the model provider that powers it &mdash; which may include OpenAI,
          Anthropic, Google, or models routed through OpenRouter and Replicate.
        </p>
        <p>
          Each provider handles that data under its own privacy policy and retention schedule. Because your content
          leaves our systems when a request is made, please do not submit confidential, regulated or personally
          sensitive material to any AI tool on this site.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-analytics",
    heading: "Cookies and analytics",
    body: (
      <>
        <p>We use two categories of cookies:</p>
        <ul>
          <li>
            <strong>Essential cookies</strong> keep you signed in and remember your theme preference. The site cannot
            function without them.
          </li>
          <li>
            <strong>Analytics cookies</strong> from Google Analytics give us aggregate traffic statistics. You can
            block these in your browser settings or with any standard content blocker without losing functionality.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-retention",
    heading: "Data retention",
    body: (
      <p>
        Account records are retained for as long as your account is open. Files you upload for one-off processing (such
        as a resume or PDF) are held only for the duration of the request and are not stored afterwards. Request logs
        are rotated on a short cycle. When you delete your account, we remove your account record and associated
        history, apart from anything we are required to retain for tax or accounting purposes.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete the personal data we
          hold about you, and to object to certain processing. To exercise any of these, email{" "}
          <a href="mailto:support@tomatoai.in">support@tomatoai.in</a> from your account address and we will respond
          within 30 days.
        </p>
        <p>
          TomatoAi is operated from India. If you access the service from elsewhere, your data will be processed in
          India and in the regions where our infrastructure and model providers operate.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    heading: "Children's privacy",
    body: (
      <p>
        TomatoAi is not directed at children under 13, and we do not knowingly collect their personal information. If
        you believe a child has provided us with personal data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the service changes. The &ldquo;last updated&rdquo; date at the top of this page
        always reflects the current version, and material changes will be announced on the site. Continuing to use
        TomatoAi after a change means you accept the revised policy. See also our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: "Home", url: SITE_URL },
          { name: "Privacy Policy", url: `${SITE_URL}/privacy` },
        ])}
      />
      <LegalPage
        title="Privacy Policy"
        lastUpdated={LAST_UPDATED}
        intro="This policy explains what TomatoAi collects when you browse the AI tools directory or run one of our tools, why we collect it, who we share it with, and the control you have over it."
        sections={sections}
      />
    </>
  );
}
