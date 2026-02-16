"use client";

import React, { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>, link: string) => {
    e.preventDefault();
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      window.location.href = link;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${bgColor} relative rounded-2xl shadow-xl cursor-pointer group min-h-[170px] h-full overflow-hidden`}
    >
      <Link href={link} className="block h-full w-full">
        {/* Background Image */}
        <div className="absolute inset-0 scale-95">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300"
            priority={index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-5 flex flex-col justify-between h-full">
          <h4 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">
            {title}
          </h4>
          <button
            onClick={(e) => handleButtonClick(e, link)}
            className="mt-3 text-sm sm:text-base text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 w-fit"
          >
            Get Started
          </button>
        </div>
      </Link>
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
