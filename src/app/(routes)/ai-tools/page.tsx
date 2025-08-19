"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const tools =  [
  {
    "title": "ChatGPT",
    "description": "A general-purpose AI assistant by OpenAI, handles conversation, content generation, summarization, and more.",
    "category": "Generative AI",
    "url": "https://chat.openai.com/"
  },
  {
    "title": "GPT-4o",
    "description": "A multimodal AI model—text, image, and voice—strong on personalization and context.",
    "category": "Generative AI",
    "url": "https://openai.com/index/hello-gpt-4o/"
  },
  {
    "title": "Gemini",
    "description": "Google’s multimodal AI agent with deep integration in Workspace, excels at fact-checking and productivity.",
    "category": "Generative AI",
    "url": "https://gemini.google.com/"
  },
  {
    "title": "Grok",
    "description": "AI from X (formerly Twitter) known for its unfiltered, logic-heavy responses.",
    "category": "Generative AI",
    "url": "https://x.ai/"
  },
  {
    "title": "Claude",
    "description": "An ethical, context-aware AI assistant focused on safer, thoughtful interactions.",
    "category": "Generative AI",
    "url": "https://claude.ai/"
  },
  {
    "title": "DeepSeek",
    "description": "A research-focused AI tool that helps professionals discover and organize information.",
    "category": "Research",
    "url": "https://deepseek.com/"
  },
  {
    "title": "Perplexity",
    "description": "A real-time research engine that fetches answers from the web with citations.",
    "category": "Research",
    "url": "https://www.perplexity.ai/"
  },
  {
    "title": "DALL-E 3",
    "description": "OpenAI’s latest text-to-image generator, better at following complex prompts and rendering details.",
    "category": "Image Generation",
    "url": "https://openai.com/dall-e-3"
  },
  {
    "title": "Midjourney",
    "description": "AI image generator known for its painterly style and creative outputs.",
    "category": "Image Generation",
    "url": "https://www.midjourney.com/"
  },
  {
    "title": "Synthesia",
    "description": "AI video generator: turns text into video with avatars in multiple languages.",
    "category": "Video",
    "url": "https://www.synthesia.io/"
  },
  {
    "title": "Fathom",
    "description": "An AI meeting assistant that records calls and highlights who said what.",
    "category": "Productivity",
    "url": "https://fathom.video/"
  },
  {
    "title": "n8n",
    "description": "An automation tool that builds workflows visually and connects apps via AI triggers.",
    "category": "Productivity",
    "url": "https://n8n.io/"
  },
  {
    "title": "Manus",
    "description": "An AI co-writer specialized for crafting high-stakes narratives.",
    "category": "Writing",
    "url": "https://manus.ai/"
  },
  {
    "title": "Google Imagen 3",
    "description": "Google’s AI image-gen model delivering highly realistic visuals.",
    "category": "Image Generation",
    "url": "https://imagen.google/"
  },
  {
    "title": "Adobe Firefly",
    "description": "Image generation AI integrated with Creative Cloud, designed for safe, commercial use.",
    "category": "Image Generation",
    "url": "https://www.adobe.com/sensei/generative-ai/firefly.html"
  },
  {
    "title": "Grammarly",
    "description": "AI-powered writing assistant for clarity, grammar, style, and tone.",
    "category": "Writing",
    "url": "https://www.grammarly.com/"
  },
  {
    "title": "Fireflies",
    "description": "AI that transcribes meetings and pulls out key summaries and action items.",
    "category": "Productivity",
    "url": "https://fireflies.ai/"
  },
  {
    "title": "Jamie",
    "description": "AI note-taker with transcription and meeting highlight features.",
    "category": "Productivity",
    "url": "https://jamie.ai/"
  },
  {
    "title": "Cursor",
    "description": "An AI coding assistant that helps write code based on your intent.",
    "category": "Coding",
    "url": "https://cursor.so/"
  },
  {
    "title": "HubSpot Email Writer",
    "description": "AI tool that helps compose and improve marketing emails.",
    "category": "Marketing",
    "url": "https://www.hubspot.com/products/ai/email-writer"
  },
  {
    "title": "Copilot for PowerPoint",
    "description": "Generates presentation slides and speaker suggestions via AI.",
    "category": "Productivity",
    "url": "https://www.microsoft.com/en-us/microsoft-365/copilot"
  },
  {
    "title": "ElevenLabs",
    "description": "Realistic text-to-speech AI with emotion-aware voice synthesis and voice cloning.",
    "category": "Voice & Audio",
    "url": "https://elevenlabs.io/"
  },
  {
    "title": "Murf.ai",
    "description": "AI voice generation tool for creating voiceovers and narration.",
    "category": "Voice & Audio",
    "url": "https://murf.ai/"
  },
  {
    "title": "Suno",
    "description": "AI-powered music generation tool.",
    "category": "Voice & Audio",
    "url": "https://suno.ai/"
  },
  {
    "title": "NotebookLM",
    "description": "AI assistant for personal data—digests docs, provides audio overviews and insights.",
    "category": "Research",
    "url": "https://notebooklm.google/"
  },
  {
    "title": "Canva Magic Studio",
    "description": "AI-enhanced design tools within Canva for quick creative work.",
    "category": "Design",
    "url": "https://www.canva.com/magic/"
  },
  {
    "title": "Looka",
    "description": "AI logo and branding design tool.",
    "category": "Design",
    "url": "https://looka.com/"
  },
  {
    "title": "Reclaim",
    "description": "AI scheduling assistant that auto-manages your calendar.",
    "category": "Productivity",
    "url": "https://reclaim.ai/"
  },
  {
    "title": "Clockwise",
    "description": "Smart time-management AI that optimizes your schedule for deep work.",
    "category": "Productivity",
    "url": "https://www.getclockwise.com/"
  },
  {
    "title": "Gamma",
    "description": "AI presentation builder with fast, clean slide creation.",
    "category": "Productivity",
    "url": "https://gamma.app/"
  },
  {
    "title": "Rytr",
    "description": "AI writing assistant that helps generate content across formats.",
    "category": "Writing",
    "url": "https://rytr.me/"
  },
  {
    "title": "Sudowrite",
    "description": "AI tool for creative writing, helping brainstorm and refine stories.",
    "category": "Writing",
    "url": "https://www.sudowrite.com/"
  },
  {
    "title": "Google Translate",
    "description": "AI translator supporting many languages with high accuracy.",
    "category": "Translation",
    "url": "https://translate.google.com/"
  },
  {
    "title": "DeepL",
    "description": "Advanced AI translation tool known for fluent and natural results.",
    "category": "Translation",
    "url": "https://www.deepl.com/"
  },
  {
    "title": "Otter.AI",
    "description": "Transcribes meetings, though with occasional glitches.",
    "category": "Productivity",
    "url": "https://otter.ai/"
  },
  {
    "title": "AdCreative.ai",
    "description": "AI-powered ad and social media content generator.",
    "category": "Marketing",
    "url": "https://www.adcreative.ai/"
  },
  {
    "title": "Hostinger AI Website Builder",
    "description": "Builds websites from description using AI.",
    "category": "Design",
    "url": "https://www.hostinger.com/website-builder"
  },
  {
    "title": "GitHub Copilot",
    "description": "AI assistant that writes code and offers suggestions inside your editor.",
    "category": "Coding",
    "url": "https://github.com/features/copilot"
  },
  {
    "title": "Tabnine",
    "description": "AI tool for intelligent code completion across languages.",
    "category": "Coding",
    "url": "https://www.tabnine.com/"
  },
  {
    "title": "Writesonic",
    "description": "AI content creator for marketing copy, blogs, and more.",
    "category": "Writing",
    "url": "https://writesonic.com/"
  },
  {
    "title": "QuillBot",
    "description": "Paraphrasing and writing enhancement AI.",
    "category": "Writing",
    "url": "https://quillbot.com/"
  }
];
const categories = ["All", ...Array.from(new Set(tools.map(tool => tool.category)))];

export default function AiToolsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = filter === "All" || tool.category === filter;
      const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-gray-800">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle categories"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search AI tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 mx-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside 
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:sticky
            top-[65px] lg:top-0
            left-0
            h-[calc(100vh-65px)] lg:h-screen
            w-64
            bg-white
            border-r border-gray-200
            p-6
            overflow-y-auto
            transition-transform duration-300
            z-40
            lg:block
          `}
        >
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setSidebarOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg mb-2 transition 
                ${filter === cat ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 mt-[65px] lg:mt-0">
          {/* Desktop Search */}
          <div className="mb-6 hidden lg:block">
            <input
              type="text"
              placeholder="Search AI tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
          >
            {filteredTools.map((tool, index) => (
              <motion.a
                key={tool.title}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.03 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="p-4 lg:p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-500 transition bg-white"
              >
                <h3 className="text-base lg:text-lg font-semibold mb-2">{tool.title}</h3>
                <p className="text-gray-600 text-xs lg:text-sm mb-3 line-clamp-3">{tool.description}</p>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {tool.category}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}