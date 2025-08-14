"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FlipLink from "@/components/ui/text-effect-flipper";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import WrapButton from "@/components/ui/wrap-button";
import { motion } from "framer-motion";
import { Globe, SparklesIcon } from "lucide-react";
import Link from "next/link";
import AIToolsGrid from '../components/AIToolsGrid';
import { TextScroll } from '@/components/ui/text-scroll';
import AiInput from '@/components/ui/ai-input';
import VideoSection from "@/components/videoCardComp";
import Categories from "@/components/Categories";
import Footer from "@/components/footer";
import { getCurrentUser, signOut } from "@/lib/supabase";
import TrendingTools from "@/components/trendingAi";
import { Badge } from "@/components/ui/badge";

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

// Define type for SVG icon component
interface IconProps {
  className?: string;
  fill?: string;
}

// Define Icons object with typed components
const Icons: {
  be: React.FC<IconProps>;
  linkedin: React.FC<IconProps>;
  github: React.FC<IconProps>;
  dribble: React.FC<IconProps>;
} = {
  be: (props: IconProps) => (
    <svg
      width="86"
      height="86"
      viewBox="0 0 86 86"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="86"
        height="86"
        rx="14"
        className="fill-[#D9D9D9] transition-all duration-500 ease-in-out group-hover:fill-accent"
      />
      <path
        fillRule="evenodd"
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        clipRule="evenodd"
        d="M51.9401 33.6773H67.9869V29.082H51.9401V33.6773ZM59.8499 42.9063C56.2703 42.9063 53.5517 45.124 53.2899 49.2217H66.1324C65.2619 44.3585 63.1015 42.9063 59.8499 42.9063ZM60.3514 61.9125C63.6566 61.9125 66.0819 59.8247 66.5771 58.0657H73.5282C71.5412 64.4273 67.4381 68 60.0707 68C50.6691 68 45.3927 61.3132 45.3927 52.4402C45.3927 31.5444 75.5435 30.7953 74.0296 54.3913H53.2899C53.4918 59.1829 55.4692 61.9125 60.3514 61.9125ZM29.0715 60.9932C32.8656 60.9932 35.5212 59.5337 35.5212 55.5956C35.5212 51.5109 33.1747 49.7391 29.2355 49.7391H19.7299V60.9932H29.0715ZM28.5701 43.5962C31.7271 43.5962 33.9064 42.1267 33.9064 38.713C33.9064 35.1169 31.3707 34.0068 27.9046 34.0068H19.7299V43.5962H28.5701ZM29.6834 27C37.1612 27 42.3587 29.4717 42.3587 37.1622C42.3587 40.97 40.8291 43.8078 36.9656 45.7198C41.9109 47.1889 44.251 51.0462 44.251 56.1146C44.251 64.1602 37.8708 68 30.2385 68H11V27H29.6834Z"
      />
    </svg>
  ),
  linkedin: (props: IconProps) => (
    <svg
      width="86"
      height="86"
      viewBox="0 0 86 86"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="86"
        height="86"
        rx="14"
        className="fill-[#D9D9D9] transition-all duration-500 ease-in-out group-hover:fill-accent"
      />
      <path
        fillRule="evenodd"
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        clipRule="evenodd"
        d="M27.7128 69.5277V33.4109H15.7096V69.5276H27.7128V69.5277ZM21.7125 28.4816C25.8969 28.4816 28.5035 25.7059 28.5035 22.2401C28.4244 18.6973 25.8969 16 21.7909 16C17.6843 16.0001 15 18.6974 15 22.2402C15 25.706 17.6052 28.4817 21.6334 28.4817L21.7125 28.4816ZM34.3561 69.5277C34.3561 69.5277 34.5136 36.7996 34.3561 33.411H46.3612V38.6487H46.2815C47.86 36.184 50.7038 32.5629 57.179 32.5629C65.0788 32.5629 71 37.7249 71 48.8186V69.5278H58.9969V50.2063C58.9969 45.3514 57.2601 42.0385 52.915 42.0385C49.5995 42.0385 47.6236 44.2719 46.7559 46.4309C46.4384 47.1993 46.3612 48.2786 46.3612 49.3581V69.5277H34.3561Z"
      />
    </svg>
  ),
  github: (props: IconProps) => (
    <svg
      width="86"
      height="86"
      viewBox="0 0 86 86"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="86"
        height="86"
        className="fill-[#D9D9D9] transition-all duration-500 ease-in-out group-hover:fill-accent"
        rx="14"
      />
      <path
        fillRule="evenodd"
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        clipRule="evenodd"
        d="M43.2908 13C60.0205 13 73.5817 26.9033 73.5817 44.057C73.5817 57.7757 64.9124 69.4135 52.8839 73.524C51.3482 73.8299 50.803 72.86 50.803 72.0331C50.803 71.0093 50.8393 67.6653 50.8393 63.5094C50.8393 60.6136 49.87 58.7236 48.7826 57.7603C55.5283 56.9909 62.6164 54.3645 62.6164 42.4359C62.6164 39.0434 61.4411 36.2749 59.4964 34.1C59.8114 33.3155 60.8504 30.1566 59.1996 25.8795C59.1996 25.8795 56.6612 25.0473 50.8787 29.0639C48.4584 28.3763 45.8655 28.0303 43.2908 28.0182C40.7161 28.0303 38.1262 28.3763 35.709 29.0639C29.9205 25.0473 27.376 25.8795 27.376 25.8795C25.7312 30.1566 26.7702 33.3155 27.0822 34.1C25.1466 36.2749 23.9623 39.0434 23.9623 42.4359C23.9623 54.3342 31.0352 57.0009 37.7628 57.7855C36.8964 58.5609 36.1119 59.9289 35.8393 61.9371C34.1127 62.7308 29.7266 64.1043 27.0246 59.3577C27.0246 59.3577 25.4223 56.3736 22.3811 56.1556C22.3811 56.1556 19.4277 56.1163 22.1751 58.0428C22.1751 58.0428 24.1591 58.997 25.5374 62.5864C25.5374 62.5864 27.3155 68.1295 35.7424 66.2515C35.7575 68.8474 35.7848 71.294 35.7848 72.0331C35.7848 72.854 35.2274 73.8147 33.7159 73.5269C21.6783 69.4225 13 57.7787 13 44.057C13 26.9033 26.5642 13 43.2908 13Z"
      />
    </svg>
  ),
  dribble: (props: IconProps) => (
    <svg
      width="86"
      height="86"
      viewBox="0 0 86 86"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="86"
        height="86"
        rx="14"
        className="fill-[#D9D9D9] transition-all duration-500 ease-in-out group-hover:fill-accent"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M52.1047 42.2865C62.3133 41.0074 72.4417 43.0545 73.4467 43.2779C73.3987 36.0176 70.799 29.3486 66.54 24.1198C65.8858 24.9995 60.75 31.604 49.4248 36.2416C50.399 38.2079 51.2859 40.2494 52.1047 42.2865Z"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M63.4924 20.7563C58.0853 15.9269 50.9711 13 43.1711 13C40.6988 13.0157 38.2901 13.32 35.9932 13.864C36.8385 14.9992 42.4052 22.6116 47.43 31.8546C58.3401 27.761 62.9498 21.5401 63.4924 20.7563Z"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M41.9796 33.7142C36.9075 24.663 31.4202 17.0506 30.6071 15.9311C22.0413 19.9932 15.6135 27.9249 13.6357 37.4563C15.0072 37.4721 27.6402 37.52 41.9796 33.7142Z"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M45.5558 43.4568C45.9517 43.3294 46.3475 43.2027 46.7591 43.0918C45.9989 41.3617 45.16 39.6152 44.2889 37.9166C29.1041 42.4726 14.3467 42.2822 13.0168 42.2665C12.7462 50.3406 15.7668 58.0017 20.8232 63.587C21.5196 62.3959 29.8643 48.5368 45.5558 43.4568Z"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M48.447 48.1811C31.7011 54.0355 25.6763 65.6828 25.1509 66.7673C33.0138 73.2115 45.5122 74.9817 54.9664 70.6862C54.5183 68.0686 52.8033 58.9766 48.6324 48.1195C48.5708 48.1503 48.4935 48.166 48.447 48.1811Z"
      />
      <path
        className="fill-black transition-all duration-500 ease-in-out group-hover:fill-white"
        d="M54.5137 46.6829C58.4083 57.4319 59.9909 66.1739 60.3166 67.9941C66.9885 63.4517 71.7513 56.2809 73.0855 47.9584C72.0612 47.6313 63.854 45.1891 54.5137 46.6829Z"
      />
    </svg>
  ),
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!user) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  const images: string[] = [
    "https://images.pexels.com/photos/30082445/pexels-photo-30082445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.unsplash.com/photo-1692606743169-e1ae2f0a960f?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://assets.lummi.ai/assets/QmQLSBeCFHUwCv7WBpGr7T3P67UXaAw8B2vvmtKimyinrL?auto=format&w=1500",
    "https://assets.lummi.ai/assets/QmXe6v7jBF5L2R7FCio8KQdXwTX2uqzRycUJapyjoXaTqd?auto=format&w=1500",
    "https://assets.lummi.ai/assets/QmNfwUDpehZyLWzE8to7QzgbJ164S6fQy8JyUWemHtmShj?auto=format&w=1500",
    "https://images.unsplash.com/photo-1706049379414-437ec3a54e93?q=80&w=1200&auto=format",
    "https://assets.lummi.ai/assets/Qmb2P6tF2qUaFXnXpnnp2sk9HdVHNYXUv6MtoiSq7jjVhQ?auto=format&w=1500",
    "https://www.youtube.com/watch?v=6P0BpzUpZhc",
  ];

  const video: Video[] = [
    {
      title: "I Tested Every AI That Edits Videos For You",
      description: "Overview of many AI tools that automatically edit videos for you.",
      url: "https://www.youtube.com/watch?v=ZMEFCbokVcY",
      thumbnail: null,
    },
    {
      title: "6 AI Tools for Video Editing that Saved Me HOURS",
      description: "The six ride‑or‑die AI tools that save me hours in every edit...",
      url: "https://www.youtube.com/watch?v=P6pQKw0J1ic",
      thumbnail: null,
    },
    {
      title: "6 AI Video Editing Apps You Won’t Believe Exist in 2025!",
      description: "Only six best AI video editing apps that you need in 2025 to save time...",
      url: "https://www.youtube.com/watch?v=okQtZRBuRGg",
      thumbnail: null,
    },
    {
      title: "This NEW AI Video Editor Saves 100+ Hours! (Best Editing …)",
      description: "AI‑powered editors to cut your editing time in half…",
      url: "https://www.youtube.com/watch?v=RAvlE-G6wSo",
      thumbnail: null,
    },
    {
      title: "Stop Wasting Time - My Favorite AI Tools for 2025",
      description: "Includes some video editing tools as part of AI toolkit for creators...",
      url: "https://www.youtube.com/watch?v=qX3Cn83S-Uw",
      thumbnail: null,
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 relative">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded text-gray-600"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                navOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
        {/* Links */}
        <div
          className={`flex-col md:flex-row md:flex items-center space-x-0 md:space-x-4 absolute md:static top-full left-0 w-full md:w-auto bg-white dark:bg-neutral-900 md:bg-transparent z-20 transition-all duration-300 ${
            navOpen ? "flex" : "hidden"
          } md:flex`}
        >
          <span className="text-2xl font-bold text-purple-600 px-6 py-2 md:p-0">
            QuickAI
          </span>
          <span className="text-sm bg-orange-500 text-white px-2 py-1 rounded mx-6 md:mx-0">
            Beta
          </span>
          <Link
            href="/ai-tools"
            onClick={(e) => handleProtectedLink(e, "/ai-tools")}
            className="text-gray-600 hover:text-black dark:hover:text-white px-6 py-2 md:p-0"
          >
            AI Tools
          </Link>
          <a
            href="#categories"
            className="text-gray-600 hover:text-black dark:hover:text-white px-6 py-2 md:p-0"
          >
            Categories
          </a>
          <a
            href="#trending"
            className="text-gray-600 hover:text-black dark:hover:text-white px-6 py-2 md:p-0"
          >
            Trending
          </a>
          <Link
            href="/resources"
            onClick={(e) => handleProtectedLink(e, "/resources")}
            className="text-gray-600 hover:text-black dark:hover:text-white px-6 py-2 md:p-0"
          >
            Resources
          </Link>
          <Link
            href="/pricing"
            className="text-gray-600 hover:text-black dark:hover:text-white px-6 py-2 md:p-0"
          >
            Pricing
          </Link>
        </div>
        {/* Right side */}
        <div className="flex items-center space-x-2 ml-auto">
          <ThemeToggleButton
            variant="gif"
            url="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWI1ZmNvMGZyemhpN3VsdWp4azYzcWUxcXIzNGF0enp0eW1ybjF0ZyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Fa6uUw8jgJHFVS6x1t/giphy.gif"
          />
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {user.subscription_tier}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-black dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-black dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-gray-600 hover:text-black dark:hover:text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center mt-15">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />
        <motion.h1
          className="text-6xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <FlipLink href="">Discover-the-Best</FlipLink>
          <br />
          <FlipLink href="">AI-Tools</FlipLink>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center"
        >
          <WrapButton className="mt-5" href="/ai-tools" onClick={(e) => handleProtectedLink(e, "/ai-tools")}>
            <Globe className="animate-spin" />
            Explore Tools
          </WrapButton>
          <div className="mt-4 flex flex-col items-center">
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-black dark:fill-white">
              <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z" />
              <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z" />
              <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.5263 35.263 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z" />
              <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z" />
              <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Curated collection of the most powerful AI tools for every need</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 w-full max-w-3xl mx-auto px-4"
        >
          <AiInput />
        </motion.div>
        <AIToolsGrid />
        <TextScroll
          className="font-display text-center text-4xl font-semibold tracking-tighter text-black dark:text-white md:text-7xl md:leading-[5rem]"
          text="Discover AI Tools "
          default_velocity={2}
        />
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-black dark:fill-white">
          <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z" />
          <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z" />
          <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.5263 35.263 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z" />
          <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z" />
          <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z" />
        </svg>
        <VideoSection />
        <motion.div
          id="trending"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {user ? (
            <TrendingTools />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">Please log in to view trending AI tools.</p>
              <Link href="/login" className="text-purple-600 hover:text-purple-800 dark:hover:text-purple-400">
                Log in
              </Link>
            </div>
          )}
        </motion.div>
        <motion.div
          id="categories"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
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
        <motion.h1
          className="text-6xl font-bold mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Badge
            variant="outline"
            className="mb-3 rounded-[14px] border border-black/10 bg-white text-base dark:border-white/5 dark:bg-neutral-800/5 md:left-6"
          >
            <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800" />{" "}
            Hover Over Links
          </Badge>
          <div className="group flex items-center justify-center">
            <Icons.linkedin />
            <FlipLink href="https://www.linkedin.com/in/amankumarweb/">Linkedin</FlipLink>
          </div>
          <div className="group flex items-center justify-center">
            <FlipLink href="https://aman-kumar-dev.netlify.app/">Portfolio</FlipLink>
            <Icons.be />
          </div>
          <div className="group flex items-center justify-center">
            <Icons.github fill="red" />
            <FlipLink href="https://github.com/Amankumar-007">Github</FlipLink>
          </div>
          <div className="group flex items-center justify-center">
            <FlipLink href="https://x.com/AmanCodex">Dribble</FlipLink>
            <Icons.dribble />
          </div>
        </motion.h1>
        <Footer />
      </main>
    </div>
  );
}