import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, SITE_URL } from "@/metadata-utils";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd, { breadcrumbListStructuredData } from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "The terms governing your use of TomatoAi: accounts, acceptable use, subscriptions and refunds, directory accuracy and liability.",
  keywords: ["TomatoAi terms of service", "AI tools terms", "acceptable use policy", "subscription terms"],
  path: "/terms",
});

const LAST_UPDATED = "17 August 2026";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of these terms",
    body: (
      <p>
        By accessing TomatoAi, browsing the AI tools directory, or using any tool on this site, you agree to these
        terms. If you are using TomatoAi on behalf of an organisation, you confirm you are authorised to bind that
        organisation. If you do not agree, please stop using the service.
      </p>
    ),
  },
  {
    id: "accounts",
    heading: "Your account",
    body: (
      <>
        <p>
          Some features require an account. You are responsible for keeping your credentials secure and for all
          activity that takes place under your account. Tell us promptly at{" "}
          <a href="mailto:support@tomatoai.in">support@tomatoai.in</a> if you suspect unauthorised access.
        </p>
        <p>
          You must be at least 13 years old to create an account, and you must provide accurate information when you
          register.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>When using the AI tools on TomatoAi, you agree not to:</p>
        <ul>
          <li>Generate content that is unlawful, defamatory, harassing, or that infringes someone else&apos;s rights.</li>
          <li>Submit malware, or attempt to probe, disrupt or gain unauthorised access to the service.</li>
          <li>
            Bypass rate limits, scrape the directory at scale, or use automated tooling to resell access to our AI
            endpoints.
          </li>
          <li>Upload confidential or regulated data belonging to third parties without the right to do so.</li>
          <li>Misrepresent AI-generated output as human-authored where doing so is unlawful or deceptive.</li>
        </ul>
        <p>We may suspend or terminate accounts that breach these rules, with or without notice.</p>
      </>
    ),
  },
  {
    id: "ai-output",
    heading: "AI-generated output",
    body: (
      <>
        <p>
          Output from AI models is generated automatically and can be inaccurate, incomplete or biased. It is provided
          for your own evaluation and is not professional, legal, medical or financial advice. You are responsible for
          reviewing and verifying any output before relying on it or publishing it.
        </p>
        <p>
          As between you and TomatoAi, you retain ownership of the content you submit and of the output you receive,
          subject to the terms of the underlying model provider. Note that AI models can produce similar output for
          different users, so we cannot guarantee your output is unique or protectable.
        </p>
      </>
    ),
  },
  {
    id: "directory-accuracy",
    heading: "Directory listings and third-party tools",
    body: (
      <p>
        Our directory describes AI products built and operated by other companies. Pricing, features and availability
        change frequently, and listings may become out of date. Listings are informational and are not endorsements. We
        are not responsible for third-party products, their websites, or any agreement you enter into with them. If you
        find an inaccurate listing, let us know and we will correct it.
      </p>
    ),
  },
  {
    id: "subscriptions",
    heading: "Subscriptions, billing and refunds",
    body: (
      <>
        <p>
          Paid plans are billed in advance through Stripe on a recurring basis until cancelled. Prices are shown on
          our <Link href="/pricing">pricing page</Link> and may change with notice for future billing periods.
        </p>
        <p>
          You can cancel at any time from your account; cancellation stops future renewals and your plan stays active
          until the end of the period you have already paid for. Because access is granted immediately, payments are
          generally non-refundable, but if the service was unavailable or billed in error, contact us within 14 days and
          we will make it right.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: (
      <p>
        The TomatoAi name, logo, site design, written guides and curation of the directory belong to TomatoAi and are
        protected by intellectual property law. You may link to our pages and quote short excerpts with attribution,
        but you may not copy substantial portions of the site or republish the directory as your own.
      </p>
    ),
  },
  {
    id: "availability",
    heading: "Service availability",
    body: (
      <p>
        We work to keep TomatoAi available, but the service is provided &ldquo;as is&rdquo; without warranties of any
        kind. Features depend on third-party model providers and may be changed, limited or discontinued. We may
        perform maintenance or impose usage limits to keep the service stable for everyone.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <p>
        To the fullest extent permitted by law, TomatoAi is not liable for indirect, incidental or consequential
        damages, or for lost profits, data or business opportunities arising from your use of the service or of any AI
        output. Our total liability for any claim is limited to the amount you paid us in the twelve months before the
        claim arose.
      </p>
    ),
  },
  {
    id: "changes-and-law",
    heading: "Changes and governing law",
    body: (
      <p>
        We may update these terms as the service evolves; the &ldquo;last updated&rdquo; date reflects the current
        version, and continued use after a change means you accept it. These terms are governed by the laws of India,
        and the courts of India have exclusive jurisdiction over any dispute. Our{" "}
        <Link href="/privacy">Privacy Policy</Link> forms part of these terms.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: "Home", url: SITE_URL },
          { name: "Terms of Service", url: `${SITE_URL}/terms` },
        ])}
      />
      <LegalPage
        title="Terms of Service"
        lastUpdated={LAST_UPDATED}
        intro="These terms set out the rules for using TomatoAi — our AI tools directory, the AI tools we host, and any paid plan you subscribe to. Please read them before using the service."
        sections={sections}
      />
    </>
  );
}
