'use client';

import { memo, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-jsx';

function CodeBlock({ language, value }: { language: string; value: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (codeRef.current) Prism.highlightElement(codeRef.current); }, [value, language]);

  return <div className="group relative my-4 max-w-full overflow-hidden rounded-lg border border-slate-700 bg-[#1d1f21]">
    <div className="flex items-center justify-between border-b border-slate-700 bg-[#2d2d2d] px-4 py-2 text-xs text-slate-300">
      <span>{language}</span>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }} className="rounded px-2 py-1 hover:bg-slate-600" aria-label={`Copy ${language} code`}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
    <pre className="overflow-x-auto p-4 text-xs leading-6"><code ref={codeRef} className={`language-${language}`}>{value}</code></pre>
  </div>;
}

const TomatoMarkdown = memo(function TomatoMarkdown({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    code({ className, children, ...props }: any) {
      const language = /language-(\w+)/.exec(className || '')?.[1];
      if (language) return <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />;
      return <code className="inline-code" {...props}>{children}</code>;
    },
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>,
    ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    h1: ({ children }) => <h1 className="mb-4 mt-6 text-3xl font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-3 mt-5 text-2xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-4 text-xl font-bold">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-slate-300 py-2 pl-4 italic text-slate-600 dark:text-slate-400">{children}</blockquote>,
    table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="min-w-full border border-slate-200 text-sm dark:border-slate-700">{children}</table></div>,
    th: ({ children }) => <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left dark:border-slate-700 dark:bg-slate-800">{children}</th>,
    td: ({ children }) => <td className="border border-slate-200 px-3 py-2 dark:border-slate-700">{children}</td>,
  }}>{content}</ReactMarkdown>;
});

export default TomatoMarkdown;
