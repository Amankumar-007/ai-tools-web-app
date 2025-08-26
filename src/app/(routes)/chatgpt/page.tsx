"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Role = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTitleFromPrompt(text: string) {
  return (text || "New chat").split("\n")[0].slice(0, 40) || "New chat";
}

export default function ChatGPTPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("chatgpt_convos_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        setConvos(parsed);
        if (parsed.length) setActiveId(parsed[0].id);
      }
    } catch {}
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chatgpt_convos_v1", JSON.stringify(convos));
    } catch {}
  }, [convos]);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) || null,
    [convos, activeId]
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [active?.messages.length]);

  function createNewChat(seed?: string) {
    const id = uid();
    const now = Date.now();
    const convo: Conversation = {
      id,
      title: formatTitleFromPrompt(seed || "New chat"),
      messages: seed
        ? [
            {
              id: uid(),
              role: "user",
              content: seed,
              createdAt: now,
            },
          ]
        : [],
      createdAt: now,
      updatedAt: now,
    };
    setConvos((prev) => [convo, ...prev]);
    setActiveId(id);
    return convo;
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setInput("");

    // ensure active convo
    let convo = active;
    if (!convo) {
      convo = createNewChat(text);
    }

    const userMsg: Message = { id: uid(), role: "user", content: text, createdAt: Date.now() };

    setConvos((prev) =>
      prev.map((c) =>
        c.id === convo!.id
          ? {
              ...c,
              title: c.messages.length === 0 ? formatTitleFromPrompt(text) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    try {
      const payload = {
        messages: [
          { role: "system", content: "You are a helpful, concise AI assistant." },
          ...convo!.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.6,
      };

      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = (await res.json()) as { reply: string };
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply || "",
        createdAt: Date.now(),
      };

      setConvos((prev) =>
        prev.map((c) =>
          c.id === convo!.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } catch (err: any) {
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: `Error: ${err?.message || "Something went wrong"}`,
        createdAt: Date.now(),
      };
      setConvos((prev) =>
        prev.map((c) =>
          c.id === (convo?.id || "")
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function deleteConvo(id: string) {
    setConvos((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(convos.find((c) => c.id !== id)?.id || null);
  }

  function clearAll() {
    setConvos([]);
    setActiveId(null);
  }

  // Function to format code blocks in messages
  const formatMessage = (content: string) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>);
      }

      // Add code block with syntax highlighting
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <pre key={`code-${match.index}`} className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100dvh-0rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Image src="/logo.png" alt="tomatoChat logo" width={28} height={28} className="rounded-sm" />
            <div className="truncate">
              <h2 className="text-base font-semibold text-gray-900 leading-5">tomatoChat</h2>
              <span className="text-[11px] text-gray-500">by aman kumar</span>
            </div>
          </div>
          <button
            className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-black transition-colors"
            onClick={() => createNewChat()}
          >
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {convos.length === 0 ? (
            <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {convos.map((c) => (
                <li key={c.id} className="group">
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm transition-all duration-200 ${
                      activeId === c.id 
                        ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 shadow-sm" 
                        : "bg-white border border-gray-100 hover:border-red-100 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${activeId === c.id ? "bg-red-500" : "bg-gray-300"}`}></div>
                      <span className="font-medium text-gray-800 truncate">{c.title}</span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConvo(c.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {convos.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full py-2 px-4 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={clearAll}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all conversations
            </button>
          </div>
        )}
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="tomatoChat logo" width={24} height={24} className="rounded-sm" />
          <div className="leading-4">
            <div className="text-sm font-semibold text-gray-900">tomatoChat</div>
            <div className="text-[10px] text-gray-500">by aman kumar</div>
          </div>
        </div>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          Home
        </Link>
      </div>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col md:rounded-l-2xl bg-white shadow-sm overflow-hidden mt-14 md:mt-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <Image src="/logo.png" alt="tomatoChat logo" width={32} height={32} className="rounded-sm" />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 leading-5">tomatoChat</div>
              <div className="text-xs text-gray-500">by aman kumar · Powered by OpenAI API</div>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">
            ← Back to Home
          </Link>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
          {(!active || active.messages.length === 0) && (
            <div className="mx-auto max-w-2xl text-center text-gray-500 pt-12">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
              <p className="text-sm text-gray-600">Type a message below to begin chatting with tomatoChat. Your conversations are saved locally in your browser.</p>
            </div>
          )}

          {active?.messages.map((m) => (
            <div key={m.id} className={`w-full flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-5 py-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {m.role === "assistant" ? formatMessage(m.content) : m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-white border border-gray-200 text-sm text-gray-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                  <span className="text-gray-600">Generating response...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl flex flex-col gap-3">
            <div className="relative flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message tomatoChat..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && input.trim()) {
                      void sendMessage();
                    }
                  }
                }}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                style={{ minHeight: "44px", maxHeight: "150px" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="self-end rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending
                  </div>
                ) : (
                  <div className="flex items-center">
                    Send
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Enter to send, Shift+Enter for new line
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}