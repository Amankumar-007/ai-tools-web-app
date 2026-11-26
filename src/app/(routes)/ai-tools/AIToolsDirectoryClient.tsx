'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ExternalLink, Plus, Search, X } from 'lucide-react';
import { ALL_CATEGORIES } from '@/lib/categories';
import { getToolsForCategory } from '@/lib/categoryTools';
import CategoryToolsResults from '@/components/CategoryToolsResults';
import { getCurrentUser, signOut, type User } from '@/lib/supabase';
import { getLogoFallbackChain } from '@/lib/logoHelper';
import MainNavbar from '@/components/MainNavbar';
import styles from './directory.module.css';

export interface Tool {
  id: number;
  slug?: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  speed: 'Fast' | 'Moderate' | 'Slow';
  founded: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  apiAvailable: boolean;
  upvotes?: number;
  trendScore?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  sourceDate?: string;
}

type SortOption = 'recommended' | 'recent' | 'az';
type ViewMode = 'grid' | 'list';
type PricingFilter = 'all' | 'free' | 'freemium' | 'paid';

function ToolLogo({ tool, prominent = false }: { tool: Tool; prominent?: boolean }) {
  const sources = useMemo(() => getLogoFallbackChain(tool.website, tool.logo), [tool.website, tool.logo]);
  const [index, setIndex] = useState(0);

  return (
    <span className={styles.logo} aria-hidden="true">
      {sources[index] ? (
        <img src={sources[index]} alt="" loading={prominent ? 'eager' : 'lazy'} onError={() => setIndex((current) => current + 1)} />
      ) : (
        tool.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function RecommendationResults() {
  const category = useSearchParams().get('category');
  if (!category) return null;
  return (
    <section className={styles.recommendations} aria-label={`Recommendations for ${category}`}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>FOR YOU</span>
          <h2>Recommendations for “{category}”</h2>
        </div>
        <Link href="/ai-tools" className={styles.textLink}>Clear <X size={15} /></Link>
      </div>
      <CategoryToolsResults category={category} />
    </section>
  );
}

export default function AIToolsDirectoryClient({ initialTools, initialFeatured = [], totalCount }: {
  initialTools: Tool[];
  initialFeatured?: Tool[];
  totalCount?: number;
}) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [pricing, setPricing] = useState<PricingFilter>('all');
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [view, setView] = useState<ViewMode>('grid');
  const [compare, setCompare] = useState<Tool[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => { getCurrentUser().then(setUser); }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const featured = useMemo(() => {
    const picked = initialFeatured.length ? initialFeatured : initialTools.filter((tool) => tool.isFeatured);
    return (picked.length ? picked : initialTools).slice(0, 3);
  }, [initialFeatured, initialTools]);

  const matches = (tool: Tool) => {
    const query = search.trim().toLowerCase();
    if (query && !`${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(query)) return false;
    if (pricing !== 'all' && tool.pricing.toLowerCase() !== pricing) return false;
    if (verified && !tool.isVerified) return false;
    return true;
  };

  const filteredTools = useMemo(() => {
    return initialTools.filter(matches);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTools, search, pricing, verified]);

  const availableCategories = useMemo(() => ALL_CATEGORIES.filter((item) =>
    getToolsForCategory(item.slug, initialTools).tools.length > 0
  ), [initialTools]);

  const categories = useMemo(() => availableCategories
    .filter((item) => category === 'all' || item.slug === category)
    .map((item) => ({
      category: item,
      tools: getToolsForCategory(item.slug, filteredTools).tools.sort((a, b) => {
        if (sort === 'az') return a.name.localeCompare(b.name);
        if (sort === 'recent') return (b.sourceDate || '').localeCompare(a.sourceDate || '');
        return 0;
      }),
    }))
    .filter((item) => item.tools.length > 0),
  [availableCategories, category, filteredTools, sort]);

  const visibleToolCount = useMemo(() => new Set(categories.flatMap((item) =>
    item.tools.map((tool) => tool.slug)
  )).size, [categories]);

  const reset = () => { setSearch(''); setCategory('all'); setPricing('all'); setVerified(false); setSort('recommended'); };
  const handleSignOut = async () => { await signOut(); setUser(null); router.push('/'); };
  const handleProtectedLink = (event: MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => {
    event.preventDefault();
    router.push(user ? href : `/login?redirect=${encodeURIComponent(href)}`);
  };
  const toggleCompare = (tool: Tool) => {
    setCompare((current) => {
      if (current.some((item) => item.name === tool.name)) return current.filter((item) => item.name !== tool.name);
      if (current.length === 4) { setNotice('Choose up to four tools to compare.'); return current; }
      return [...current, tool];
    });
  };
  const selected = (tool: Tool) => compare.some((item) => item.name === tool.name);
  const activeFilters = search || category !== 'all' || pricing !== 'all' || verified;

  return (
    <div className={styles.page}>
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />

      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span className={styles.dot} /> THE AI TOOL DIRECTORY <span className={styles.eyebrowDivider}>/</span> {(totalCount || initialTools.length).toLocaleString()} TOOLS</span>
            <h1>Find the right AI tool <em>for the job.</em></h1>
            <p>A simpler way to discover, filter, and compare tools that make your work easier.</p>
          </div>
          <div className={styles.searchBox}>
            <Search size={22} aria-hidden="true" />
            <input ref={searchRef} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tools or tasks..." aria-label="Search AI tools" />
            {search ? <button onClick={() => setSearch('')} aria-label="Clear search"><X size={19} /></button> : <kbd>Ctrl K</kbd>}
          </div>
          <div className={styles.quickLinks} aria-label="Popular categories">
            <span>Explore:</span>
            {['ai-chat-assistant', 'assistant-code', 'image-generators', 'productivity'].map((slug) => {
              const item = ALL_CATEGORIES.find((entry) => entry.slug === slug);
              if (!item) return null;
              return <button key={slug} onClick={() => { setCategory(slug); document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' }); }}>{item.name} <ArrowUpRight size={13} /></button>;
            })}
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.recommendationWrap}><RecommendationResults /></div>
          {!activeFilters && featured.length > 0 && (
            <section className={styles.featuredSection} aria-labelledby="featured-heading">
              <div className={styles.sectionHeading}>
                <div><span className={styles.eyebrow}>A GOOD PLACE TO START</span><h2 id="featured-heading">Featured tools</h2></div>
                <span className={styles.sectionNote}>A few standouts from the directory</span>
              </div>
              <div className={styles.featuredGrid}>
                {featured.map((tool, index) => (
                  <article key={`${tool.name}-${index}`} className={styles.featuredCard}>
                    <div className={styles.featuredArtwork}>
                      <span className={styles.featuredNumber}>0{index + 1} / FEATURED</span>
                      <ToolLogo tool={tool} prominent />
                      <span className={styles.featuredDecoration} aria-hidden="true">✳</span>
                    </div>
                    <div className={styles.featuredDetails}>
                      <span className={styles.featuredCategory}>{tool.category}</span>
                      <h3><Link href={tool.slug ? `/ai-tools/${tool.slug}` : tool.website}>{tool.name}</Link></h3>
                      <p>{tool.description}</p>
                      <div className={styles.featuredBottom}><span>{tool.pricing}</span><a href={tool.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${tool.name}`}><ArrowUpRight size={20} /></a></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section id="directory" className={styles.directory} aria-labelledby="directory-heading">
            <div className={styles.sectionHeading}>
              <div><span className={styles.eyebrow}>BROWSE THE COLLECTION</span><h2 id="directory-heading">Explore by category<span className={styles.headingCount}>{categories.length}</span></h2></div>
              <span className={styles.sectionNote}>{visibleToolCount.toLocaleString()} matching tools</span>
            </div>
            <div className={styles.toolbar}>
              <label className={styles.selectWrap}><span className={styles.srOnly}>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{availableCategories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><ChevronDown size={16} /></label>
              <label className={styles.selectWrap}><span className={styles.srOnly}>Pricing</span><select value={pricing} onChange={(event) => setPricing(event.target.value as PricingFilter)}><option value="all">Any pricing</option><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option></select><ChevronDown size={16} /></label>
              <label className={styles.verified}><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} /> Source checked</label>
              <label className={`${styles.selectWrap} ${styles.sortSelect}`}><span className={styles.srOnly}>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="recommended">Recommended</option><option value="recent">Recently updated</option><option value="az">Name A–Z</option></select><ChevronDown size={16} /></label>
              <div className={styles.viewToggle} aria-label="View mode"><button onClick={() => setView('grid')} className={view === 'grid' ? styles.selectedView : ''} aria-label="Grid view" aria-pressed={view === 'grid'}>▦</button><button onClick={() => setView('list')} className={view === 'list' ? styles.selectedView : ''} aria-label="List view" aria-pressed={view === 'list'}>☷</button></div>
              {activeFilters && <button className={styles.clearButton} onClick={reset}>Clear filters <X size={14} /></button>}
            </div>

            {categories.length === 0 ? <div className={styles.empty}><Search size={28} /><h3>No tools found</h3><p>Try a different search or clear your filters.</p><button onClick={reset}>Clear filters <ArrowRight size={16} /></button></div> :
              <div className={view === 'grid' ? styles.categoryGrid : styles.categoryList}>
                {categories.map(({ category: item, tools }) => (
                  <article key={item.slug} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}><div><span className={styles.categoryIndex}>{String(ALL_CATEGORIES.indexOf(item) + 1).padStart(2, '0')} / CATEGORY</span><h3>{item.name}</h3></div><span className={styles.categoryCount}>{tools.length}</span></div>
                    <p className={styles.categoryDescription}>{item.description}</p>
                    <div className={styles.toolList}>{tools.slice(0, 8).map((tool, index) => (
                      <div key={`${tool.name}-${index}`} className={styles.toolRow}>
                        <ToolLogo tool={tool} />
                        <div className={styles.toolInfo}><Link href={tool.slug ? `/ai-tools/${tool.slug}` : tool.website}>{tool.name}</Link><span>{tool.pricing}</span></div>
                        <button className={selected(tool) ? styles.compareSelected : styles.compareButton} onClick={() => toggleCompare(tool)} aria-label={`${selected(tool) ? 'Remove' : 'Add'} ${tool.name} ${selected(tool) ? 'from' : 'to'} comparison`} title={selected(tool) ? 'Remove from comparison' : 'Add to comparison'}>{selected(tool) ? <Check size={16} /> : <Plus size={16} />}</button>
                        <a className={styles.visitButton} href={tool.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${tool.name}`}><ExternalLink size={15} /></a>
                      </div>
                    ))}</div>
                    <Link className={styles.categoryFooter} href={`/ai-tools/category/${item.slug}`}>View all {item.name} tools <ArrowRight size={16} /></Link>
                  </article>
                ))}
              </div>}
          </section>
        </div>
      </main>

      {compare.length > 0 && <div className={styles.compareDock} role="region" aria-label="Compare selected tools"><div className={styles.compareInner}><div><strong>Compare tools <span>{compare.length}/4</span></strong><p>{compare.map((tool) => tool.name).join(', ')}</p></div><div className={styles.compareActions}><button onClick={() => setCompare([])}>Clear</button><button disabled={compare.length < 2} onClick={() => router.push(`/ai-tools/analyze?names=${encodeURIComponent(compare.map((tool) => tool.name).join(','))}`)}>Compare now <ArrowRight size={16} /></button></div></div></div>}
      {notice && <div className={styles.notice} role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14} /></button></div>}
    </div>
  );
}
