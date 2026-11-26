"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase-browser";
import { authFetch } from "@/lib/auth-fetch";
import Modal from 'react-modal';
import TomatoComposer from "@/components/chat/composer/tomato-composer";
import { MessageActions } from "@/components/chat/message-actions";
import { useReadAloud } from "@/components/chat/use-read-aloud";
import { useVoicePrefs } from "@/lib/voice/prefs";
import { StoredImage } from "@/components/chat/stored-image";
import { useAttachments } from "@/components/chat/use-attachments";
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  ThemePicker,
  accentCss,
  isAccentId,
  type AccentId,
} from "@/components/chat/theme-picker";
import {
  buildChatContext,
  commitAttachments,
  ensureImageDescriptions,
  type LegacyImage,
  type MessageAttachment,
} from "@/lib/ai-context/builder";
import { getModelLabel, isTaskType, TASK_LABELS } from "@/lib/ai-context/model-labels";
import {
  deleteConversationItems,
  deleteUserItems,
  moveUserItems,
  putItems,
} from "@/lib/ai-context/store";
import { detectImageRequest } from "@/lib/ai-context/heuristics";
import { AUTO_MODEL, type ChatContext, type ChatTurn, type TaskType } from "@/lib/ai-context/types";
import {
  Sparkles,
  Code,
  Brain,
  Scan,
  Eye,
  Check,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Search,
  ChevronRight,
  Info,
  FileText,
  Languages,
  Type,
  FileSearch,
  Palette,
  Scissors,
  Maximize2,
  Cat,
  Image as ImageIcon,
  Plus,
  PanelLeftClose,
  MessageSquareText,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from "sonner";
import { Flame, Zap } from "lucide-react";
import { QuotaModal, type QuotaInfo } from "@/components/chat/quota-modal";
import { getSummary, touchToday } from "@/lib/growth/client";
import { dayKey } from "@/lib/growth/config";
// Set modal app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Dynamic import for Framer Motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div />
});
const MarkdownRenderer = dynamic(() => import('@/components/TomatoMarkdown'), {
  loading: () => <div className="whitespace-pre-wrap text-sm leading-7">Loading message…</div>,
});

type Role = "user" | "assistant" | "system";
// Auto: the server picks the best model for each message (image, code, document…).
const DEFAULT_MODEL = AUTO_MODEL;
const LIGHTNING_MODEL = "nvidia/nemotron-3.5-lightning:free";

/** Thrown when the daily limit is hit: the limit dialog explains it, so it is not shown as a generic error. */
class QuotaStop extends Error {}

type ChatPayload = { messages: ChatTurn[]; model: string; temperature: number; context: ChatContext };

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  status?: 'stopped' | 'interrupted';
  /** Older messages only: image uploaded to a remote URL before the context store existed. */
  image?: { url: string; name: string };
  /** Files shared with this message; their content lives in the context store. */
  attachments?: MessageAttachment[];
  /** Which model answered, and for what kind of task. */
  meta?: { model: string; task?: TaskType };
};

function stripLegacyImage(content: string) {
  return content.replace(/^!\[[^\]]*\]\([^)]*\)\s*/, '');
}

function defaultPromptFor(files: Array<{ kind: 'image' | 'document' }>) {
  if (files.length === 0) return '';
  return files.every((file) => file.kind === 'image')
    ? (files.length > 1 ? 'Describe these images.' : 'Describe this image.')
    : 'Summarize the attached file' + (files.length > 1 ? 's.' : '.');
}

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
  return (text || "New chat").split("\n").slice(0, 40).join(" ") || "New chat";
}

// Model picker: a quiet grid of logos. The name appears below on hover/focus and for the current pick.
const MODEL_CHOICES = [
  { id: AUTO_MODEL, name: "Auto", type: "smart routing", logo: "/logo.png" },
  { id: "openrouter/free", name: "OpenRouter Free Router", type: "smart", logo: "https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128" },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B IT", type: "balanced", logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B IT", type: "fast", logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B", type: "compact", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B", type: "large", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra 550B", type: "large", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", type: "fast", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
  { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", type: "compact", logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=128" },
  { id: "poolside/laguna-xs-2.1:free", name: "Laguna XS 2.1", type: "reasoning", logo: "https://www.google.com/s2/favicons?domain=poolside.ai&sz=128" },
  { id: "poolside/laguna-s-2.1:free", name: "Laguna S 2.1", type: "reasoning", logo: "https://www.google.com/s2/favicons?domain=poolside.ai&sz=128" },
  { id: "cohere/north-mini-code:free", name: "Cohere North Mini Code", type: "code", logo: "https://www.google.com/s2/favicons?domain=cohere.com&sz=128" },
  { id: "z-ai/glm-5.2:free", name: "GLM 5.2", type: "balanced", logo: "https://www.google.com/s2/favicons?domain=zhipuai.cn&sz=128" },
];

// What each kind of model is good for, in the words used in the message bar's model list.
const MODEL_NOTES: Record<string, string> = {
  'smart routing': 'Picks the best model for each task',
  smart: 'Smart routing across free models',
  balanced: 'A good all-rounder',
  fast: 'Fast answers',
  compact: 'Light and quick',
  large: 'Deep and powerful',
  reasoning: 'Thinks it through',
  code: 'Best for code',
};
const COMPOSER_MODELS = MODEL_CHOICES.map((model) => ({ id: model.id, name: model.name, note: MODEL_NOTES[model.type] ?? model.type }));

function ModelSelectionModal({ isOpen, onClose, selectedModel, onSelectModel }: {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}) {
  // The model whose name is shown under the grid: hovered/focused, else the current pick.
  const [peek, setPeek] = useState<string | null>(null);
  const shown = MODEL_CHOICES.find((model) => model.id === (peek ?? selectedModel));
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const choose = (id: string) => {
    onSelectModel(id);
    setPeek(id);
    // Brief pause so the chosen name is visible (there is no hover on touch screens).
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => { setPeek(null); onClose(); }, 320);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={220}
      contentLabel="Choose a model"
      className="model-dialog fixed inset-0 z-[9999] flex items-center justify-center p-4 outline-none"
      overlayClassName="model-overlay fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[6px]"
    >
      <div className="w-full max-w-[348px] rounded-[28px] border border-zinc-200 bg-[#fcfbfa] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.22)] dark:border-white/10 dark:bg-[#19191b]">
        <div role="radiogroup" aria-label="Model" className="grid grid-cols-4 gap-3">
          {MODEL_CHOICES.map((model) => {
            const selected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${model.name}, ${model.type}`}
                title={model.name}
                onClick={() => choose(model.id)}
                onMouseEnter={() => setPeek(model.id)}
                onMouseLeave={() => setPeek(null)}
                onFocus={() => setPeek(model.id)}
                onBlur={() => setPeek(null)}
                className={`flex aspect-square items-center justify-center rounded-2xl border bg-white transition-[transform,box-shadow,border-color] duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none active:scale-95 dark:border-white/10 ${selected
                  ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent)]"
                  : "border-zinc-200 focus-visible:border-[var(--accent-line)]"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={model.logo} alt="" className="h-8 w-8 object-contain" />
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="mt-5 min-h-5 truncate text-center text-sm text-zinc-700 dark:text-zinc-300">
          {shown?.name}
          {shown && <span className="text-zinc-400 dark:text-zinc-500"> · {shown.type}</span>}
        </p>
      </div>
    </Modal>
  );
}

// Login Popup Component
function LoginPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      overlayClassName="fixed inset-0 bg-black/40 z-[9998]"
    >
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-white dark:bg-[#111111] rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-white/10 relative text-center"
      >
        <div className="mb-6 mx-auto w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
          <LogIn className="w-6 h-6 text-white dark:text-black" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 px-4 leading-relaxed">Sign in to access AI tools and save your chats.</p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all font-semibold text-sm"
          >
            Sign In
          </button>

          <button
            onClick={() => router.push('/register')}
            className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all font-semibold text-sm"
          >
            Create Account
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-widest font-medium"
        >
          Close
        </button>
      </MotionDiv>
    </Modal>
  );
}

// Suggested Questions Data - Split into two rows
const SUGGESTED_QUESTIONS_ROW1 = [
  { label: "Chat with PDF", icon: FileText, query: "Can you help me analyze a PDF document?" },
  { label: "Translate", icon: Languages, query: "Translate this text for me: " },
  { label: "Analyze Image", icon: Eye, query: "What's in this image?" },
  { label: "Grammar check", icon: Type, query: "Check the grammar of this sentence: " },
  { label: "AI Detector", icon: ShieldCheck, query: "Is this text AI-generated?" },
];

const SUGGESTED_QUESTIONS_ROW2 = [
  { label: "Image Generation", icon: ImageIcon, query: "Generate an image of " },
  { label: "Style Transfer", icon: Palette, query: "Apply a different style to this image." },
  { label: "AI Cartoon Mode", icon: Cat, query: "Turn this photo into a cartoon." },
  { label: "Background Remover", icon: Scissors, query: "Remove the background from this image." },
  { label: "Image Upscaler", icon: Maximize2, query: "Upscale this image to high resolution." },
];

function SuggestionMarquee({ onSelect }: { onSelect: (query: string) => void }) {
  return (
    <div className="w-full flex flex-col gap-4 py-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      {/* Row 1 */}
      <div className="flex animate-marquee whitespace-nowrap gap-4 items-center group">
        {[...SUGGESTED_QUESTIONS_ROW1, ...SUGGESTED_QUESTIONS_ROW1, ...SUGGESTED_QUESTIONS_ROW1].map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.query)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#111111]/80 hover:bg-[#1a1a1a]/90 border border-white/10 rounded-full transition-all text-[13px] text-gray-300 hover:text-white font-medium shadow-sm backdrop-blur-md group-hover:pause"
          >
            <item.icon className="w-4 h-4 opacity-70" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex animate-marquee-slow whitespace-nowrap gap-4 items-center group transition-all">
        {[...SUGGESTED_QUESTIONS_ROW2, ...SUGGESTED_QUESTIONS_ROW2, ...SUGGESTED_QUESTIONS_ROW2].map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.query)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#111111]/80 hover:bg-[#1a1a1a]/90 border border-white/10 rounded-full transition-all text-[13px] text-gray-300 hover:text-white font-medium shadow-sm backdrop-blur-md group-hover:pause"
          >
            <item.icon className="w-4 h-4 opacity-70" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatInterface({ forceChatView = false }: { forceChatView?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingConversationId, setStreamingConversationId] = useState<string | null>(null);
  const [chatError, setChatError] = useState('');
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [accent, setAccent] = useState<AccentId>(DEFAULT_ACCENT);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Files chosen for the next message (read in the background), and a counter that
  // refreshes images shown from the context store when anonymous items move to a user.
  const attach = useAttachments();
  const [contextVersion, setContextVersion] = useState(0);
  // Daily usage chip + limit dialog. `remaining` is the allowance left today plus bonus credits.
  const [quota, setQuota] = useState<{ remaining: number | null; streak: number | null }>({ remaining: null, streak: null });
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const previousModelRef = useRef(DEFAULT_MODEL);
  const [showModelModal, setShowModelModal] = useState(false);
  const [customMemory, setCustomMemory] = useState("");
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // The header and the message bar float over the chat, so the message list fills the whole window height and its
  // scrollbar runs top to bottom. These measure the two, so the list keeps its content clear of them.
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const guardedMain = useRef<HTMLElement | null>(null);
  // The navbar and the message bar are pinned. Focusing the message box (typing, pasting) must not scroll the page frame,
  // or the navbar slides out of view and everything shifts. Any such scroll is put straight back.
  useEffect(() => {
    const el = mainRef.current;
    if (!el || guardedMain.current === el) return;
    guardedMain.current = el;
    const reset = () => { if (el.scrollTop) el.scrollTop = 0; if (el.scrollLeft) el.scrollLeft = 0; };
    el.addEventListener("scroll", reset);
  });
  const composerRef = useRef<HTMLDivElement>(null);
  const [chrome, setChrome] = useState({ top: 72, bottom: 150 });
  useLayoutEffect(() => {
    const measure = () => {
      const top = headerRef.current?.offsetHeight ?? 0;
      const bottom = composerRef.current?.offsetHeight ?? 0;
      setChrome((current) => (current.top === top && current.bottom === bottom ? current : { top, bottom }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    if (composerRef.current) observer.observe(composerRef.current);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef(true);
  const requestActiveRef = useRef(false);
  const lastFailedRequestRef = useRef<{ convoId: string; payload?: ChatPayload; imagePrompt?: { prompt: string; aspectRatio: string }; partialId?: string } | null>(null);
  const [makingImage, setMakingImage] = useState(false);

  const selectModel = (model: string) => {
    if (model === LIGHTNING_MODEL) {
      if (selectedModel !== LIGHTNING_MODEL) previousModelRef.current = selectedModel;
    } else {
      previousModelRef.current = model;
    }
    setSelectedModel(model);
  };

  const toggleLightning = () => {
    if (selectedModel === LIGHTNING_MODEL) {
      setSelectedModel(previousModelRef.current === LIGHTNING_MODEL ? DEFAULT_MODEL : previousModelRef.current);
    } else {
      previousModelRef.current = selectedModel;
      setSelectedModel(LIGHTNING_MODEL);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  useEffect(() => {
    if (!sidebarOpen) return;
    sidebarCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const drawer = sidebarCloseRef.current?.closest('aside');
      const focusable = drawer?.querySelectorAll<HTMLElement>('a, button, input');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [sidebarOpen]);

  const router = useRouter();
  const hasTriggeredRef = useRef(false);

  // Once a day: count today for the streak (and award milestone credits), and load how much is left today.
  useEffect(() => {
    if (isAuthChecking || !user?.id) { setQuota({ remaining: null, streak: null }); return; }
    let cancelled = false;
    (async () => {
      const key = `tomato_touch_${user.id}`;
      let touchedToday = false;
      try { touchedToday = localStorage.getItem(key) === dayKey(); } catch { /* private mode */ }
      const result = touchedToday ? await getSummary() : await touchToday();
      if (cancelled || !result) return;
      if (!touchedToday) { try { localStorage.setItem(key, dayKey()); } catch { /* ignore */ } }
      setQuota({ remaining: result.enabled ? (result.remaining?.chat ?? null) : null, streak: result.streak ?? null });
      const touch = (result as { touch?: { awarded: number; streak: number } }).touch;
      if (touch?.awarded) toast.success(`${touch.streak}-day streak! +${touch.awarded} bonus credits`);
    })();
    return () => { cancelled = true; };
  }, [user?.id, isAuthChecking]);

  useEffect(() => {
    if (isAuthChecking) return;
    if (!isLoaded || loadedUid !== (user?.id || 'anon')) return;
    if (hasTriggeredRef.current) return;

    const pendingPrompt = localStorage.getItem('pending_prompt');
    const urlQuery = new URLSearchParams(window.location.search).get('q');
    const promptToUse = pendingPrompt || urlQuery;

    if (promptToUse) {
      hasTriggeredRef.current = true;
      const isFromUrl = !!urlQuery;

      // Cleanup localStorage and URL
      if (pendingPrompt) localStorage.removeItem('pending_prompt');
      if (urlQuery && typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('q');
        window.history.replaceState({}, '', newUrl.pathname);
      }

      // Submit immediately
      submitMessage(promptToUse, isFromUrl);
    }
  }, [isAuthChecking, isLoaded, loadedUid, user?.id]);

  // Authentication check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
      } catch (err) {
        console.error("Auth session error:", err);
        setUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldUseDark = savedTheme !== "light";

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  // Accent colour: restore the saved choice, and apply it on <html> so portalled
  // menus and dialogs pick it up too. Removed again when leaving the page.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
      if (isAccentId(saved)) setAccent(saved);
    } catch { }
    return () => document.documentElement.removeAttribute('data-accent');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    try { localStorage.setItem(ACCENT_STORAGE_KEY, accent); } catch { }
  }, [accent]);

  // Update dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Load conversations from localStorage
  useEffect(() => {
    if (isAuthChecking) return;
    abortControllerRef.current?.abort();
    const uid = user?.id || 'anon';
    setLoadedUid(null);

    try {
      // Migrate anonymous chats on login
      if (user) {
        const anonRaw = localStorage.getItem('chatgpt_convos_v1_anon');
        if (anonRaw) {
          const anonParsed = JSON.parse(anonRaw) as Conversation[];
          if (anonParsed.length > 0) {
            const userRaw = localStorage.getItem(`chatgpt_convos_v1_${user.id}`);
            const userParsed = userRaw ? (JSON.parse(userRaw) as Conversation[]) : [];
            const existingIds = new Set(userParsed.map(c => c.id));
            const newAnonParsed = anonParsed.filter(c => !existingIds.has(c.id));

            const merged = [...newAnonParsed, ...userParsed];
            localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(merged));
            localStorage.removeItem('chatgpt_convos_v1_anon');
            // Their files and images follow the conversations into the user's context store.
            void moveUserItems('anon', user.id).then(() => setContextVersion((version) => version + 1));

            const anonActiveId = sessionStorage.getItem('tomato_ai_active_id_anon');
            if (anonActiveId) {
              sessionStorage.setItem(`tomato_ai_active_id_${user.id}`, anonActiveId);
              sessionStorage.removeItem('tomato_ai_active_id_anon');
            }
          } else {
            localStorage.removeItem('chatgpt_convos_v1_anon');
          }
        }
      }

      const raw = localStorage.getItem(`chatgpt_convos_v1_${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        setConvos(parsed);

        // Load activeId from sessionStorage (reset on tab close)
        const sessionActiveId = sessionStorage.getItem(`tomato_ai_active_id_${uid}`);
        if (sessionActiveId && parsed.some(c => c.id === sessionActiveId)) {
          setActiveId(sessionActiveId);
          setHasStartedChat(true);
        } else {
          // If no session ID or ID not found, reset to landing state
          setActiveId(null);
          setHasStartedChat(false);
        }
      } else {
        setConvos([]);
        setActiveId(null);
        setHasStartedChat(false);
      }

      // Load custom memory
      const memory = localStorage.getItem(`tomato_ai_custom_memory_${uid}`);
      if (memory) {
        setCustomMemory(memory);
      } else {
        setCustomMemory("");
      }
    } catch {
      setConvos([]);
      setActiveId(null);
      setHasStartedChat(false);
    } finally {
      setLoadedUid(uid);
      setIsLoaded(true);
    }
  }, [user?.id, isAuthChecking]);

  // Persist conversations to localStorage
  useEffect(() => {
    if (isAuthChecking) return;
    const uid = user?.id || 'anon';
    if (loadedUid !== uid) return;

    try {
      localStorage.setItem(`chatgpt_convos_v1_${uid}`, JSON.stringify(convos));
      if (activeId) {
        sessionStorage.setItem(`tomato_ai_active_id_${uid}`, activeId);
      } else {
        sessionStorage.removeItem(`tomato_ai_active_id_${uid}`);
      }
    } catch { }
  }, [convos, user?.id, activeId, loadedUid, isAuthChecking]);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) || null,
    [convos, activeId]
  );

  // Voice: answers can be read aloud (per answer with Listen, or automatically when switched on in the message bar).
  const speech = useReadAloud();
  const [voicePrefs] = useVoicePrefs();
  const wasLoadingRef = useRef(false);
  useEffect(() => {
    if (loading) { if (!wasLoadingRef.current) speech.stop(); }
    else if (wasLoadingRef.current && voicePrefs.speakReplies) {
      const last = active?.messages[active.messages.length - 1];
      if (last && last.role !== "user" && last.content && last.status !== "stopped") speech.speak(last.id, last.content);
    }
    wasLoadingRef.current = loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  const filteredConvos = useMemo(() => convos.filter((conversation) =>
    conversation.title.toLowerCase().includes(conversationSearch.trim().toLowerCase())
  ), [convos, conversationSearch]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeId, active?.messages.length]);

  useEffect(() => {
    if (stickToBottomRef.current && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [streamingText]);

  // Track scroll position to collapse input
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasStartedChat]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);
    sessionStorage.clear();
  };

  function startNewConversation() {
    stopGenerating();
    setChatError('');
    setActiveId(null);
    setHasStartedChat(false);
    setSidebarOpen(false);
    setInput("");
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      if (newUrl.searchParams.has('q')) {
        newUrl.searchParams.delete('q');
        window.history.replaceState({}, '', newUrl.pathname);
      }
    }
  }

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
    setSidebarOpen(false);
    if (!hasStartedChat) setHasStartedChat(true);
    return convo;
  }

  async function runCompletion(convoId: string, payload: ChatPayload) {
    if (requestActiveRef.current) return;
    requestActiveRef.current = true;
    setLoading(true);
    setChatError('');
    setStreamingConversationId(convoId);
    setStreamingText('');
    lastFailedRequestRef.current = null;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const assistantId = uid();
    let fullText = '';
    let lastPaint = 0;
    let status: Message['status'];
    let meta: Message['meta'];

    try {
      const response = await authFetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.code === 'quota') {
          setQuotaInfo(body as QuotaInfo);
          setQuota((current) => ({ ...current, remaining: 0 }));
          throw new QuotaStop(body.error);
        }
        throw new Error(body.error || 'The AI service is unavailable. Please try again.');
      }
      const quotaLeft = response.headers.get('X-Quota-Remaining');
      if (quotaLeft !== null && Number.isFinite(Number(quotaLeft))) setQuota((current) => ({ ...current, remaining: Number(quotaLeft) }));
      if (!response.body) throw new Error('The response could not be streamed. Please try again.');
      const modelUsed = response.headers.get('X-Model-Used');
      const task = response.headers.get('X-Task-Type');
      if (modelUsed) meta = { model: modelUsed, task: isTaskType(task) ? task : undefined };
      // The model the user picked could not handle this request (or was unavailable).
      if (modelUsed && response.headers.get('X-Model-Switched')) toast.info(`Switched to ${getModelLabel(modelUsed)}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        if (Date.now() - lastPaint > 60) {
          setStreamingText(fullText);
          lastPaint = Date.now();
        }
      }
      fullText += decoder.decode();
      if (!fullText.trim()) throw new Error('The AI returned an empty response. Please try again.');
    } catch (error) {
      if (error instanceof QuotaStop) {
        // The limit dialog is already showing. Keep the request so "Retry" works after upgrading or earning credits.
        setChatError(error.message);
        lastFailedRequestRef.current = { convoId, payload };
      } else if (controller.signal.aborted) {
        status = 'stopped';
      } else {
        status = 'interrupted';
        setChatError(error instanceof Error ? error.message : 'The response was interrupted. Please try again.');
        lastFailedRequestRef.current = { convoId, payload, partialId: fullText.trim() ? assistantId : undefined };
      }
    } finally {
      if (fullText.trim()) {
        const assistant: Message = { id: assistantId, role: 'assistant', content: fullText, createdAt: Date.now(), status, meta };
        setConvos((previous) => previous.map((conversation) => conversation.id === convoId
          ? { ...conversation, messages: [...conversation.messages, assistant], updatedAt: Date.now() }
          : conversation));
      }
      setStreamingText('');
      setStreamingConversationId(null);
      setLoading(false);
      abortControllerRef.current = null;
      requestActiveRef.current = false;
    }
  }

  /** "Generate an image of ...": asks the image model and shows the picture in the conversation. */
  async function runImageGeneration(convoId: string, request: { prompt: string; aspectRatio: string }, ownerId: string) {
    if (requestActiveRef.current) return;
    requestActiveRef.current = true;
    setLoading(true);
    setMakingImage(true);
    setChatError('');
    setStreamingConversationId(convoId);
    setStreamingText('');
    lastFailedRequestRef.current = null;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let assistant: Message | null = null;

    try {
      const response = await authFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.code === 'quota') {
          setQuotaInfo(body as QuotaInfo);
          setQuota((current) => ({ ...current, remaining: 0 }));
          throw new QuotaStop(body.error);
        }
        if (response.status === 401) {
          setShowLoginPopup(true);
          throw new Error('Sign in to create images.');
        }
        throw new Error(body.error || 'Image generation is unavailable. Please try again.');
      }
      const quotaLeft = response.headers.get('X-Quota-Remaining');
      if (quotaLeft !== null && Number.isFinite(Number(quotaLeft))) setQuota((current) => ({ ...current, remaining: Number(quotaLeft) }));

      const data = await response.json();
      if (typeof data?.imageBase64 !== 'string' || typeof data?.mimeType !== 'string') throw new Error('The image service returned no picture. Please try again.');
      const bytes = Uint8Array.from(atob(data.imageBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: data.mimeType });
      const size = await new Promise<{ width: number; height: number }>((resolve) => {
        const probe = new window.Image();
        const url = URL.createObjectURL(blob);
        probe.onload = () => { resolve({ width: probe.naturalWidth || 1024, height: probe.naturalHeight || 1024 }); URL.revokeObjectURL(url); };
        probe.onerror = () => { resolve({ width: 1024, height: 1024 }); URL.revokeObjectURL(url); };
        probe.src = url;
      });

      // Keep the picture in the conversation's store (with its prompt as the description, so follow-up questions have context).
      const itemId = `gen_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      const name = request.prompt.slice(0, 60);
      await putItems([{
        id: itemId, uid: ownerId, convoId, name, mime: data.mimeType, size: blob.size, createdAt: Date.now(),
        kind: 'image', blob, width: size.width, height: size.height, description: `Image generated from the request: ${request.prompt}`, source: 'generated',
      }]);
      setContextVersion((version) => version + 1);
      assistant = {
        id: uid(), role: 'assistant', createdAt: Date.now(),
        content: 'Here is your image. To change it, describe the new version in full (for example "a red tomato on a wooden table, at night") and I will create another one.',
        attachments: [{ id: itemId, kind: 'image', name, mime: data.mimeType, size: blob.size }],
        meta: typeof data.model === 'string' ? { model: data.model } : undefined,
      };
    } catch (error) {
      if (error instanceof QuotaStop) {
        setChatError(error.message);
        lastFailedRequestRef.current = { convoId, imagePrompt: request };
      } else if (!controller.signal.aborted) {
        setChatError(error instanceof Error ? error.message : 'Image generation failed. Please try again.');
        lastFailedRequestRef.current = { convoId, imagePrompt: request };
      }
    } finally {
      if (assistant) {
        const message = assistant;
        setConvos((previous) => previous.map((conversation) => conversation.id === convoId
          ? { ...conversation, messages: [...conversation.messages, message], updatedAt: Date.now() }
          : conversation));
      }
      setStreamingText('');
      setStreamingConversationId(null);
      setLoading(false);
      setMakingImage(false);
      abortControllerRef.current = null;
      requestActiveRef.current = false;
    }
  }

  async function submitMessage(rawText: string, forceNewChat = false) {
    const files = attach.ready;
    // Files with no question: ask for a summary / description.
    const text = rawText.trim() || defaultPromptFor(files.map((file) => ({ kind: file.kind })));
    if (!text || requestActiveRef.current || attach.busy) return;

    if (!user) {
      const totalAnonMessages = convos.reduce((acc, c) => acc + c.messages.filter(m => m.role === 'user').length, 0);
      if (totalAnonMessages >= 1) {
        localStorage.setItem('pending_prompt', text);
        setShowLoginPopup(true);
        return;
      }
    }

    requestActiveRef.current = true;
    setChatError('');
    setInput("");
    if (!hasStartedChat) setHasStartedChat(true);

    let convo = forceNewChat ? null : active;
    if (!convo) convo = createNewChat();
    const ownerId = user?.id || 'anon';

    try {
      // 1. Save what the user attached into their context store.
      const saved = files.length
        ? await commitAttachments(ownerId, convo.id, files.map((file) => file.processed!))
        : { attachments: [] as MessageAttachment[], newItemIds: new Set<string>() };

      const userMsg: Message = {
        id: uid(), role: "user", content: text, createdAt: Date.now(),
        attachments: saved.attachments.length ? saved.attachments : undefined,
      };
      const conversationId = convo.id;
      const title = files.length && !rawText.trim() ? files[0].name : text;
      setConvos(prev => prev.map(c =>
        c.id === conversationId
          ? {
            ...c,
            title: c.messages.length === 0 ? formatTitleFromPrompt(title) : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: Date.now(),
          }
          : c
      ));
      attach.clear();

      // 2. Rebuild the context for this request from the store. It does not
      //    depend on which model answers, so any model can pick up the chat.
      const recent = convo.messages.slice(-20);
      const history: ChatTurn[] = recent
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.image ? stripLegacyImage(message.content) : message.content,
        }));
      const legacyImages: LegacyImage[] = recent
        .filter((message) => message.image)
        .map((message) => ({ id: message.id, name: message.image!.name, url: message.image!.url }));
      const previousQuestion = [...recent].reverse().find((message) => message.role === 'user')?.content ?? '';

      const context = await buildChatContext({
        uid: ownerId,
        convoId: conversationId,
        query: `${previousQuestion}\n${text}`,
        question: text,
        memory: customMemory,
        newItemIds: saved.newItemIds,
        legacyImages,
      });

      requestActiveRef.current = false;

      // A request to create a picture goes to the image model instead of the chat models.
      const imageRequest = files.length === 0 ? detectImageRequest(text) : null;
      if (imageRequest) {
        await runImageGeneration(conversationId, imageRequest, ownerId);
        return;
      }

      await runCompletion(conversationId, {
        messages: [...history, { role: 'user', content: text }],
        model: selectedModel,
        temperature: 0.6,
        context,
      });

      // 3. Once answered, describe any new images in words so text-only models can use them later.
      void ensureImageDescriptions(ownerId, conversationId);
    } catch (error) {
      requestActiveRef.current = false;
      toast.error(error instanceof Error ? error.message : 'Could not send your message. Please try again.');
    }
  }

  async function sendText(text: string) {
    submitMessage(text.trim());
  }

  function retryLastResponse() {
    const request = lastFailedRequestRef.current;
    if (request && request.convoId === activeId && !requestActiveRef.current) {
      if (request.partialId) setConvos((previous) => previous.map((conversation) => conversation.id === request.convoId
        ? { ...conversation, messages: conversation.messages.filter((message) => message.id !== request.partialId) }
        : conversation));
      if (request.imagePrompt) void runImageGeneration(request.convoId, request.imagePrompt, user?.id || 'anon');
      else if (request.payload) void runCompletion(request.convoId, request.payload);
    }
  }


  function deleteConvo(id: string) {
    if (activeId === id) stopGenerating();
    // Remove the conversation's documents and images from the context store too.
    void deleteConversationItems(user?.id || 'anon', id);
    setConvos((prevConvos) => {
      const updatedConvos = prevConvos.filter((c) => c.id !== id);

      if (user) {
        if (updatedConvos.length === 0) {
          localStorage.removeItem(`chatgpt_convos_v1_${user.id}`);
        } else {
          localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(updatedConvos));
        }
      }

      if (activeId === id) {
        setActiveId(updatedConvos.length > 0 ? updatedConvos[0].id : null);
        setHasStartedChat(updatedConvos.length > 0);
      }

      return updatedConvos;
    });
  }

  function clearAll() {
    stopGenerating();
    setChatError('');
    setSidebarOpen(false);
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);
    void deleteUserItems(user?.id || 'anon');

    if (user) {
      localStorage.removeItem(`chatgpt_convos_v1_${user.id}`);
    }
    router.push('/tomato-ai');
  }

  if (isAuthChecking) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-[#0b0b0d] text-white"
      >
        {/* `isAuthChecking` starts true, so this is what the server renders
            and what a crawler sees. It therefore carries the page's heading
            and a real description of the product rather than just a spinner. */}
        <div className="flex flex-col items-center gap-4 max-w-xl px-6 text-center">
          <Image src="/logo.png" alt="TomatoAI" width={64} height={64} className="animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            TomatoAI Chat
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            A free AI assistant for questions, brainstorming, writing and code. Switch between leading
            open-source and commercial language models, upload a PDF or image to ask about it, and keep your
            conversation history in one place.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Because different models are good at different things, TomatoAI Chat lets you change model mid-conversation
            rather than committing up front: a fast model for quick questions, a stronger reasoning model when a problem
            needs working through, and a code-focused model for debugging. Custom instructions carry your context across
            every conversation, so you are not restating who you are and what you are working on each time.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Attach a PDF, document or screenshot and ask questions about it directly. Responses stream as they are
            generated, code blocks are syntax-highlighted and one click from being copied, and your history stays
            available so earlier answers remain easy to find.
          </p>
          <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const showWelcome = !forceChatView && (!hasStartedChat || (!active && !loading));

  return (
    <div
      className="relative flex h-dvh overflow-clip bg-[#faf9f7] font-inter text-zinc-900 antialiased transition-[background-color,color] duration-700 dark:bg-[#0b0b0d] dark:text-zinc-100"
    >
      {/* Accent colour variables (--accent, --accent-soft, …), one block per theme */}
      <style dangerouslySetInnerHTML={{ __html: accentCss() }} />
      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        .model-overlay { opacity: 0; transition: opacity var(--motion-quick) var(--motion-fade); }
        .model-overlay.ReactModal__Overlay--after-open { opacity: 1; }
        .model-overlay.ReactModal__Overlay--before-close { opacity: 0; }
        .model-dialog > div { opacity: 0; transform: translateY(12px) scale(.97); transition: opacity var(--motion-quick) var(--motion-fade), transform var(--motion-quick) var(--motion-settle); }
        .model-dialog.ReactModal__Content--after-open > div { opacity: 1; transform: translateY(0) scale(1); }
        .model-dialog.ReactModal__Content--before-close > div { opacity: 0; transform: translateY(8px) scale(.98); }
        @keyframes welcomeReveal { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .welcome-reveal { animation: welcomeReveal var(--motion-reveal) var(--motion-settle) both; }
        .welcome-reveal-delayed { animation: welcomeReveal var(--motion-reveal) 100ms var(--motion-settle) both; }
        .inline-code {
          background-color: rgba(156, 163, 175, 0.2);
          border: 1px solid rgba(156, 163, 175, 0.3);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
          font-size: 0.875em;
          color: #ef4444;
        }
        
        .dark .inline-code {
          background-color: rgba(75, 85, 99, 0.4);
          border-color: rgba(75, 85, 99, 0.5);
          color: #fbbf24;
        }

        /* Syntax highlighting styles */
        .sh__token--string { color: #22c55e; }
        .sh__token--keyword { color: #8b5cf6; }
        .sh__token--comment { color: #6b7280; font-style: italic; }
        .sh__token--punctuation { color: #64748b; }
        .sh__token--number { color: #f59e0b; }
        .sh__token--function { color: #3b82f6; }
        .sh__token--constant { color: #ef4444; }
        .sh__token--class-name { color: #f59e0b; }
        .sh__token--operator { color: #64748b; }
        .sh__token--boolean { color: #ef4444; }
        .sh__token--property { color: #06b6d4; }
        .sh__token--tag { color: #ef4444; }
        .sh__token--attr-name { color: #f59e0b; }
        .sh__token--attr-value { color: #22c55e; }
        
        .dark .sh__token--string { color: #4ade80; }
        .dark .sh__token--keyword { color: #a78bfa; }
        .dark .sh__token--comment { color: #9ca3af; }
        .dark .sh__token--function { color: #60a5fa; }
        .dark .sh__token--number { color: #fbbf24; }
        .dark .sh__token--constant { color: #f87171; }
        .dark .sh__token--property { color: #22d3ee; }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .message-enter {
          animation: slideInUp var(--motion-reveal) var(--motion-settle);
        }
        
        .sidebar-enter {
          animation: slideInLeft var(--motion-quick) var(--motion-settle);
        }
        
        .input-focused {
          transform: scale(1.02);
        }
        
        .bounce-in {
          animation: scaleIn var(--motion-quick) var(--motion-settle);
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-slow {
          animation: marquee 50s linear infinite;
        }
        .pause {
          animation-play-state: paused !important;
        }

        /* 3D code card shadows */
        .code-card {
          transition: box-shadow var(--motion-quick) var(--motion-fade), transform var(--motion-quick) var(--motion-settle);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.05),
            0 3px 6px rgba(0, 0, 0, 0.08),
            0 10px 20px rgba(0, 0, 0, 0.06);
        }
        .code-card:hover {
          transform: none;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.05),
            0 3px 6px rgba(0, 0, 0, 0.08),
            0 10px 20px rgba(0, 0, 0, 0.06);
        }
        .dark .code-card {
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.35),
            0 6px 10px rgba(0, 0, 0, 0.35),
            0 18px 32px rgba(0, 0, 0, 0.45);
        }
        .dark .code-card:hover {
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.35),
            0 6px 10px rgba(0, 0, 0, 0.35),
            0 18px 32px rgba(0, 0, 0, 0.45);
        }
        .code-card-inner {
          background-image: radial-gradient(ellipse at top, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%);
        }
        .dark .code-card-inner {
          background-image: radial-gradient(ellipse at top, rgba(255,255,255,0.06), rgba(255,255,255,0) 60%);
        }
      `}</style>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />

      {/* Memory Modal */}
      <Modal
        isOpen={showMemoryModal}
        onRequestClose={() => setShowMemoryModal(false)}
        className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
        overlayClassName="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm z-[9998] transition-all duration-300"
      >
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Custom Instructions</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Add rules and preferences that TomatoAI will remember across all chats.
            </p>
          </div>

          <textarea
            value={customMemory}
            onChange={(e) => setCustomMemory(e.target.value)}
            className="w-full h-36 p-4 rounded-xl bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 resize-none outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400/20 dark:focus:ring-zinc-600/20 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all text-sm leading-relaxed"
            placeholder="For example: Always write code in Python. Keep answers concise. Speak in a friendly tone."
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowMemoryModal(false)}
              className="px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const uid = user?.id || 'anon';
                localStorage.setItem(`tomato_ai_custom_memory_${uid}`, customMemory);
                setShowMemoryModal(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-all shadow-sm"
            >
              Save instructions
            </button>
          </div>
        </div>
      </Modal>

      {/* Model Selection Modal */}
      <QuotaModal info={quotaInfo} onClose={() => setQuotaInfo(null)} />

      <ModelSelectionModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={selectedModel}
        onSelectModel={selectModel}
      />


      {/* Conversation drawer */}
        <div className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${sidebarOpen ? 'visible' : 'invisible'}`} aria-hidden={!sidebarOpen}>
          <div
            className={`chat-drawer-backdrop absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <aside role="dialog" aria-modal={sidebarOpen} aria-label="Conversations" className={`chat-drawer absolute bottom-0 left-0 top-0 w-[min(88vw,350px)] border-r border-zinc-200 bg-[#fcfbfa] shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#171719] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex h-full flex-col overflow-hidden">
              <div className="border-b border-zinc-200/80 p-5 dark:border-white/10">
                <div className="mb-6 flex items-center justify-between">
                  <Link href="/" onClick={() => setSidebarOpen(false)} className="flex min-w-0 items-center gap-3">
                    <Image src="/logo.png" alt="" width={32} height={32} className="rounded-xl" />
                    <div>
                      {/* Sidebar brand label, not the page heading — the page's
                          single <h1> lives in the chat's empty state below. */}
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-white">TomatoAI</span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">Your workspace</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    ref={sidebarCloseRef}
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close conversations"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={startNewConversation}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] active:scale-[.98]"
                >
                  <Plus className="h-4 w-4" /> New chat
                </button>

                <button
                  onClick={() => { setSidebarOpen(false); setShowMemoryModal(true); }}
                  className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="h-4 w-4" /> Personal instructions
                  </div>
                </button>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Search chats" aria-label="Search conversations" className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--accent-line)] dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  {conversationSearch && <button type="button" onClick={() => setConversationSearch('')} aria-label="Clear chat search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-4 w-4" /></button>}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                {filteredConvos.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5">
                      <MessageSquareText className="h-5 w-5 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{convos.length ? 'No matching chats' : 'No conversations yet'}</h3>
                    <p className="text-sm">{convos.length ? 'No chats match your search.' : 'Start your first conversation with TomatoAI.'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h3 className="mb-3 px-3 text-xs font-medium uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400">
                      Recent chats
                    </h3>
                    {filteredConvos.map((c) => (
                      <div key={c.id} className="group relative">
                        <button
                          onClick={() => {
                            setActiveId(c.id);
                            setHasStartedChat(true);
                            setSidebarOpen(false);
                            setChatError('');
                          }}
                          className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${activeId === c.id
                            ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="truncate pr-8 text-sm font-medium mb-1">
                                {c.title}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-['Inter','system-ui','-apple-system','sans-serif']">
                                <span>{c.messages.length} messages</span>
                                <span>•</span>
                                <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                        <button
                          aria-label={`Delete ${c.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConvo(c.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:opacity-100 dark:hover:bg-red-900/20 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                        >
                          <svg className="w-4 h-4 text-red-400 hover:text-red-600 dark:hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200/80 p-4 dark:border-white/10">
                  <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[.14em] text-zinc-500">Explore</p>
                  <nav aria-label="Explore TomatoAI" className="grid grid-cols-2 gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                    <Link href="/ai-tools" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5">AI tools</Link>
                    <Link href="/prompts" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5">Prompts</Link>
                    <Link href="/ai-workflows" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5">Workflows</Link>
                    <Link href="/ai-videos" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5">Videos</Link>
                  </nav>
                  {convos.length > 0 && <button
                    onClick={clearAll}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear all chats
                  </button>}
                </div>
            </div>
          </aside>
        </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 min-h-0 flex flex-col relative overflow-clip">
        <div aria-hidden="true" className={`welcome-artwork pointer-events-none absolute inset-0 transition-opacity duration-700 ${showWelcome && !isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
          {/* Compact WebP, resized to the screen by next/image. Only the artwork for the current theme is fetched with priority. */}
          <Image src="/art/chatbot-light.webp" alt="" fill sizes="100vw" quality={70} priority={!isDarkMode} className="object-cover object-center" />
        </div>
        <div aria-hidden="true" className={`welcome-artwork pointer-events-none absolute inset-0 transition-opacity duration-700 ${showWelcome && isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
          <Image src="/art/chatbot-dark.webp" alt="" fill sizes="100vw" quality={70} priority={isDarkMode} className="object-cover object-center" />
        </div>
        {/* Transparent Navbar — inline, scrolls with content, takes no fixed space */}
        <header ref={headerRef} className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-700 sm:px-8 ${showWelcome ? "bg-transparent" : "bg-[#faf9f7]/92 backdrop-blur-md dark:bg-[#0b0b0d]/92"}`}>
          <div className="flex min-w-0 items-center gap-3">
          <button
            ref={menuButtonRef}
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Open conversations"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Image src="/logo.png" alt="" width={30} height={30} className="h-7 w-7 shrink-0 object-contain" />
            <span className="truncate text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-700 dark:text-zinc-100 sm:text-base">TomatoAI</span>
          </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelModal(true)}
              className="hidden rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sm:block"
              title="Select AI Model"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            {user && quota.remaining !== null && (
              <Link
                href="/account"
                title="Messages left today (resets at midnight IST). Click for your account."
                className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:flex ${quota.remaining === 0 ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400' : quota.remaining <= 3 ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-zinc-300/70 text-zinc-700 hover:bg-black/5 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10'}`}
              >
                <Zap className="h-3.5 w-3.5" /> {quota.remaining} left
                {quota.streak ? <span className="ml-1 flex items-center gap-0.5 border-l border-current/20 pl-2"><Flame className="h-3.5 w-3.5" />{quota.streak}</span> : null}
              </Link>
            )}
            <ThemePicker value={accent} onChange={setAccent} />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors duration-500 ease-[ease-in-out] hover:bg-black/10 dark:text-zinc-100 dark:hover:bg-white/10"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun aria-hidden="true" className={`absolute h-5 w-5 transition-[opacity,rotate,scale] duration-500 ease-[ease-in-out] ${isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-75 opacity-0'}`} />
              <Moon aria-hidden="true" className={`absolute h-5 w-5 transition-[opacity,rotate,scale] duration-500 ease-[ease-in-out] ${isDarkMode ? '-rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/20 dark:hover:bg-gray-700/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginPopup(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900/70 dark:bg-gray-700/70 hover:bg-gray-800/80 dark:hover:bg-gray-600/80 rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </header>

        <div ref={listRef} className="absolute inset-0 z-0 w-full overflow-y-auto chat-scroll-hidden" style={{ paddingTop: chrome.top, paddingBottom: chrome.bottom }}>
          {showWelcome ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-5 pb-20 text-center md:pb-0">
              <div className="max-w-2xl -translate-y-8 md:-translate-y-12">
                <div className="welcome-reveal mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#19191b]/80">
                  <Image src="/logo.png" alt="" width={30} height={30} className="h-7 w-7 object-contain" />
                </div>
                <h1 className="welcome-reveal text-3xl font-medium tracking-[-0.04em] text-zinc-900 transition-colors duration-700 dark:text-zinc-50 sm:text-4xl">
                  {user?.user_metadata?.full_name ? `Hey ${String(user.user_metadata.full_name).split(' ')[0]},` : 'Hey there,'} how can I help?
                </h1>
                <p className="welcome-reveal-delayed mt-3 text-base text-zinc-800 transition-colors duration-700 dark:text-zinc-300">
                  Ask a question, explore an idea, or work through something together.
                </p>
                <div className="welcome-reveal-delayed mt-9 flex flex-wrap justify-center gap-2">
                  {[
                    { label: 'Brainstorm an idea', prompt: 'Help me brainstorm an idea for ' },
                    { label: 'Write something', prompt: 'Help me write ' },
                    { label: 'Explain a concept', prompt: 'Explain this concept to me: ' },
                  ].map((suggestion) => (
                    <button key={suggestion.label} type="button" onClick={() => { setInput(suggestion.prompt); textareaRef.current?.focus(); }} className="rounded-full border border-zinc-900/10 bg-white/70 px-4 py-2 text-sm text-zinc-800 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-black/30 dark:text-zinc-200 dark:hover:bg-black/50">
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-7 px-5 py-6 pb-8 md:py-10">
              {active?.messages.map((m) => (
                <div
                  key={m.id}
                  className="space-y-4"
                >
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[90%] rounded-3xl bg-[var(--accent)] px-5 py-3 text-white md:max-w-[85%]">
                        {m.image && <img src={m.image.url} alt={m.image.name} loading="lazy" className="mb-3 max-h-72 max-w-full rounded-lg object-contain" />}
                        {m.attachments?.map((file) => file.kind === 'image'
                          ? <StoredImage key={file.id} uid={user?.id || 'anon'} id={file.id} name={file.name} version={contextVersion} />
                          : (
                            <div key={file.id} className="mb-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm">
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="min-w-0 truncate">{file.name}</span>
                              {file.scanned && <span className="shrink-0 text-xs opacity-80">scanned</span>}
                            </div>
                          ))}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-['Inter','system-ui','-apple-system','sans-serif'] font-normal">
                          {m.image ? m.content.replace(/^!\[[^\]]*\]\([^)]*\)\s*/, '') : m.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <div className="overflow-x-auto">
                        <div className="max-w-full">
                          {m.attachments?.map((file) => file.kind === 'image'
                            ? <StoredImage key={file.id} uid={user?.id || 'anon'} id={file.id} name={file.name} version={contextVersion} variant="plain" />
                            : null)}
                          <MarkdownRenderer content={m.content} />
                          {m.status === 'stopped' && <span className="mt-2 block text-xs text-slate-500">Stopped</span>}
                          {m.status === 'interrupted' && <span className="mt-2 block text-xs text-amber-600">Response interrupted</span>}
                          {m.content && <MessageActions id={m.id} text={m.content} speech={speech} />}
                          {m.meta && (
                            <span className="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">
                              {getModelLabel(m.meta.model)}{m.meta.task ? ` · ${TASK_LABELS[m.meta.task]}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && streamingConversationId === activeId && (
                <div className="space-y-3" aria-live="polite">
                  <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-full" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-['Inter','system-ui','-apple-system','sans-serif']">TomatoAI</span>
                  </div>
                  {streamingText ? <div className="ml-0 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800 dark:text-slate-100 md:ml-11">{streamingText}</div> : <div className="ml-11 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-['Inter','system-ui','-apple-system','sans-serif']">{makingImage ? 'Creating your image...' : 'Thinking...'}</span>
                  </div>}
                </div>
              )}
              {chatError && lastFailedRequestRef.current?.convoId === activeId && (
                <div role="alert" className="ml-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100 md:ml-11">
                  <p>{chatError}</p>
                  <button type="button" onClick={retryLastResponse} className="mt-2 font-semibold underline underline-offset-2">Retry response</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={composerRef} className={`absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 transition-colors duration-700 max-md:fixed max-md:backdrop-blur-lg md:px-5 md:pb-4 ${showWelcome ? "max-md:bg-transparent" : "max-md:bg-[#faf9f7]/95 max-md:dark:bg-[#0b0b0d]/95 md:bg-gradient-to-t md:from-[#faf9f7] md:via-[#faf9f7]/90 md:to-transparent md:pt-10 md:dark:from-[#0b0b0d] md:dark:via-[#0b0b0d]/90"}`}>
          <TomatoComposer
            value={input}
            onChange={setInput}
            onSend={(text, { search }) => {
              // Web search only makes sense with a question and no files.
              if (search && text && attach.items.length === 0) {
                router.push(`/search?q=${encodeURIComponent(text)}`);
              } else {
                sendText(text);
              }
            }}
            onStop={stopGenerating}
            submitting={loading}
            busy={attach.busy}
            attachments={attach.items}
            onFilesSelected={attach.addFiles}
            onRemoveAttachment={attach.remove}
            models={COMPOSER_MODELS}
            selectedModel={selectedModel}
            onModelChange={selectModel}
            lightningActive={selectedModel === LIGHTNING_MODEL}
            onLightningToggle={toggleLightning}
            textareaRef={textareaRef}
            quickActions={showWelcome}
            footnote="TomatoAI can make mistakes. Check important information."
          />
        </div>
      </main>
    </div>
  );
}

export default function ChatGPTPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  );
}
