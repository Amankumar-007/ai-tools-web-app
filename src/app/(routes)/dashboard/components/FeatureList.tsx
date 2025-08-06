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
    title: "Thumbnail Generator",
    bgColor: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
    imageSrc: "/feature1.png",
    link: "/thumbnail-generator",
  },
  {
    title: "Search Thumbnail",
    bgColor: "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600",
    imageSrc: "/feature2.png",
    link: "/search-thumbnail",
  },
  {
    title: "Content Generator",
    bgColor: "bg-gradient-to-r from-purple-600 via-violet-700 to-indigo-800",
    imageSrc: "/feature3.png",
    link: "/content-generator",
  },
  {
    title: "Outlier",
    bgColor: "bg-gradient-to-r from-green-400 via-teal-500 to-cyan-600",
    imageSrc: "/feature4.png",
    link: "/outlier",
  },
  {
    title: "Content Generator 2",
    bgColor: "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700",
    imageSrc: "/feature5.png",
    link: "/content-generator-2",
  },
  {
    title: "Optimize Video",
    bgColor: "bg-gradient-to-r from-red-600 via-pink-600 to-purple-700",
    imageSrc: "/feature6.png",
    link: "/optimize-with-ai",
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
    window.location.href = link;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`${bgColor} relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group h-full min-h-[180px]`}
    >
      <Link href={link} className="block h-full w-full">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            priority={index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full">
          <h4 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow-md">
            {title}
          </h4>
          <button
            onClick={(e) => handleButtonClick(e, link)}
            className="mt-3 sm:mt-4 text-sm sm:text-base text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 w-fit"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white text-center">
        Explore AI Tools
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}
