'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Define AI tools with added category field
const aiTools = [
  {"name":"ChatGPT","url":"https://chat.openai.com","description":"OpenAI’s conversational AI general-purpose assistant.","category":"Conversational AI"},
  {"name":"Claude","url":"https://www.anthropic.com/claude","description":"Anthropic’s privacy-focused AI assistant with strong reasoning.","category":"Conversational AI"},
  {"name":"Gemini","url":"https://gemini.google.com","description":"Google’s multimodal LLM powering chat, image & code tasks.","category":"Conversational AI"},
  {"name":"Grok","url":"https://www.x.com/grok","description":"X (formerly Twitter)’s unfiltered fast-response AI assistant.","category":"Conversational AI"},
  {"name":"DeepSeek","url":"https://www.deepseek.ai","description":"AI research assistant tailored for academic and business research.","category":"Research"},
  {"name":"Synthesia","url":"https://www.synthesia.io","description":"AI video-generation platform with avatars in many languages.","category":"Video Generation"},
  {"name":"Midjourney","url":"https://www.midjourney.com","description":"Art-style AI image generator famed for painterly visuals.","category":"Image Generation"},
  {"name":"GPT-4o","url":"https://openai.com/gpt-4o","description":"OpenAI’s multimodal GPT-4 variant with image/video input support.","category":"Conversational AI"},
  {"name":"Fathom","url":"https://fathom.video","description":"AI meeting assistant that records, transcribes and highlights calls.","category":"Productivity"},
  {"name":"n8n","url":"https://n8n.io","description":"Open-source automation tool for building workflows.","category":"Automation"},
  {"name":"Manus","url":"https://www.manus.ai","description":"Narrative writing assistant for longer-form creative work.","category":"Creative Writing"},
  {"name":"Deep Research","url":"https://deepresearch.ai","description":"AI-powered platform for structured research and insights.","category":"Research"},
  {"name":"NotebookLM","url":"https://notebooklm.google.com","description":"Google’s AI knowledge management & Q&A over your notes.","category":"Productivity"},
  {"name":"Rytr","url":"https://rytr.me","description":"AI writing assistant for short-form content and copy.","category":"Creative Writing"},
  {"name":"Sudowrite","url":"https://www.sudowrite.com","description":"Creative writing tool for fiction and long-form content.","category":"Creative Writing"},
  {"name":"Canva Magic Studio","url":"https://www.canva.com/magic-studio","description":"AI tools inside Canva for design, image generation and editing.","category":"Design"},
  {"name":"Looka","url":"https://looka.com","description":"AI-powered logo and branding design generator.","category":"Design"},
  {"name":"Lovable","url":"https://lovable.ai","description":"AI app-builder focused on generating mobile/web apps.","category":"App Development"},
  {"name":"Cursor","url":"https://www.cursor.ai","description":"AI coding IDE assistant for autocompletion & task delegation.","category":"Coding"},
  {"name":"Hubspot Email Writer","url":"https://www.hubspot.com/products/marketing/email","description":"AI-assisted email composition tool integrated into HubSpot.","category":"Email"},
  {"name":"Fyxer","url":"https://www.fyxer.com","description":"AI email assistant that helps prioritize and draft replies.","category":"Email"},
  {"name":"Shortwave","url":"https://shortwave.com","description":"AI email client that organizes and helps respond faster.","category":"Email"},
  {"name":"Reclaim","url":"https://reclaim.ai","description":"AI-powered time management assistant for calendar optimization.","category":"Productivity"},
  {"name":"Clockwise","url":"https://www.getclockwise.com","description":"Smart calendar assistant that schedules focus time and meetings.","category":"Productivity"},
  {"name":"Gamma","url":"https://gamma.app","description":"AI presentation creator from prompts or outlines.","category":"Presentation"},
  {"name":"Copilot for PowerPoint","url":"https://www.microsoft.com/en-us/microsoft-365/copilot","description":"Microsoft’s AI feature to generate and refine slides.","category":"Presentation"},
  {"name":"Teal","url":"https://www.tealhq.com","description":"AI resume builder and career toolkit.","category":"Career"},
  {"name":"Kickresume","url":"https://www.kickresume.com","description":"AI-driven resume and cover letter creator.","category":"Career"},
  {"name":"ElevenLabs","url":"https://elevenlabs.com","description":"AI voice generator with realistic human-like voices.","category":"Voice Generation"},
  {"name":"Murf","url":"https://murf.ai","description":"AI voiceover and speech generation platform.","category":"Voice Generation"},
  {"name":"Suno","url":"https://www.suno.ai","description":"AI music generation based on prompts and styles.","category":"Music Generation"},
  {"name":"Udio","url":"https://www.udio.ai","description":"AI tool for music and audio generation and editing.","category":"Music Generation"},
  {"name":"AdCreative","url":"https://www.adcreative.ai","description":"AI ad design and copy generation for marketing.","category":"Marketing"},
  {"name":"AirOps","url":"https://www.airops.com","description":"AI knowledge assistant integrated into company docs.","category":"Productivity"},
  {"name":"DataRobot","url":"https://www.datarobot.com","description":"Enterprise AutoML platform for model building.","category":"Data Science"},
  {"name":"H2O.ai","url":"https://www.h2o.ai","description":"Open source AI/AutoML suite for data science.","category":"Data Science"},
  {"name":"Databricks","url":"https://databricks.com","description":"Unified analytics platform with ML and AI capabilities.","category":"Data Science"},
  {"name":"RapidMiner","url":"https://rapidminer.com","description":"Data science platform for analytics and predictive modelling.","category":"Data Science"},
  {"name":"Amazon SageMaker","url":"https://aws.amazon.com/sagemaker","description":"AWS platform for building and deploying ML models.","category":"Data Science"},
  {"name":"BigML","url":"https://bigml.com","description":"User-friendly AutoML and ML workflows.","category":"Data Science"},
  {"name":"Scikit-learn","url":"https://scikit-learn.org","description":"Python library for ML algorithms and modeling.","category":"Data Science"},
  {"name":"TensorFlow","url":"https://tensorflow.org","description":"Google’s open-source platform for machine learning.","category":"Data Science"},
  {"name":"PyTorch","url":"https://pytorch.org","description":"Meta’s open-source deep learning framework.","category":"Data Science"},
  {"name":"Keras","url":"https://keras.io","description":"High-level neural network API integrated with TensorFlow.","category":"Data Science"},
  {"name":"MXNet","url":"https://mxnet.apache.org","description":"Scalable deep learning framework.","category":"Data Science"},
  {"name":"Theano","url":"https://github.com/Theano/Theano","description":"Early Python library for numerical computation.","category":"Data Science"},
  {"name":"Caffe","url":"https://caffe.berkeleyvision.org","description":"Deep learning framework optimized for vision tasks.","category":"Data Science"},
  {"name":"Chainer","url":"https://chainer.org","description":"NumPy-based deep learning library in Python.","category":"Data Science"},
  {"name":"Deeplearning4j","url":"https://deeplearning4j.org","description":"Java/JVM-based deep learning library.","category":"Data Science"},
  {"name":"ML.NET","url":"https://dot.net/ml","description":"Microsoft’s ML library for .NET developers.","category":"Data Science"},
  {"name":"OpenNN","url":"https://www.opennn.org","description":"C++ neural networks library for modelling.","category":"Data Science"},
  {"name":"Neuroph","url":"https://neuroph.sourceforge.net","description":"Java-based neural network framework.","category":"Data Science"},
  {"name":"FANN","url":"http://leenissen.dk/fann","description":"C library for feed-forward neural networks.","category":"Data Science"},
  {"name":"TPOT","url":"https://github.com/EpistasisLab/tpot","description":"AutoML tool using genetic programming pipelines.","category":"Data Science"},
  {"name":"NNI (Neural Network Intelligence)","url":"https://github.com/microsoft/nni","description":"Microsoft’s toolkit for hyperparameter tuning and architecture search.","category":"Data Science"},
  {"name":"Weka","url":"https://ml.cms.waikato.ac.nz/weka","description":"Java data-mining suite with ML algorithms.","category":"Data Science"},
  {"name":"Apache Mahout","url":"https://mahout.apache.org","description":"Scalable machine-learning library on Hadoop/Spark.","category":"Data Science"},
  {"name":"Orange","url":"https://orange.biolab.si","description":"Visual programming toolkit for ML and data analysis.","category":"Data Science"},
  {"name":"mlpack","url":"https://www.mlpack.org","description":"C++ machine learning library with fast algorithms.","category":"Data Science"},
  {"name":"Shogun","url":"https://www.shogun-toolbox.org","description":"C++ ML library for large-scale data.","category":"Data Science"},
  {"name":"Jubatus","url":"https://jubat.us","description":"Distributed real-time online ML framework.","category":"Data Science"},
  {"name":"rapidminer","url":"https://rapidminer.com","description":"Predictive analytics and ML platform.","category":"Data Science"},
  {"name":"Lily AI","url":"https://www.lily.ai","description":"Conversational styling and product-recommendation AI.","category":"E-commerce"},
  {"name":"Daydream","url":"https://www.daydream.ai","description":"Fashion styling chatbot for personalized outfit suggestions.","category":"E-commerce"},
  {"name":"Whering","url":"https://www.whering.com","description":"AI wardrobe organizer for outfit planning and resale.","category":"E-commerce"},
  {"name":"Legal Robot","url":"https://www.legalrobot.com","description":"AI-analysis of legal language to aid understanding.","category":"Legal"},
  {"name":"Beagle.ai","url":"https://www.beagle.ai","description":"Streamlines legal documents via AI analysis.","category":"Legal"},
  {"name":"Browse AI","url":"https://www.browse.ai","description":"No-code web-scraping and automation tool.","category":"Automation"},
  {"name":"Deepnote","url":"https://deepnote.com","description":"Collaborative AI notebook for data analysis.","category":"Data Science"},
  {"name":"VoiceFlow","url":"https://www.voiceflow.com","description":"Platform for building AI voice assistants.","category":"Voice Generation"},
  {"name":"Consensus.app","url":"https://consensus.app","description":"Summarizes scientific studies via AI.","category":"Research"},
  {"name":"ChatPDF","url":"https://chatpdf.com","description":"Interactively chat with PDF documents using AI.","category":"Productivity"},
  {"name":"YouScan","url":"https://youscan.io","description":"Social media listening and visual analytics AI platform.","category":"Marketing"},
  {"name":"You.com","url":"https://you.com","description":"AI-powered search with integrated chatbot YouChat.","category":"Search"},
  {"name":"Perplexity","url":"https://www.perplexity.ai","description":"Real-time research and summarization assistant.","category":"Research"},
  {"name":"Qwen","url":"https://qwen.ai","description":"Alibaba’s open-source large language model platform.","category":"Conversational AI"},
  {"name":"CodeRabbit","url":"https://coderabbit.ai","description":"AI agent that reviews, writes, and submits code.","category":"Coding"},
  {"name":"GitHub Copilot Reviewer","url":"https://github.com/features/copilot","description":"AI tool to review pull requests and suggest improvements.","category":"Coding"},
  {"name":"Cursor BugBot","url":"https://cursor.ai/bugbot","description":"Automated AI code review tool within Cursor.","category":"Coding"},
  {"name":"Graphite","url":"https://graphite.com","description":"Emerging agentic AI for software engineering.","category":"Coding"},
  {"name":"Greptile","url":"https://greptile.ai","description":"AI tool for automated code review and feedback.","category":"Coding"},
  {"name":"Bubble","url":"https://bubble.io","description":"No-code app builder using AI assistance.","category":"App Development"},
  {"name":"Webflow","url":"https://webflow.com","description":"No-code web design with AI-powered tools.","category":"Design"},
  {"name":"Notion","url":"https://www.notion.so","description":"All-in-one workspace with AI-powered Q&A and writing.","category":"Productivity"},
  {"name":"Glide","url":"https://www.glideapps.com","description":"AI-assisted no-code mobile app builder.","category":"App Development"},
  {"name":"Make (formerly Integromat)","url":"https://www.make.com","description":"Visual automation builder with AI capabilities.","category":"Automation"}
];

// Extract unique categories
const categories = ['All', ...new Set(aiTools.map(tool => tool.category))];

export default function AIToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter tools based on search query and selected category
  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white shadow-lg p-6 fixed h-full overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Filter by Category</h2>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category}>
              <button
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI tools..."
              className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <MagnifyingGlassIcon className="w-6 h-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </motion.div>

        {/* Title and Grid */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold text-center text-gray-900 mb-12 max-w-7xl mx-auto"
        >
          Discover the Best AI Tools
        </motion.h1>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h2>
                  <p className="text-gray-600 text-sm mb-2">{tool.category}</p>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <Link
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Visit Tool
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-full text-center text-gray-600"
            >
              No tools found matching your criteria.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}