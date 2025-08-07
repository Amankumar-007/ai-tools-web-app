// components/ProtectedAITools.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, Crown, ExternalLink } from 'lucide-react';
import { getCurrentUser, User } from '@/lib/supabase';
import SubscriptionGuard from './SubscriptionGuard';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredTier: 'FREE' | 'PRO' | 'PREMIUM';
  url?: string;
  image?: string;
}

// Realistic AI tools with different tiers
const AI_TOOLS: AITool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'OpenAI\'s conversational AI assistant for general tasks',
    category: 'Conversational AI',
    requiredTier: 'FREE',
    url: 'https://chat.openai.com',
    image: 'https://via.placeholder.com/300x200/10a37f/white?text=ChatGPT'
  },
  {
    id: '2',
    name: 'Claude',
    description: 'Anthropic\'s privacy-focused AI assistant with strong reasoning',
    category: 'Conversational AI',
    requiredTier: 'FREE',
    url: 'https://www.anthropic.com/claude',
    image: 'https://via.placeholder.com/300x200/8b5cf6/white?text=Claude'
  },
  {
    id: '3',
    name: 'Midjourney',
    description: 'Art-style AI image generator famed for painterly visuals',
    category: 'Image Generation',
    requiredTier: 'PRO',
    url: 'https://www.midjourney.com',
    image: 'https://via.placeholder.com/300x200/06b6d4/white?text=Midjourney'
  },
  {
    id: '4',
    name: 'Synthesia',
    description: 'AI video-generation platform with avatars in many languages',
    category: 'Video Generation',
    requiredTier: 'PRO',
    url: 'https://www.synthesia.io',
    image: 'https://via.placeholder.com/300x200/10b981/white?text=Synthesia'
  },
  {
    id: '5',
    name: 'Runway ML',
    description: 'Advanced AI video editing and generation platform',
    category: 'Video Generation',
    requiredTier: 'PREMIUM',
    url: 'https://runwayml.com',
    image: 'https://via.placeholder.com/300x200/f59e0b/white?text=Runway'
  },
  {
    id: '6',
    name: 'Cursor',
    description: 'AI coding IDE assistant for autocompletion & task delegation',
    category: 'Development',
    requiredTier: 'PRO',
    url: 'https://www.cursor.ai',
    image: 'https://via.placeholder.com/300x200/ef4444/white?text=Cursor'
  },
  {
    id: '7',
    name: 'GitHub Copilot',
    description: 'AI pair programmer that helps write code faster',
    category: 'Development',
    requiredTier: 'PRO',
    url: 'https://github.com/features/copilot',
    image: 'https://via.placeholder.com/300x200/6366f1/white?text=Copilot'
  },
  {
    id: '8',
    name: 'ElevenLabs',
    description: 'AI voice generator with realistic human-like voices',
    category: 'Audio',
    requiredTier: 'PRO',
    url: 'https://elevenlabs.com',
    image: 'https://via.placeholder.com/300x200/8b5cf6/white?text=ElevenLabs'
  },
  {
    id: '9',
    name: 'Suno',
    description: 'AI music generation based on prompts and styles',
    category: 'Music Generation',
    requiredTier: 'PREMIUM',
    url: 'https://www.suno.ai',
    image: 'https://via.placeholder.com/300x200/06b6d4/white?text=Suno'
  },
  {
    id: '10',
    name: 'Notion AI',
    description: 'AI-powered workspace with writing and organization tools',
    category: 'Productivity',
    requiredTier: 'FREE',
    url: 'https://www.notion.so',
    image: 'https://via.placeholder.com/300x200/10b981/white?text=Notion'
  },
  {
    id: '11',
    name: 'Gamma',
    description: 'AI presentation creator from prompts or outlines',
    category: 'Presentation',
    requiredTier: 'PRO',
    url: 'https://gamma.app',
    image: 'https://via.placeholder.com/300x200/f59e0b/white?text=Gamma'
  },
  {
    id: '12',
    name: 'Perplexity',
    description: 'Real-time research and summarization assistant',
    category: 'Research',
    requiredTier: 'FREE',
    url: 'https://www.perplexity.ai',
    image: 'https://via.placeholder.com/300x200/ef4444/white?text=Perplexity'
  }
];

const ProtectedAITools = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return <Star className="w-5 h-5 text-gray-500" />;
      case 'PRO':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'PREMIUM':
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'PRO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const hasAccessToTool = (tool: AITool) => {
    if (!user) return tool.requiredTier === 'FREE';
    
    const tierLevels = { FREE: 0, PRO: 1, PREMIUM: 2 };
    const userLevel = tierLevels[user.subscription_tier] || 0;
    const requiredLevel = tierLevels[tool.requiredTier] || 0;
    
    return userLevel >= requiredLevel && user.subscription_status === 'active';
  };

  const ToolCard = ({ tool }: { tool: AITool }) => {
    const hasAccess = hasAccessToTool(tool);

    const cardContent = (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${
          hasAccess ? 'hover:shadow-xl cursor-pointer' : 'opacity-75'
        } transition-all duration-300`}
        whileHover={hasAccess ? { scale: 1.02 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <img
            src={tool.image}
            alt={tool.name}
            className="w-full h-48 object-cover"
          />
          
          {/* Tier Badge */}
          <div className={`absolute top-3 right-3 flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tool.requiredTier)}`}>
            {getTierIcon(tool.requiredTier)}
            <span className="ml-1">{tool.requiredTier}</span>
          </div>

          {/* Lock Overlay for inaccessible tools */}
          {!hasAccess && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">
                  {tool.requiredTier} Required
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {tool.name}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {tool.category}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {tool.description}
          </p>

          {hasAccess ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Available
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
              <Lock className="w-4 h-4 mr-1" />
              Upgrade Required
            </div>
          )}
        </div>
      </motion.div>
    );

    // If user has access, make it clickable
    if (hasAccess && tool.url) {
      return (
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
          {cardContent}
        </a>
      );
    }

    // If user doesn't have access, wrap in subscription guard
    return (
      <SubscriptionGuard 
        requiredTier={tool.requiredTier}
        fallback={cardContent}
      >
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
          {cardContent}
        </a>
      </SubscriptionGuard>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            AI Tools Collection
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore our comprehensive collection of AI-powered tools
          </motion.p>
          
          {user && (
            <motion.div
              className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {getTierIcon(user.subscription_tier)}
              <span className="ml-2 text-blue-800 dark:text-blue-200 font-medium">
                {user.subscription_tier} Plan Active
              </span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AI_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>

        {/* Upgrade CTA */}
        {user && user.subscription_tier === 'FREE' && (
          <motion.div
            className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unlock More AI Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Upgrade to Pro or Premium to access our full suite of advanced AI tools and features.
            </p>
            <motion.a
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Pricing Plans
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProtectedAITools;