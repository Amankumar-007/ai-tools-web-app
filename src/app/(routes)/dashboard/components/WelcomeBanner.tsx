import React from "react";

const WelcomeBanner = () => {
  return (
    <div className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Welcome to Your Creator Dashboard 🎉</h2>
      <p className="text-sm md:text-base">
        Analyze your YouTube videos, generate better thumbnails, optimize titles,
        and grow faster with data-backed insights. Whether you&apos;re fixing old content
        or planning new uploads — this dashboard has your back.
      </p>
    </div>
  );
};

export default WelcomeBanner;
