
import {
    Youtube, Mic, Rocket, BookOpen, Palette,
    Code, Megaphone, Video, Image as ImageIcon,
    PenTool, MonitorPlay, ShoppingBag, Music,
    GraduationCap, Briefcase, Camera, Film,
    Newspaper, Share2, Layers, BrainCircuit,
    Sparkles, Braces, CheckCircle, Search,
    MessageCircle, Presentation, Mail, BarChart3,
    Smartphone, Globe, Shield, Zap, Target
} from 'lucide-react';

export interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    toolName: string;
    toolUrl: string;
    icon: any;
}

export interface Workflow {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    steps: WorkflowStep[];
}

export const workflows: Workflow[] = [
    // --- CREATOR ECONOMY ---
    {
        id: 'youtube-empire',
        title: 'YouTube Empire',
        description: 'Launch and scale a faceless YouTube channel in 24 hours.',
        icon: Youtube,
        color: 'from-red-500 to-rose-600',
        steps: [
            { id: 'script', title: 'Script', description: 'Generate script & outline', toolName: 'ChatGPT', toolUrl: 'https://chat.openai.com', icon: PenTool },
            { id: 'voice', title: 'Voiceover', description: 'Realistic AI narration', toolName: 'ElevenLabs', toolUrl: 'https://elevenlabs.io', icon: Mic },
            { id: 'video', title: 'Video', description: 'Stock footage assembly', toolName: 'InVideo', toolUrl: 'https://invideo.io', icon: Video },
            { id: 'thumb', title: 'Thumbnail', description: 'Click-worthy cover art', toolName: 'Midjourney', toolUrl: 'https://midjourney.com', icon: ImageIcon }
        ]
    },
    {
        id: 'podcaster',
        title: 'Podcast Pro',
        description: 'Record, edit, and publish professional podcasts effortlessly.',
        icon: Mic,
        color: 'from-amber-500 to-orange-600',
        steps: [
            { id: 'research', title: 'Topics', description: 'Find trending questions', toolName: 'Claude', toolUrl: 'https://claude.ai', icon: BookOpen },
            { id: 'record', title: 'Record', description: 'Studio-quality recording', toolName: 'Riverside', toolUrl: 'https://riverside.fm', icon: Mic },
            { id: 'edit', title: 'Edit', description: 'Text-based audio editing', toolName: 'Descript', toolUrl: 'https://descript.com', icon: Video },
            { id: 'clips', title: 'Clips', description: 'Viral shorts for social', toolName: 'OpusClip', toolUrl: 'https://opus.pro', icon: MonitorPlay }
        ]
    },
    {
        id: 'tiktok-viral',
        title: 'TikTok Viral',
        description: 'Create engaging short-form content that trends.',
        icon: Film,
        color: 'from-pink-500 to-rose-500',
        steps: [
            { id: 'trends', title: 'Trends', description: 'Spot viral sounds', toolName: 'TikTok Creative', toolUrl: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en', icon: Sparkles },
            { id: 'script', title: 'Hooks', description: 'Write viral hooks', toolName: 'Jasper', toolUrl: 'https://jasper.ai', icon: PenTool },
            { id: 'edit', title: 'Edit', description: 'Auto-captions & cuts', toolName: 'CapCut', toolUrl: 'https://www.capcut.com', icon: Video }
        ]
    },

    // --- BUSINESS & STARTUP ---
    {
        id: 'ai-startup',
        title: 'Solo Founder',
        description: 'Build and launch your SaaS product without a team.',
        icon: Rocket,
        color: 'from-indigo-500 to-purple-600',
        steps: [
            { id: 'validate', title: 'Validate', description: 'Market research', toolName: 'Perplexity', toolUrl: 'https://perplexity.ai', icon: BookOpen },
            { id: 'build', title: 'Build', description: 'AI Code Editor', toolName: 'Cursor', toolUrl: 'https://cursor.sh', icon: Code },
            { id: 'brand', title: 'Brand', description: 'Logo & Identity', toolName: 'Looka', toolUrl: 'https://looka.com', icon: Palette },
            { id: 'launch', title: 'Launch', description: 'Marketing copy', toolName: 'Copy.ai', toolUrl: 'https://copy.ai', icon: Megaphone }
        ]
    },
    {
        id: 'branding-kit',
        title: 'Brand Identity',
        description: 'Create a complete professional brand identity from scratch.',
        icon: Target,
        color: 'from-orange-500 to-amber-600',
        steps: [
            { id: 'name', title: 'Naming', description: 'Generate brand names', toolName: 'Namelix', toolUrl: 'https://namelix.com', icon: PenTool },
            { id: 'logo', title: 'Logo', description: 'Design logo icons', toolName: 'Midjourney', toolUrl: 'https://midjourney.com', icon: Palette },
            { id: 'font', title: 'Styles', description: 'Choose color palette', toolName: 'Coolors', toolUrl: 'https://coolors.co', icon: ImageIcon }
        ]
    },
    {
        id: 'ecommerce',
        title: 'E-commerce Mastery',
        description: 'Create and market products for your online store.',
        icon: ShoppingBag,
        color: 'from-emerald-500 to-teal-600',
        steps: [
            { id: 'photo', title: 'Photos', description: 'Pro product shots', toolName: 'Photoroom', toolUrl: 'https://www.photoroom.com', icon: Camera },
            { id: 'desc', title: 'Copy', description: 'SEO descriptions', toolName: 'ChatGPT', toolUrl: 'https://chat.openai.com', icon: PenTool },
            { id: 'ads', title: 'Ads', description: 'Ad creatives', toolName: 'AdCreative', toolUrl: 'https://adcreative.ai', icon: Megaphone }
        ]
    },

    // --- CREATIVE ARTS & DESIGN ---
    {
        id: 'digital-artist',
        title: 'Concept Artist',
        description: 'Create stunning concept art and illustrations.',
        icon: Palette,
        color: 'from-fuchsia-500 to-purple-600',
        steps: [
            { id: 'inspire', title: 'Prompt', description: 'Prompt helper', toolName: 'Lexica', toolUrl: 'https://lexica.art', icon: Sparkles },
            { id: 'generate', title: 'Create', description: 'Image generation', toolName: 'Midjourney', toolUrl: 'https://midjourney.com', icon: ImageIcon },
            { id: 'upscale', title: 'Upscale', description: 'Enhance quality', toolName: 'Upscale.media', toolUrl: 'https://upscale.media', icon: Layers }
        ]
    },
    {
        id: 'ui-ux-design',
        title: 'UI/UX Designer',
        description: 'Design beautiful app interfaces and prototypes.',
        icon: Globe,
        color: 'from-blue-500 to-indigo-600',
        steps: [
            { id: 'wireframe', title: 'Wireframe', description: 'Generate IA & layout', toolName: 'Relume', toolUrl: 'https://www.relume.io', icon: Layers },
            { id: 'design', title: 'Design', description: 'Design in Figma', toolName: 'Figma', toolUrl: 'https://figma.com', icon: Palette },
            { id: 'icon', title: 'Icons', description: 'Custom icon set', toolName: 'Iconify', toolUrl: 'https://iconify.design', icon: Sparkles }
        ]
    },
    {
        id: 'musician',
        title: 'AI Musician',
        description: 'Compose, produce, and release original music.',
        icon: Music,
        color: 'from-cyan-500 to-blue-600',
        steps: [
            { id: 'lyrics', title: 'Lyrics', description: 'Write song lyrics', toolName: 'ChatGPT', toolUrl: 'https://chat.openai.com', icon: PenTool },
            { id: 'compose', title: 'Music', description: 'Generate song', toolName: 'Suno', toolUrl: 'https://suno.ai', icon: Music },
            { id: 'master', title: 'Master', description: 'Audio mastering', toolName: 'Landr', toolUrl: 'https://www.landr.com', icon: Layers }
        ]
    },

    // --- MARKETING & GROWTH ---
    {
        id: 'seo-strategy',
        title: 'SEO Strategist',
        description: 'Rank page #1 on Google with AI-driven SEO.',
        icon: Search,
        color: 'from-green-600 to-teal-700',
        steps: [
            { id: 'keywords', title: 'Keywords', description: 'Find low competition', toolName: 'SEMrush', toolUrl: 'https://semrush.com', icon: BarChart3 },
            { id: 'content', title: 'Content', description: 'SEO-optimized text', toolName: 'Surfer SEO', toolUrl: 'https://surferseo.com', icon: PenTool },
            { id: 'audit', title: 'Audit', description: 'Technical SEO check', toolName: 'Ahrefs', toolUrl: 'https://ahrefs.com', icon: Shield }
        ]
    },
    {
        id: 'email-marketing',
        title: 'Email Expert',
        description: 'Personalized email campaigns that convert.',
        icon: Mail,
        color: 'from-purple-500 to-pink-600',
        steps: [
            { id: 'list', title: 'Lead Gen', description: 'Find prospects', toolName: 'Apollo.io', toolUrl: 'https://apollo.io', icon: Search },
            { id: 'write', title: 'Copy', description: 'Persuasive emails', toolName: 'Lavender', toolUrl: 'https://lavender.ai', icon: PenTool },
            { id: 'send', title: 'Send', description: 'Automation setup', toolName: 'Instantly.ai', toolUrl: 'https://instantly.ai', icon: Zap }
        ]
    },

    // --- ACADEMIC & RESEARCH ---
    {
        id: 'researcher',
        title: 'Ph.D. Speedrun',
        description: 'Accelerate academic research and writing.',
        icon: GraduationCap,
        color: 'from-sky-500 to-blue-700',
        steps: [
            { id: 'find', title: 'Search', description: 'Find papers', toolName: 'Consensus', toolUrl: 'https://consensus.app', icon: BookOpen },
            { id: 'analyze', title: 'Read', description: 'Analyze PDFs', toolName: 'ChatPDF', toolUrl: 'https://chatpdf.com', icon: Braces },
            { id: 'write', title: 'Write', description: 'Drafting help', toolName: 'Jenni AI', toolUrl: 'https://jenni.ai', icon: PenTool }
        ]
    },

    // --- DEVELOPER & TECH ---
    {
        id: 'developer',
        title: '10x Developer',
        description: 'Code, debug, and deploy faster than ever.',
        icon: Code,
        color: 'from-slate-700 to-slate-900',
        steps: [
            { id: 'plan', title: 'Arch', description: 'System design', toolName: 'ChatGPT', toolUrl: 'https://chat.openai.com', icon: BrainCircuit },
            { id: 'code', title: 'Code', description: 'AI Editor', toolName: 'Cursor', toolUrl: 'https://cursor.sh', icon: Code },
            { id: 'doc', title: 'Docs', description: 'Auto documentation', toolName: 'Mintlify', toolUrl: 'https://mintlify.com', icon: BookOpen }
        ]
    },
    {
        id: 'app-launcher',
        title: 'App Launcher',
        description: 'From idea to App Store in record time.',
        icon: Smartphone,
        color: 'from-violet-600 to-purple-800',
        steps: [
            { id: 'blueprint', title: 'UX Flow', description: 'Logic & database', toolName: 'FlutterFlow', toolUrl: 'https://flutterflow.io', icon: Smartphone },
            { id: 'backend', title: 'Backend', description: 'Scalable infrastructure', toolName: 'Supabase', toolUrl: 'https://supabase.com', icon: Shield },
            { id: 'test', title: 'Quality', description: 'AI debugging', toolName: 'Sentry', toolUrl: 'https://sentry.io', icon: Zap }
        ]
    },

    // --- SOCIAL MEDIA ---
    {
        id: 'linkedin-growth',
        title: 'LinkedIn Growth',
        description: 'Build your professional brand on autopilot.',
        icon: Share2,
        color: 'from-blue-600 to-blue-800',
        steps: [
            { id: 'idea', title: 'Ideas', description: 'Post inspiration', toolName: 'Taplio', toolUrl: 'https://taplio.com', icon: Sparkles },
            { id: 'schedule', title: 'Post', description: 'Carousel maker', toolName: 'Canva', toolUrl: 'https://canva.com', icon: Palette },
            { id: 'engage', title: 'Engage', description: 'Smart replies', toolName: 'Engage AI', toolUrl: 'https://engageai.co', icon: MessageCircle }
        ]
    },
    {
        id: 'presentation',
        title: 'Pitch Decks',
        description: 'Create investor-ready presentations in minutes.',
        icon: Presentation,
        color: 'from-orange-400 to-red-500',
        steps: [
            { id: 'outline', title: 'Story', description: 'Deck narrative', toolName: 'ChatGPT', toolUrl: 'https://chat.openai.com', icon: PenTool },
            { id: 'design', title: 'Slides', description: 'Generate slides', toolName: 'Gamma', toolUrl: 'https://gamma.app', icon: Layers },
            { id: 'refine', title: 'Polish', description: 'Fix design', toolName: 'Beautiful.ai', toolUrl: 'https://beautiful.ai', icon: Palette }
        ]
    }
];
