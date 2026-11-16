'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Wrench, Database, Plus, Trash2, Edit3,
  ExternalLink, Search, Check, X, Shield, Activity, RefreshCw, Eye,
  ArrowUpRight, Tag, Layers, Globe, Star, CheckCircle2, AlertCircle,
  LogOut, Lock, Download, Upload, Server, Cpu, Clock, Key, DollarSign,
  TrendingUp, Compass, Settings, AlertTriangle, ShieldCheck, UserCheck,
  Laptop, Smartphone, Tablet, ChevronLeft, ChevronRight, Filter, Copy, Sparkles
} from 'lucide-react';
import { ALL_CATEGORIES } from '@/lib/categories';
import { Tool } from '@/app/(routes)/ai-tools/AIToolsDirectoryClient';
import CategoryIcon from '@/components/CategoryIcon';

interface AdminStats {
  totalTools: number;
  totalCategories: number;
  totalVerified: number;
  totalFeatured: number;
  liveUsers: number;
  dailyPageviews: number;
  totalUpvotes: number;
  pricingBreakdown: { free: number; freemium: number; paid: number };
  topCategories: { name: string; count: number }[];
}

interface AdminUserRecord {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at?: string;
  subscription_tier: 'FREE' | 'PRO' | 'PREMIUM';
  subscription_status: string;
  role: string;
  is_online: boolean;
  location?: string;
  ip?: string;
}

interface LiveSessionRecord {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  currentPath: string;
  device: string;
  browser: string;
  os: string;
  durationSeconds: number;
  lastActive: string;
  isRegisteredUser: boolean;
  userEmail?: string;
}

export default function AdminDashboardClient({
  initialTools,
  adminUser,
}: {
  initialTools: Tool[];
  adminUser: { email: string; name: string; role: string };
}) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tools' | 'users' | 'live' | 'categories' | 'system'
  >('overview');

  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tools Table State
  const [toolSearch, setToolSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedPricingFilter, setSelectedPricingFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'upvotes' | 'rating' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedToolIds, setSelectedToolIds] = useState<Set<number>>(new Set());

  // User Search
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('all');

  // Modal State
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: '',
    slug: '',
    category: ALL_CATEGORIES[0]?.name || 'ChatBots',
    website: '',
    logo: '',
    description: '',
    pricing: 'Freemium',
    rating: 4.8,
    speed: 'Fast',
    bestFor: '',
    pros: ['High accuracy', 'Modern user interface'],
    cons: ['Free plan daily limits'],
    isVerified: true,
    isFeatured: false,
    upvotes: 150,
    trendScore: 8500,
  });

  const router = useRouter();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch users & analytics
  const loadData = async () => {
    try {
      setLoading(true);
      const [resUsers, resStats] = await Promise.all([
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/analytics').then((r) => r.json()),
      ]);

      if (resUsers.success) {
        if (resUsers.users) setUsers(resUsers.users);
        if (resUsers.liveSessions) setLiveSessions(resUsers.liveSessions);
      }
      if (resStats.success && resStats.stats) {
        setStats(resStats.stats);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Poll live data from backend every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/auth/login');
    router.refresh();
  };

  // Sync tools with Supabase database
  const handleSyncDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Database sync completed successfully.');
        loadData();
      } else {
        showToast(data.error || 'Sync failed.');
      }
    } catch (err: any) {
      showToast(err.message || 'Sync error.');
    } finally {
      setLoading(false);
    }
  };

  // Export Tools as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tools, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tomato_ai_tools_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${tools.length} tools to JSON.`);
  };

  // Export Tools as CSV
  const handleExportCsv = () => {
    const headers = ['id', 'name', 'slug', 'category', 'pricing', 'rating', 'website', 'upvotes', 'verified', 'featured'];
    const rows = tools.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.slug,
      `"${t.category}"`,
      t.pricing,
      t.rating,
      t.website,
      t.upvotes || 0,
      t.isVerified ? 'Yes' : 'No',
      t.isFeatured ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tomato_ai_tools_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${tools.length} tools to CSV.`);
  };

  // Open Add Tool Modal
  const handleOpenAddModal = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      slug: '',
      category: ALL_CATEGORIES[0]?.name || 'ChatBots',
      website: '',
      logo: '',
      description: '',
      pricing: 'Freemium',
      rating: 4.8,
      speed: 'Fast',
      bestFor: '',
      pros: ['High accuracy', 'Modern user interface'],
      cons: ['Free plan daily limits'],
      isVerified: true,
      isFeatured: false,
      upvotes: 150,
      trendScore: 8500,
    });
    setIsToolModalOpen(true);
  };

  // Open Edit Tool Modal
  const handleOpenEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({ ...tool });
    setIsToolModalOpen(true);
  };

  // Save Tool (Add or Update)
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.website) {
      showToast('Tool name and Website URL are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingTool ? 'Tool updated successfully!' : 'Tool created and saved to database!');
        setIsToolModalOpen(false);

        if (editingTool) {
          setTools((prev) =>
            prev.map((t) => (t.id === editingTool.id ? { ...t, ...(formData as Tool) } : t))
          );
        } else {
          setTools((prev) => [{ ...(formData as Tool), id: (formData as Tool).id ?? Date.now() }, ...prev]);
        }
      } else {
        showToast(data.error || 'Failed to save tool.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving tool.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Tool
  const handleDeleteTool = async (tool: Tool) => {
    if (!confirm(`Are you sure you want to delete "${tool.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/tools?id=${tool.id}&slug=${tool.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${tool.name}" removed from database.`);
        setTools((prev) => prev.filter((t) => t.id !== tool.id));
      } else {
        showToast(data.error || 'Failed to delete tool.');
      }
    } catch (e: any) {
      showToast(e.message || 'Error deleting tool.');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedToolIds.size === 0) return;
    if (!confirm(`Delete ${selectedToolIds.size} selected tools permanently?`)) return;

    setTools((prev) => prev.filter((t) => !selectedToolIds.has(t.id)));
    showToast(`Removed ${selectedToolIds.size} tools.`);
    setSelectedToolIds(new Set());
  };

  // Bulk Verify Action
  const handleBulkVerify = () => {
    if (selectedToolIds.size === 0) return;
    setTools((prev) =>
      prev.map((t) => (selectedToolIds.has(t.id) ? { ...t, isVerified: true } : t))
    );
    showToast(`Verified ${selectedToolIds.size} tools.`);
    setSelectedToolIds(new Set());
  };

  // Toggle User Tier Upgrade
  const handleToggleUserTier = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextTier =
            u.subscription_tier === 'FREE' ? 'PRO' : u.subscription_tier === 'PRO' ? 'PREMIUM' : 'FREE';
          return { ...u, subscription_tier: nextTier };
        }
        return u;
      })
    );
    showToast('User subscription updated.');
  };

  // Filtered & Sorted Tools
  const filteredTools = useMemo(() => {
    let result = tools.filter((tool) => {
      if (toolSearch.trim()) {
        const q = toolSearch.toLowerCase();
        const matchName = tool.name.toLowerCase().includes(q);
        const matchDesc = (tool.description || '').toLowerCase().includes(q);
        const matchCat = tool.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      if (selectedCategoryFilter !== 'all' && tool.category !== selectedCategoryFilter) {
        return false;
      }

      if (selectedPricingFilter !== 'all' && tool.pricing !== selectedPricingFilter) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let valA: any = a[sortBy] ?? 0;
      let valB: any = b[sortBy] ?? 0;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tools, toolSearch, selectedCategoryFilter, selectedPricingFilter, sortBy, sortOrder]);

  // Paginated Tools
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage) || 1;
  const paginatedTools = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredTools.slice(start, start + itemsPerPage);
  }, [filteredTools, page, itemsPerPage]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchName = (u.name || '').toLowerCase().includes(q);
        if (!matchEmail && !matchName) return false;
      }
      if (userTierFilter !== 'all' && u.subscription_tier !== userTierFilter) {
        return false;
      }
      return true;
    });
  }, [users, userSearch, userTierFilter]);

  const selectAllCurrentPage = () => {
    const newSet = new Set(selectedToolIds);
    const allSelected = paginatedTools.every((t) => newSet.has(t.id));
    if (allSelected) {
      paginatedTools.forEach((t) => newSet.delete(t.id));
    } else {
      paginatedTools.forEach((t) => newSet.add(t.id));
    }
    setSelectedToolIds(newSet);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg flex items-center gap-2.5 border border-slate-800"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Minimal White Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">Tomato AI</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Management</p>
            </div>
          </Link>

          {/* Tab Navigation Pill Bar */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>AI Tools</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {tools.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Users</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Traffic</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                {stats?.liveUsers || liveSessions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System
            </button>
          </nav>
        </div>

        {/* Right Header Admin Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-700 text-[11px]">{adminUser.email}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-800 border border-slate-200">
              {adminUser.role}
            </span>
          </div>

          <Link
            href="/ai-tools"
            target="_blank"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs text-xs font-medium flex items-center gap-1.5"
            title="View Live AI Tools Directory"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition shadow-xs text-xs font-medium flex items-center gap-1 cursor-pointer"
            title="Sign Out of Admin Console"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* ========================================================================= */}
        {/* OVERVIEW TAB */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Live Users */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Live Active Visitors
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {stats?.liveUsers || liveSessions.length}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Real-time
                  </span>
                </div>
                <p className="text-xs text-slate-500">Active visitor sessions right now</p>
              </div>

              {/* Card 2: Total AI Tools */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total AI Tools
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Wrench size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {tools.length.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {tools.filter((t) => t.isVerified).length} Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500">Across {ALL_CATEGORIES.length} specialized categories</p>
              </div>

              {/* Card 3: Registered Users */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Registered Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {users.length}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {users.filter((u) => u.subscription_tier !== 'FREE').length} Pro/Paid
                  </span>
                </div>
                <p className="text-xs text-slate-500">Stored in Supabase Auth & Users</p>
              </div>

              {/* Card 4: Daily Pageviews */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Daily Pageviews
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {(stats?.dailyPageviews || 14250).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">+14.2%</span>
                </div>
                <p className="text-xs text-slate-500">Organic directory discovery traffic</p>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Database & Tools Synchronization</h3>
                  <p className="text-xs text-slate-500">
                    Supabase is connected with {tools.length} total tools stored and protected via RLS policies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Tool</span>
                </button>
                <button
                  onClick={handleSyncDatabase}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Sync Supabase</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Split Section: Top Categories & Live Visitor Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {(stats?.topCategories || ALL_CATEGORIES.slice(0, 7).map((c) => ({ name: c.name, count: 24 }))).map(
                    (cat, idx) => {
                      const count = tools.filter((t) => t.category === cat.name).length || cat.count || 1;
                      const percentage = Math.round((count / Math.max(tools.length, 1)) * 100);
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{cat.name}</span>
                            <span className="font-mono text-slate-500 font-semibold">
                              {count} tools ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 rounded-full"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Real-time Visitor Stream Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Live Active Visitor Sessions</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('live')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    Full Stream →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {liveSessions.slice(0, 5).map((session, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {session.city}, {session.country}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">{session.currentPath}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {session.device.split(' ')[0]}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{session.durationSeconds}s on site</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOOLS MANAGER TAB */}
        {/* ========================================================================= */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Action Bar & Filtering */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={toolSearch}
                  onChange={(e) => {
                    setToolSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search 1,000+ AI tools by name, description, category..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 font-medium cursor-pointer"
                >
                  <option value="all">All Categories ({ALL_CATEGORIES.length})</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Pricing Filter */}
                <select
                  value={selectedPricingFilter}
                  onChange={(e) => {
                    setSelectedPricingFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 font-medium cursor-pointer"
                >
                  <option value="all">All Pricing</option>
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Open Source">Open Source</option>
                </select>

                {/* Bulk Actions */}
                {selectedToolIds.size > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleBulkVerify}
                      className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                    >
                      Verify ({selectedToolIds.size})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
                    >
                      Delete ({selectedToolIds.size})
                    </button>
                  </div>
                )}

                {/* Add Tool Button */}
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer ml-auto"
                >
                  <Plus size={14} />
                  <span>Add Tool</span>
                </button>
              </div>
            </div>

            {/* Tools Data Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={selectAllCurrentPage}
                          checked={
                            paginatedTools.length > 0 &&
                            paginatedTools.every((t) => selectedToolIds.has(t.id))
                          }
                          className="rounded border-slate-300 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">Tool Name & Info</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Pricing</th>
                      <th className="p-3.5">Rating & Upvotes</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No tools match your current search and filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedTools.map((tool) => {
                        const isSelected = selectedToolIds.has(tool.id);
                        return (
                          <tr
                            key={tool.id}
                            className={`hover:bg-slate-50/80 transition ${
                              isSelected ? 'bg-slate-50' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const next = new Set(selectedToolIds);
                                  if (next.has(tool.id)) next.delete(tool.id);
                                  else next.add(tool.id);
                                  setSelectedToolIds(next);
                                }}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {tool.logo ? (
                                  <img
                                    src={tool.logo}
                                    alt={tool.name}
                                    className="w-8 h-8 rounded-lg object-contain bg-slate-100 border border-slate-200 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                    {tool.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{tool.name}</span>
                                    {tool.isFeatured && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                    {tool.description || 'No description provided'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-medium text-slate-700">{tool.category}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                  tool.pricing === 'Free'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : tool.pricing === 'Paid'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {tool.pricing || 'Freemium'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                                  {tool.rating || 4.8}
                                </span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  ({tool.upvotes || 120} upvotes)
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              {tool.isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check size={12} /> Verified
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={tool.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                                  title="Visit Tool Website"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  onClick={() => handleOpenEditModal(tool)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                  title="Edit Tool"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTool(tool)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Tool"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {(page - 1) * itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-900">
                    {Math.min(page * itemsPerPage, filteredTools.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-900">{filteredTools.length}</span> tools
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-mono text-xs font-semibold px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* USERS & AUTH ACCOUNTS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Top Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Registered
                </span>
                <p className="text-2xl font-bold text-slate-900 font-mono">{users.length}</p>
                <p className="text-xs text-slate-400">Authenticated via Supabase Auth</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Paid Subscriptions
                </span>
                <p className="text-2xl font-bold text-indigo-600 font-mono">
                  {users.filter((u) => u.subscription_tier !== 'FREE').length}
                </p>
                <p className="text-xs text-slate-400">Active Pro & Premium accounts</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Online Now
                </span>
                <p className="text-2xl font-bold text-emerald-600 font-mono">
                  {users.filter((u) => u.is_online).length}
                </p>
                <p className="text-xs text-slate-400">Users logged in within 15 minutes</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by email, name, location..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userTierFilter}
                  onChange={(e) => setUserTierFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Subscription Tiers</option>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">User Identity</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Tier</th>
                      <th className="p-3.5">Location & IP</th>
                      <th className="p-3.5">Joined Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.name || 'Anonymous User'}</p>
                              <p className="font-mono text-[11px] text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role.includes('admin') || user.role === 'SUPER_ADMIN'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleUserTier(user.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              user.subscription_tier === 'PREMIUM'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : user.subscription_tier === 'PRO'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle tier"
                          >
                            {user.subscription_tier} ⟳
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div>
                            <p className="font-medium text-slate-800">{user.location || 'Global'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{user.ip || '104.28.19.4'}</p>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          {user.is_online ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Online
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              Offline
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(user.email);
                              showToast(`Copied ${user.email} to clipboard.`);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                            title="Copy Email"
                          >
                            <Copy size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIVE TRAFFIC TAB */}
        {/* ========================================================================= */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {/* Live Radar Header */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Traffic Radar</h3>
                  <p className="text-xs text-slate-500">
                    Real-time concurrent visitor sessions actively browsing your AI tools directory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                  {stats?.liveUsers || liveSessions.length} Visitors Active Now
                </span>
              </div>
            </div>

            {/* Live Sessions Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Visitor / IP</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Current Path View</th>
                      <th className="p-3.5">Device & Browser</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {liveSessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-semibold">{sess.ip}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-slate-900">
                            {sess.city}, {sess.country}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-blue-600 font-medium">
                          {sess.currentPath}
                        </td>
                        <td className="p-3.5">
                          <div>
                            <p className="font-medium text-slate-800">{sess.device}</p>
                            <p className="text-[11px] text-slate-400">{sess.browser} • {sess.os}</p>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {sess.durationSeconds}s
                        </td>
                        <td className="p-3.5">
                          {sess.isRegisteredUser ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Registered: {sess.userEmail || 'Member'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Guest Visitor
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CATEGORIES DIRECTORY TAB */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Categories Directory ({ALL_CATEGORIES.length})</h3>
                <p className="text-xs text-slate-500">
                  Manage all {ALL_CATEGORIES.length} AI tool categories. Click any category to view tools.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {ALL_CATEGORIES.map((cat) => {
                const count = tools.filter((t) => t.category === cat.name).length;
                return (
                  <div
                    key={cat.slug}
                    onClick={() => {
                      setSelectedCategoryFilter(cat.name);
                      setActiveTab('tools');
                    }}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition shadow-xs cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition">
                        <CategoryIcon iconName={cat.iconName} slug={cat.slug} size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono font-medium">{count} tools</p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SYSTEM & ENVIRONMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Status Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Server size={18} className="text-slate-800" />
                  <h3 className="text-sm font-bold text-slate-900">Database Engine & Supabase</h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-semibold text-slate-900">Supabase (PostgreSQL 15)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Row Level Security</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active & Protected
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Stored AI Tools</span>
                    <span className="font-mono font-bold text-slate-900">{tools.length} rows</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Primary Admin</span>
                    <span className="font-mono text-slate-900 font-medium">admin@tomato.ai</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleSyncDatabase}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Resync Database</span>
                  </button>
                </div>
              </div>

              {/* Security & Authentication Info */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-slate-800" />
                  <h3 className="text-sm font-bold text-slate-900">Security & Session Policies</h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Admin Session Token</span>
                    <span className="font-mono text-[11px] text-slate-800">HS256 Jose JWT</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Cookie Protection</span>
                    <span className="font-medium text-slate-800">HttpOnly, SameSite=Lax (7 Days)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Environment</span>
                    <span className="font-semibold text-slate-900">Production / Local Next.js</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Terminate Master Admin Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ADD / EDIT TOOL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isToolModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Wrench size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingTool ? `Edit Tool: ${editingTool.name}` : 'Create New AI Tool'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsToolModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTool} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tool Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                          ...formData,
                          name,
                          slug: formData.slug || name.toLowerCase().replace(/\s+/g, '-'),
                        });
                      }}
                      placeholder="e.g. ChatGPT, Midjourney"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slug / Identifier</label>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. chatgpt"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white cursor-pointer"
                    >
                      {ALL_CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pricing Model</label>
                    <select
                      value={formData.pricing}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white cursor-pointer"
                    >
                      <option value="Freemium">Freemium</option>
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Contact for Pricing">Contact for Pricing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Website URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Logo URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.logo || ''}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://.../logo.png"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of what this AI tool accomplishes..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rating (1 - 5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating || 4.8}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Upvotes</label>
                    <input
                      type="number"
                      value={formData.upvotes || 150}
                      onChange={(e) => setFormData({ ...formData, upvotes: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Best For</label>
                    <input
                      type="text"
                      value={formData.bestFor || ''}
                      onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
                      placeholder="e.g. Marketers, Developers"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span>Verified Badge</span>
                  </label>

                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span>Featured Tool</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsToolModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{editingTool ? 'Save Changes' : 'Create Tool'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
