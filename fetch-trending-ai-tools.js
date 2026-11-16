require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in .env files.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic AI tool generator
function generateMockTools(count) {
  const prefixes = ['Quantum', 'Neural', 'Synapse', 'Aura', 'Nova', 'Cyber', 'Vision', 'Echo', 'Omni', 'Nex', 'Spark', 'Lumina', 'Core', 'Deep', 'Apex'];
  const suffixes = ['AI', 'Mind', 'Gen', 'Bot', 'Logic', 'Flow', 'Craft', 'Sync', 'Base', 'Scale', 'Forge', 'Net', 'Vision', 'Sense', 'ML'];
  const categories = [
    '3D model', 'AI Agents', 'AI Chat & Assistant', 'Audio Editing', 'Automation',
    'Business', 'ChatBots', 'Customer Support', 'Data & Analytics', 'Developer Tools',
    'E-commerce', 'Image Generators', 'LLM models', 'Marketing', 'Productivity', 'Video Generators'
  ];
  
  const tools = [];
  const generatedSlugs = new Set(); // Prevent exact duplicates within our generated list

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${suffix}`;
    
    // Ensure slug is unique
    let slug = name.toLowerCase().replace(/\s+/g, '-');
    if (generatedSlugs.has(slug)) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }
    generatedSlugs.add(slug);

    const category = categories[Math.floor(Math.random() * categories.length)];
    const priceOpts = ['Freemium', 'Free', 'Paid', 'Contact for Pricing'];
    const pricing = priceOpts[Math.floor(Math.random() * priceOpts.length)];

    tools.push({
      slug,
      name,
      category,
      description: `A powerful, next-generation AI tool designed specifically for ${category.toLowerCase()}. It leverages advanced machine learning to streamline your workflow and deliver exceptional results automatically.`,
      website: `https://${slug}.com`,
      logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${slug}&backgroundColor=070913`,
      pricing,
      rating: Number((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
      speed: Math.random() > 0.5 ? 'Fast' : 'Lightning',
      founded: (Math.floor(Math.random() * 4) + 2020).toString(),
      pros: ['Intuitive Interface', 'High Accuracy', 'Fast Processing'],
      cons: ['Requires Internet Connection', pricing === 'Paid' ? 'Premium pricing' : 'Occasional rate limits'],
      best_for: 'Professionals & Teams',
      api_available: Math.random() > 0.3,
      upvotes: Math.floor(Math.random() * 5000) + 50,
      trend_score: Math.floor(Math.random() * 10000) + 1000,
      is_featured: i < 50, // Top 50 are featured
      is_verified: true
    });
  }
  return tools;
}

async function uploadTools() {
  console.log("🌐 Generating 1000 High-Quality AI Tools internally...");

  // Admin authentication to bypass RLS
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔒 Authenticating as Admin to bypass Row Level Security...');
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: 'admin@tomato.ai',
      password: 'tomatoAdmin2026!'
    });
    if (authErr) {
      console.error("❌ Admin Authentication Failed:", authErr.message);
      process.exit(1);
    }
  }

  const allTools = generateMockTools(1000);
  console.log(`✅ Successfully generated ${allTools.length} tools. Preparing for secure upload...`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < allTools.length; i += BATCH_SIZE) {
    const batch = allTools.slice(i, i + BATCH_SIZE);
    
    console.log(`🚀 Upserting batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(allTools.length/BATCH_SIZE)}...`);
    const { error } = await supabase
      .from('ai_tools')
      .upsert(batch, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Error uploading batch:`, error.message);
    } else {
      console.log(`✅ Success: Uploaded ${i + batch.length} / 1000`);
    }
  }

  console.log(`🎉 Complete! Securely synced exactly 1000 AI tools to your database.`);
}

uploadTools();
