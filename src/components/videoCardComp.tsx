'use client'

import React from 'react'

const videos = [
  {
    title: 'Master AI Productivity Tools',
    url: 'https://www.youtube.com/embed/ZMEFCbokVcY',
  },
  {
    title: 'Top 7 Productivity AI Apps',
    url: 'https://www.youtube.com/embed/P6pQKw0J1ic',
  },
  {
    title: 'Optimize Work with AI',
    url: 'https://www.youtube.com/embed/okQtZRBuRGg',
  },
  {
    title: 'AI-Powered Task Automation',
    url: 'https://www.youtube.com/embed/RAvlE-G6wSo',
  },
]

export default function ProductivitySection() {
  return (
    <div className="relative p-8 md:p-12 rounded-2xl bg-white border border-gray-100 shadow-sm max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 my-12 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-50 opacity-50 blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-50 opacity-50 blur-xl"></div>
      
      {/* LEFT COLUMN */}
      <div className="flex-1 relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-3">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">AI Productivity</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Work Smarter</span>, Not Harder
        </h2>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Productivity Pro</h3>
            <p className="text-gray-600 text-sm">AI-powered efficiency solutions</p>
          </div>
        </div>

        <p className="text-gray-700 text-base leading-relaxed">
          Discover how AI can streamline your workflow, automate repetitive tasks, and help you focus on what truly matters.
        </p>

        <ul className="space-y-3 text-gray-700">
          {[
            "Expert-curated AI tool recommendations",
            "Step-by-step automation guides",
            "Real-world productivity case studies",
            "Exclusive efficiency techniques"
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <a
            href="https://www.youtube.com/@productivitypro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 hover:opacity-90"
          >
            Watch All Videos
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 relative z-10">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Featured Videos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
            >
              <div className="aspect-video bg-gray-900 relative">
                <iframe
                  src={video.url}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="p-4 bg-white">
                <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Productivity Pro</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}