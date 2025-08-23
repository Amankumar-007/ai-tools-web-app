import { useState, useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';

const TrendingTools = () => {
  const tools = [
    {
      name: "ChatGPT",
      rating: 5,
      reviews: 9,
      pricing: "Freemium",
      users: "5606",
      description: "Revolutionize interaction, creativity, and innovation with AI-powered conversations.",
      tags: ["#ai chatbots", "#education"],
      category: "Writing generators",
      featured: true,
      logo: "🤖",
      color: "bg-green-100",
      link: "https://chat.openai.com/"
    },
    {
      name: "Runway",
      rating: 5,
      reviews: 0,
      pricing: "Freemium",
      users: "769",
      description: "AI-driven platform for high-fidelity, controllable video and creative workflows.",
      tags: ["#text to video", "#video editing"],
      category: "Video generators",
      logo: "🎬",
      color: "bg-black",
      link: "https://runwayml.com/"
    },
    {
      name: "Gamma",
      rating: 5,
      reviews: 17,
      pricing: "Free Trial",
      users: "518",
      description: "Write beautiful, engaging content and presentations with AI.",
      tags: ["#presentations", "#copywriting", "#startup tools"],
      category: "Writing generators",
      logo: "💎",
      color: "bg-purple-500",
      link: "https://gamma.app/"
    },
    {
      name: "Midjourney",
      rating: 4,
      reviews: 23,
      pricing: "Freemium",
      users: "3421",
      description: "Create stunning AI-generated artwork with simple text prompts.",
      tags: ["#ai art", "#image generation"],
      category: "Image generators",
      logo: "🎨",
      color: "bg-blue-500",
      link: "https://www.midjourney.com/"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleCards, setVisibleCards] = useState(3); // Default for SSR
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Only run on client
  useEffect(() => {
    const getVisibleCards = () => {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    };
    setVisibleCards(getVisibleCards());
    const handleResize = () => setVisibleCards(getVisibleCards());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(tools.length / visibleCards);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current - touchEndX.current > 40) {
      nextSlide();
    } else if (touchEndX.current - touchStartX.current > 40) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, totalSlides]);

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-6 py-10 sm:py-16 min-h-screen">
      <style>{`
        @media (max-width: 640px) {
          .trending-card {
            min-width: 90vw !important;
            max-width: 95vw !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .trending-slider {
            gap: 0 !important;
          }
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-3 sm:mb-4">Trending AI Tools</h2>
        <p className="text-base sm:text-lg">Discover the most popular AI tools loved by creators worldwide</p>
      </div>

      <div
        className="relative overflow-x-auto hide-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex trending-slider transition-transform duration-200 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            width: `${(tools.length / visibleCards) * 100}%`,
            gap: "1.5rem"
          }}
        >
          {tools.map((tool, index) => (
            <div
              key={tool.name}
              className="flex-shrink-0 px-2 sm:px-4 trending-card"
              style={{ width: `${100 / tools.length}%` }}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-100 hover:-translate-y-0.5 overflow-hidden border border-gray-100 h-full">
                {/* Header with logo and verified badge */}
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${tool.color} rounded-xl flex items-center justify-center text-2xl ${tool.name === 'Runway' ? 'text-white' : ''}`}>
                        {tool.logo}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{tool.name}</h3>
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < tool.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">({tool.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and users */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">{tool.pricing}</span>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span className="text-lg sm:text-xl font-bold">{tool.users}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">{tool.description}</p>

                  {/* Category */}
                  <div className="mb-4">
                    <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {tool.category}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-xs text-blue-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  {tool.featured && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Editors Pick</span>
                    </div>
                  )}
                  {!tool.featured && <div></div>}
                  
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors duration-100 flex items-center space-x-2 hover:shadow-lg text-xs sm:text-base"
                  >
                    <span>Visit</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-play toggle */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-100 ${
            isAutoPlaying 
              ? 'bg-blue-500 text-white hover:bg-orange-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
        </button>
      </div>
    </section>
  );
};

export default TrendingTools;