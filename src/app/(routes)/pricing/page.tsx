'use client'
import React from 'react';
import { Check, MessageSquare, Cpu, Wand2, Zap } from 'lucide-react';

const PricingPage = () => {
  const languages = [
    { lang: "English", text: "Free", font: "font-sans" },
    { lang: "Hindi", text: "मुफ़्त", font: "font-serif" },
    { lang: "Spanish", text: "Gratis", font: "font-mono" },
    { lang: "Japanese", text: "無料", font: "font-sans" },
    { lang: "French", text: "Gratuit", font: "font-serif" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D2926] selection:bg-red-200">
      {/* Hero Section */}
      <section className="pt-20 pb-10 px-6 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-red-600 uppercase bg-red-50 rounded-full ring-1 ring-red-100">
          Future-Ready Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Powerful AI Tools for <span className="text-red-500 italic">Everyone.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          From smart chat assistants to complex workflow automation, our AI tools are
          built to be accessible to everyone. Experience the next generation of productivity.
        </p>
      </section>

      {/* The "Free" Kinetic Typography Slider */}
      <div className="overflow-hidden py-10 bg-red-500 text-white rotate-[-1deg] shadow-lg">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
          {[...languages, ...languages].map((item, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className={`text-6xl md:text-8xl font-black uppercase ${item.font}`}>
                {item.text}
              </span>
              <span className="text-4xl opacity-50">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Basic Tier */}
        <div className="group relative p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">AI Chat Basic</h3>
          <p className="text-gray-500 mb-6">Perfect for individuals explored AI for the first time.</p>
          <div className="mb-8">
            <span className="text-4xl font-black">$0</span>
            <span className="text-gray-400">/forever</span>
          </div>
          <ul className="space-y-4 mb-10">
            {['Basic AI Chat Assistant', '100 queries per month', 'Community support', 'Standard response speed'].map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <Check size={18} className="text-red-500" />
                <span className="text-gray-600">{feat}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
            Start Chatting
          </button>
        </div>

        {/* Pro Tier */}
        <div className="group relative p-8 bg-red-50 border-2 border-red-500 rounded-[2rem] shadow-xl md:scale-110 z-10">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-1 rounded-full text-sm font-bold">
            MOST POPULAR
          </div>
          <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center mb-6 text-white">
            <Zap size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">AI Pro Suite</h3>
          <p className="text-gray-600 mb-6">Advanced power for professionals and power users.</p>
          <div className="mb-8">
            <span className="text-4xl font-black">$0</span>
            <span className="text-red-600/60 line-through text-2xl ml-2">$29</span>
            <span className="text-gray-400">/forever</span>
          </div>
          <ul className="space-y-4 mb-10">
            {['Unlimited AI Chat', 'Custom AI Workflows', 'Priority Response Time', 'Early access to new tools'].map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <Check size={18} className="text-red-500" />
                <span className="text-gray-700 font-medium">{feat}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
            Unlock Pro Free
          </button>
        </div>

        {/* Enterprise Tier */}
        <div className="group relative p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
            <Cpu size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Enterprise AI</h3>
          <p className="text-gray-500 mb-6">Scalable solutions for businesses and large teams.</p>
          <div className="mb-8">
            <span className="text-4xl font-black">$0</span>
            <span className="text-gray-400">/forever</span>
          </div>
          <ul className="space-y-4 mb-10">
            {['Custom AI Model Training', 'Full API Access', 'Team Collaboration Tools', 'Dedicated Support'].map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <Check size={18} className="text-red-500" />
                <span className="text-gray-600">{feat}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">
            Contact Sales
          </button>
        </div>
      </section>

      {/* Bottom Aesthetic Footer */}
      <footer className="text-center pb-20 opacity-40 grayscale hover:grayscale-0 transition-all">
        <p className="font-serif italic text-2xl">"The best intelligence is shared intelligence."</p>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
