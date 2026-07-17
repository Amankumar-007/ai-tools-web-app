"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FlipLink from "@/components/ui/text-effect-flipper";
import { motion } from "framer-motion";
import WrapButton from "@/components/ui/wrap-button";
import { Globe } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import AiInput from '@/components/ui/ai-input';
import Categories from "@/components/Categories";
import { getCurrentUser, signOut } from "@/lib/supabase";
import Image from "next/image";
import { Particles } from "@/components/ui/particles";
import { useTheme } from "next-themes";
import MainNavbar from "@/components/MainNavbar";
import AnimatedAiInput from "@/components/ui/animated-ai-input";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import JsonLd, { faqPageStructuredData } from "@/components/JsonLd";
import { FAQS } from "@/components/FAQSection";

// Dynamic imports for below-the-fold components. SSR is left on (the
// default) for all of these so their real text content renders into the
// initial HTML for crawlers/answer engines instead of appearing only after
// client-side hydration.
const AIToolsGrid = dynamic(() => import('../components/AIToolsGrid'));
const ToolMarquee = dynamic(() => import('@/components/ToolMarquee'));
const WorkflowSection = dynamic(() => import('@/components/WorkflowSection'));
const TestimonialSection = dynamic(() => import('@/components/clean-testimonial').then(mod => mod.TestimonialSection));
const AgentManager = dynamic(() => import('@/components/AgentManager'));
const VeniceSection = dynamic(() => import('@/components/VeniceSection'));
const FAQSection = dynamic(() => import('@/components/FAQSection'));
const Footer = dynamic(() => import('@/components/footer'));

// Define types for user and video
interface User {
  subscription_tier?: string;
}

interface Video {
  title: string;
  description: string;
  url: string;
  thumbnail: string | null;
}

// Responsive text component that uses FlipLink on desktop and professional text on mobile
const ResponsiveText: React.FC<{ children: string; href?: string; className?: string }> = ({
  children,
  href = "",
  className = ""
}) => {
  return (
    <>
      {/* Mobile view - shown via CSS */}
      <motion.a
        href={href}
        target="_blank"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative
          inline-block
          text-4xl
          font-bold
          uppercase
          tracking-tight
          px-2
          py-1
          transition-all duration-300 ease-out
          group
          hover:text-blue-600
          dark:hover:text-blue-400
          sm:hidden
          ${className}
        `}
        style={{
          lineHeight: 1.1,
          WebkitTapHighlightColor: 'transparent',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
      </motion.a>

      {/* Desktop view - shown via CSS */}
      <div className="hidden sm:block">
        <FlipLink href={href} className={className}>{children}</FlipLink>
      </div>
    </>
  );
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { theme } = useTheme()
  const [, setColor] = useState("#ffffff")

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000")
  }, [theme])


  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    href: string
  ) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      router.push(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  // Update the sectionVariants object
  const sectionVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] // Using a cubic-bezier easing
      }
    }
  } as const;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <JsonLd
        data={faqPageStructuredData(
          FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))
        )}
      />
      {/* Mobile Background Image */}
      <div className="fixed inset-0 -z-10 md:hidden">
        <Image
          src="/bg-mobile.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={80}
          style={{
            zIndex: -10,
          }}
        />
      </div>
      {/* Fixed background images for light/dark modes */}

      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "url('/generated-image (1).png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Navbar */}
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-26">
        <BackgroundBeamsWithCollision className="h-full w-full bg-transparent dark:bg-transparent flex flex-col items-center justify-center border-none">
          {/* Static Concentric Rings */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            {/* Subtle rings */}
            <div className="absolute w-[650px] h-[650px] rounded-full border border-black/[0.04] dark:border-white/[0.04]" />
            <div className="absolute w-[950px] h-[950px] rounded-full border border-black/[0.04] dark:border-white/[0.04]" />
            <div className="absolute w-[1250px] h-[1250px] rounded-full border border-black/[0.04] dark:border-white/[0.04]" />
            <div className="absolute w-[1550px] h-[1550px] rounded-full border border-black/[0.04] dark:border-white/[0.04]" />

            {/* ── LEFT SIDE – 5 AI models, spread top-to-bottom further out ── */}
            {/* Top-left (ChatGPT) */}
            <div className="absolute"
              style={{ left: 'calc(50% - 580px)', top: 'calc(50% - 200px)' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="ChatGPT" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Mid-upper-left (Gemini) */}
            <div className="absolute"
              style={{ left: 'calc(50% - 490px)', top: 'calc(50% - 70px)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/gemini-color.svg" alt="Gemini" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Center-left (Claude - widest point) */}
            <div className="absolute"
              style={{ left: 'calc(50% - 630px)', top: 'calc(50% + 40px)' }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-3">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude-color.svg" alt="Claude" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Lower-left (Mistral) */}
            <div className="absolute"
              style={{ left: 'calc(50% - 490px)', top: 'calc(50% + 150px)' }}>
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2.5" style={{ width: '52px', height: '52px' }}>
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/mistral-color.svg" alt="Mistral" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Bottom-left (HuggingFace) */}
            <div className="absolute"
              style={{ left: 'calc(50% - 390px)', top: 'calc(50% + 250px)' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2.5">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/huggingface-color.svg" alt="Hugging Face" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* ── RIGHT SIDE – 5 AI models, spread top-to-bottom further out ── */}
            {/* Top-right (DeepSeek) */}
            <div className="absolute"
              style={{ left: 'calc(50% + 520px)', top: 'calc(50% - 200px)' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2.5">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/deepseek-color.svg" alt="DeepSeek" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Mid-upper-right (Grok) */}
            <div className="absolute"
              style={{ left: 'calc(50% + 430px)', top: 'calc(50% - 70px)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/grok.svg" alt="Grok" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Center-right (Meta Llama - widest point) */}
            <div className="absolute"
              style={{ left: 'calc(50% + 570px)', top: 'calc(50% + 40px)' }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-3">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/meta-color.svg" alt="Meta Llama" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Lower-right (Cohere) */}
            <div className="absolute"
              style={{ left: 'calc(50% + 430px)', top: 'calc(50% + 150px)' }}>
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2" style={{ width: '52px', height: '52px' }}>
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/cohere-color.svg" alt="Cohere" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Bottom-right (Perplexity) */}
            <div className="absolute"
              style={{ left: 'calc(50% + 330px)', top: 'calc(50% + 250px)' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 p-2.5">
                <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/perplexity-color.svg" alt="Perplexity" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 animate-hero opacity-0"
            >
              <span className="bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-transparent dark:from-white dark:to-slate-900/10">
                Fresh AI Tools
              </span>
            </h1>
            <WrapButton className="mt-5" href="/ai-tools" onClick={(e) => handleProtectedLink(e, "/tomato-ai")}>
              <Globe className="animate-spin" />
              Explore Tools
            </WrapButton>

            <div className="mt-4 flex flex-col items-center">
              <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-black dark:fill-white">
                <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z" />
                <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z" />
                <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.6023 35.3581 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z" />
                <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z" />
                <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Curated collection of the most powerful AI tools for every need</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative w-full max-w-3xl mx-auto z-0"
            >
              {/* Glowing shadow background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[60%] bg-gradient-to-r from-blue-500/25 to-indigo-500/30 dark:from-blue-500/35 dark:to-indigo-500/40 rounded-full blur-[65px] pointer-events-none -z-10 animate-pulse-slow" />

              <div className="w-full max-w-2xl mx-auto my-8 md:hidden">
                <AiInput />
              </div>
              <div className="w-full hidden md:flex justify-center py-8">
                <AnimatedAiInput />
              </div>
            </motion.div>
          </div>
        </BackgroundBeamsWithCollision>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5">
        <AIToolsGrid />
        <ToolMarquee />
        <div className="flex justify-center">
          <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-black dark:fill-white">
            <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z" />
            <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z" />
            <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.5263 35.263 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z" />
            <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z" />
            <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z" />
          </svg>
        </div>


        <motion.div
          id="categories"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col items-center w-full"
        >
          {user ? (
            <Categories />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">Please log in to view categories.</p>
              <Link href="/login" className="text-purple-600 hover:text-purple-800 dark:hover:text-purple-400">
                Log in
              </Link>
            </div>
          )}
        </motion.div>
        {/* <WorkflowSection /> */}
        <VeniceSection />
        {/* <FeatureStepsDemo /> */}
      </main>


      <main className="container mx-auto px-0 md:px-4 py-2">

        <AgentManager />
        <section className="w-full bg-neutral-50/50 dark:bg-neutral-900/10 py-10 border-y border-neutral-100 dark:border-neutral-800/50">
          <TestimonialSection />
        </section>

        <FAQSection />
        <Footer />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 right-6"
        >
          {/* <Chatbot /> */}

        </motion.div>
      </main>
    </div>
  );
}
