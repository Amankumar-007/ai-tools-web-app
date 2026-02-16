"use client";

import React, { MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Feature {
  title: string;
  bgColor: string;
  imageSrc: string;
  link: string;
}

const features: Feature[] = [
  {
    title: "summarization",
    bgColor: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
    imageSrc: "/feature1.png",
    link: "/summarization",
  },
  {
    title: "n8n templates",
    bgColor: "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600",
    imageSrc: "/feature2.png",
    link: "/n8n-templates",
  },
  {
    title: "Content Generator",
    bgColor: "bg-gradient-to-r from-purple-600 via-violet-700 to-indigo-800",
    imageSrc: "/feature3.png",
    link: "/outlier",
  },
  {
    title: "Score And Fix Your Resume",
    bgColor: "bg-gradient-to-r from-green-400 via-teal-500 to-cyan-600",
    imageSrc: "/feature-4.png",
    link: "/resume-analyzer",
  },
  {
    title: "Resume Builder",
    bgColor: "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700",
    imageSrc: "/feature5.png",
    link: "https://resume-by-tomatotool.vercel.app/",
  },
  {
    title: "Optimize prompt",
    bgColor: "bg-gradient-to-r from-red-600 via-pink-600 to-purple-700",
    imageSrc: "/feature6.png",
    link: "/prompt-generator",
  },
];

const FeatureCard = ({
  title,
  imageSrc,
  link,
  bgColor,
  index,
}: Feature & { index: number }) => {
  const router = useRouter();

  const navigateWithTransition = (href: string) => {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
      return;
    }
    e.preventDefault();
    navigateWithTransition(link);
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>, link: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigateWithTransition(link);
    }
  };

  const transitionName = `tool-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{
        scale: 1.02,
        translateY: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`${bgColor} relative rounded-[2rem] shadow-xl cursor-pointer group min-h-[180px] h-full overflow-hidden border border-white/10`}
      style={{
        viewTransitionName: transitionName
      } as any}
    >
      <div className="block h-full w-full">
        {/* Background Image layer */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 ease-out"
            priority={index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-7 flex flex-col justify-between h-full">
          <h4 className="text-white font-bold text-xl sm:text-2xl tracking-tight drop-shadow-lg leading-tight">
            {title}
          </h4>
          <button
            onClick={(e) => handleButtonClick(e, link)}
            className="mt-4 text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 w-fit"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function FeatureList() {
  return (
    <section className="w-full px-4 sm:px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Explore <span className="text-blue-600">AI Tools</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
