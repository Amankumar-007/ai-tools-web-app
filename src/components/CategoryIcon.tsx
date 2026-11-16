'use client';

import React from 'react';
import {
  Box, Bot, Smile, MessageSquare, ShieldCheck, Cpu, Sparkles, Award,
  Flame, Palette, Code2, Accessibility, Sliders, Zap, UserCheck, Briefcase,
  MessagesSquare, Headphones, BarChart2, Heart, Terminal, ShoppingCart,
  Mail, GraduationCap, Puzzle, RefreshCw, Shirt, FileSpreadsheet, DollarSign,
  Rocket, Gamepad2, GitBranch, Activity, Crop, Image as ImageIcon, Scale,
  HeartHandshake, Layers, Sparkle, Megaphone, Brain, Music, LayoutGrid,
  Presentation, CheckSquare, FileCode, Wand2, Home, Microscope, TrendingUp,
  Search, Target, Share2, BookOpen, AlignLeft, FileText, Volume2, Film,
  HelpCircle, FileAudio, Languages, Compass, Scissors, Video, Mic2, Globe,
  PenLine
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Box, Bot, Smile, MessageSquare, ShieldCheck, Cpu, Sparkles, Award,
  Flame, Palette, Code2, Accessibility, Sliders, Zap, UserCheck, Briefcase,
  MessagesSquare, Headphones, BarChart2, Heart, Terminal, ShoppingCart,
  Mail, GraduationCap, Puzzle, RefreshCw, Shirt, FileSpreadsheet, DollarSign,
  Rocket, Gamepad2, GitBranch, Activity, Crop, Image: ImageIcon, Scale,
  HeartHandshake, Layers, Sparkle, Megaphone, Brain, Music, LayoutGrid,
  Presentation, CheckSquare, FileCode, Wand2, Home, Microscope, TrendingUp,
  Search, Target, Share2, BookOpen, AlignLeft, FileText, Volume2, Film,
  HelpCircle, FileAudio, Languages, Compass, Scissors, Video, Mic2, Globe,
  PenLine
};

// Specialized Voice Cloning Audio Waveform bars SVG (as shown in user image 2)
export const VoiceCloningWaveform = ({ className = 'w-4 h-4 text-amber-500' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="2" y="7" width="2.5" height="10" rx="1.25" />
    <rect x="7" y="3" width="2.5" height="18" rx="1.25" />
    <rect x="12" y="8" width="2.5" height="8" rx="1.25" />
    <rect x="17" y="5" width="2.5" height="14" rx="1.25" />
    <rect x="22" y="9" width="2" height="6" rx="1" />
  </svg>
);

// Sparkle Stars Icon for Latest AI (as shown in user image 1)
export const LatestAISparkles = ({ className = 'w-4 h-4 text-pink-500' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
    <path d="M19 16L20.2 18.8L23 20L20.2 21.2L19 24L17.8 21.2L15 20L17.8 18.8L19 16Z" opacity="0.7" />
  </svg>
);

export default function CategoryIcon({
  iconName,
  slug,
  className = 'w-4 h-4',
  size = 16,
}: {
  iconName?: string;
  slug?: string;
  className?: string;
  size?: number;
}) {
  if (slug === 'voice-cloning') {
    return <VoiceCloningWaveform className={className} />;
  }
  if (slug === 'latest-ai') {
    return <LatestAISparkles className={className} />;
  }

  const IconComponent = iconName ? ICON_MAP[iconName] : Sparkles;
  if (!IconComponent) return <Sparkles size={size} className={className} />;

  return <IconComponent size={size} className={className} />;
}
