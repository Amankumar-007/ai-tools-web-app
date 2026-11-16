"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ReactFlow, useNodesState, useEdgesState, MiniMap, Controls,
  Background, BackgroundVariant, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft,
  Clock3, Copy, ExternalLink, LayoutGrid, List, Loader2, Map, Plus,
  Sparkles, Target, X,
} from 'lucide-react';
import { toast } from 'sonner';
import TopicNode from './TopicNode';
import { authFetch } from '@/lib/auth-fetch';

type Resource = { title: string; type?: string; url: string };
type RoadmapStep = {
  id: string; label: string; type?: string; level?: string; description?: string;
  skills?: string[]; projects?: string[]; resources?: Resource[]; outcome?: string;
};
type Roadmap = { title: string; description?: string; level?: string; estimatedTime?: string; nodes: RoadmapStep[]; edges: { id?: string; source: string; target: string }[] };
type Direction = 'TB' | 'LR';

const STORAGE_KEY = 'tomato_roadmap_last_v1';
const examples = [
  { title: 'Full-stack development', detail: 'Build and deploy a real web app', prompt: 'Become a full-stack web developer and build production-ready apps' },
  { title: 'Data analytics', detail: 'Go from spreadsheets to dashboards', prompt: 'Learn data analytics from beginner to job-ready with practical projects' },
  { title: 'AI agents', detail: 'Design useful automated workflows', prompt: 'Learn to build reliable AI agents and automation workflows' },
  { title: 'Product design', detail: 'Research, prototype, and test', prompt: 'Become a product designer with a strong UX portfolio' },
];
const nodeTypes = { topic: TopicNode, checkpoint: TopicNode };

function layoutRoadmap(roadmap: Roadmap, direction: Direction) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction, nodesep: 42, ranksep: 82, marginx: 40, marginy: 40 });
  const nodeWidth = 292;
  const nodeHeight = 200;
  roadmap.nodes.forEach((step) => graph.setNode(String(step.id), { width: nodeWidth, height: nodeHeight }));
  roadmap.edges.forEach((edge) => {
    if (graph.hasNode(String(edge.source)) && graph.hasNode(String(edge.target))) graph.setEdge(String(edge.source), String(edge.target));
  });
  dagre.layout(graph);
  const nodes = roadmap.nodes.map((step, index) => {
    const point = graph.node(String(step.id));
    return {
      id: String(step.id),
      type: step.type === 'checkpoint' ? 'checkpoint' : 'topic',
      position: { x: point.x - nodeWidth / 2, y: point.y - nodeHeight / 2 },
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      data: { ...step, stepNumber: index + 1, direction },
    };
  });
  const ids = new Set(nodes.map((node) => node.id));
  const edges = roadmap.edges.filter((edge) => ids.has(String(edge.source)) && ids.has(String(edge.target))).map((edge, index) => ({
    id: edge.id || `edge-${index}`, source: String(edge.source), target: String(edge.target),
    type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.8 },
  }));
  return { nodes, edges };
}

function roadmapMarkdown(roadmap: Roadmap) {
  return [
    `# ${roadmap.title}`,
    roadmap.description || '',
    `Level: ${roadmap.level || 'All levels'}  |  Estimated time: ${roadmap.estimatedTime || 'Flexible'}`,
    ...roadmap.nodes.flatMap((step, index) => [
      `## ${index + 1}. ${step.label}`,
      step.description || '',
      step.outcome ? `**Outcome:** ${step.outcome}` : '',
      ...(step.skills?.length ? ['**Skills**', ...step.skills.map((item) => `- ${item}`)] : []),
      ...(step.projects?.length ? ['**Projects**', ...step.projects.map((item) => `- ${item}`)] : []),
      ...(step.resources?.length ? ['**Resources**', ...step.resources.map((item) => `- [${item.title}](${item.url})`)] : []),
    ]),
  ].filter(Boolean).join('\n\n');
}

export default function RoadmapGeneratorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [hours, setHours] = useState('5 hours/week');
  const [direction, setDirection] = useState<Direction>('TB');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [flowKey, setFlowKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Roadmap;
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return;
      const layout = layoutRoadmap(parsed, 'TB');
      setRoadmap(parsed);
      setNodes(layout.nodes);
      setEdges(layout.edges);
      setFlowKey((key) => key + 1);
    } catch { /* A damaged saved plan should not prevent a new one. */ }
  }, [setEdges, setNodes]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const selectedStep = useMemo(() => roadmap?.nodes.find((step) => String(step.id) === selectedStepId) || null, [roadmap, selectedStepId]);
  const projectCount = useMemo(() => roadmap?.nodes.reduce((count, step) => count + (step.projects?.length || 0), 0) || 0, [roadmap]);

  const generateRoadmap = async (event: React.FormEvent) => {
    event.preventDefault();
    const goal = prompt.trim();
    if (!goal || isLoading) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch('/api/roadmap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ prompt: `${goal}\nCurrent level: ${level}. Study time available: ${hours}. Make the projects and pacing suitable for this learner.` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate a roadmap. Try again.');
      const next = data.roadmap as Roadmap;
      if (!next || !Array.isArray(next.nodes) || !next.nodes.length || !Array.isArray(next.edges)) throw new Error('The AI returned an incomplete roadmap. Try again.');
      const layout = layoutRoadmap(next, direction);
      setNodes(layout.nodes);
      setEdges(layout.edges);
      setRoadmap(next);
      setSelectedStepId(null);
      setFlowKey((key) => key + 1);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { toast.info('Your plan is ready, but this browser could not save it.'); }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not generate a roadmap. Try again.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsLoading(false);
    }
  };

  const changeDirection = () => {
    if (!roadmap) return;
    const next: Direction = direction === 'TB' ? 'LR' : 'TB';
    const layout = layoutRoadmap(roadmap, next);
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setDirection(next);
    setFlowKey((key) => key + 1);
  };

  const startNew = () => {
    abortRef.current?.abort();
    setRoadmap(null);
    setNodes([]);
    setEdges([]);
    setPrompt('');
    setSelectedStepId(null);
    setShowMobilePanel(false);
    setError('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* The in-memory plan is still cleared. */ }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectStep = (id: string) => { setSelectedStepId(id); setShowMobilePanel(true); };
  const copyPlan = async () => {
    if (!roadmap) return;
    try { await navigator.clipboard.writeText(roadmapMarkdown(roadmap)); toast.success('Roadmap copied'); }
    catch { toast.error('Could not copy the roadmap.'); }
  };
  const downloadPlan = () => {
    if (!roadmap) return;
    const url = URL.createObjectURL(new Blob([roadmapMarkdown(roadmap)], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'roadmap'}.md`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="z-10 shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to home" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"><ArrowLeft size={17} /></Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Map size={18} /></span>
            <div><p className="text-sm font-semibold leading-4">Roadmap Studio</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Turn a goal into a plan</p></div>
          </div>
          {roadmap && <div className="flex items-center gap-2">
            <button type="button" onClick={copyPlan} title="Copy roadmap" aria-label="Copy roadmap" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"><Copy size={16} /></button>
            <button type="button" onClick={downloadPlan} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"><ArrowDownToLine size={16} /> <span className="hidden sm:inline">Export</span></button>
            <button type="button" onClick={startNew} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"><Plus size={16} /> New plan</button>
          </div>}
        </div>
      </header>

      {!roadmap ? <main className="min-h-0 flex-1 overflow-y-auto px-5 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"><Sparkles size={14} /> Your next step starts here</div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">A clear path from <span className="text-blue-600 dark:text-blue-400">curious</span> to capable.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Tell us what you want to learn. Get a visual plan with practical skills, projects, outcomes, and resources for every step.</p>
          <form onSubmit={generateRoadmap} className="mt-9 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <label htmlFor="roadmap-goal" className="block text-sm font-semibold">What do you want to learn?</label>
            <input ref={inputRef} id="roadmap-goal" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={500} placeholder="e.g. Build AI agents, learn Python, become a product designer..." className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">Starting level<select value={level} onChange={(event) => setLevel(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">Time available<select value={hours} onChange={(event) => setHours(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option>2 hours/week</option><option>5 hours/week</option><option>10 hours/week</option><option>20 hours/week</option></select></label>
            </div>
            <button type="submit" disabled={!prompt.trim() || isLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{isLoading ? 'Building your roadmap...' : 'Generate roadmap'}<ArrowRight size={17} /></button>
            {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>
          <div className="mt-10"><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Start with an idea</p><div className="grid gap-3 sm:grid-cols-2">{examples.map((example) => <button key={example.title} type="button" onClick={() => { setPrompt(example.prompt); inputRef.current?.focus(); }} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"><span className="flex items-center justify-between text-sm font-semibold">{example.title}<ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{example.detail}</span></button>)}</div></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1.5"><Target size={14} /> Actionable milestones</span><span className="flex items-center gap-1.5"><Check size={14} /> Hands-on projects</span><span className="flex items-center gap-1.5"><BookOpen size={14} /> Learning resources</span></div>
        </div>
      </main> : <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
          <div className="min-w-0"><h1 className="truncate text-base font-semibold sm:text-lg">{roadmap.title}</h1><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{roadmap.nodes.length} steps · {projectCount} projects · {roadmap.estimatedTime || 'Flexible pace'}</p></div>
          <div className="flex items-center gap-2"><button type="button" onClick={changeDirection} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"><LayoutGrid size={15} /> {direction === 'TB' ? 'Horizontal' : 'Vertical'}</button><button type="button" onClick={() => { setSelectedStepId(null); setShowMobilePanel(true); }} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 lg:hidden"><List size={15} /> Steps</button></div>
        </div>
        {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        <div className="relative flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 bg-[#f8fafc] dark:bg-slate-950">
            <ReactFlow key={flowKey} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodesConnectable={false} nodesDraggable={false} edgesFocusable={false} onNodeClick={(_, node) => selectStep(node.id)} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.18, maxZoom: 1 }} minZoom={0.2} maxZoom={1.5} className="bg-[#f8fafc] dark:bg-slate-950">
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#cbd5e1" />
              <Controls className="!overflow-hidden !rounded-xl !border !border-slate-200 !bg-white !shadow-sm dark:!border-slate-700" />
              <MiniMap pannable zoomable className="!rounded-xl !border !border-slate-200 !bg-white !shadow-sm dark:!border-slate-700" nodeColor={(node) => node.type === 'checkpoint' ? '#f59e0b' : '#3b82f6'} maskColor="rgba(248,250,252,0.7)" />
            </ReactFlow>
          </div>
          <aside className={`${showMobilePanel ? 'absolute inset-0 z-20 flex' : 'hidden'} w-full flex-col overflow-y-auto border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:relative lg:inset-auto lg:flex lg:w-[360px]`} aria-label="Roadmap steps">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"><div><p className="text-sm font-semibold">{selectedStep ? 'Step details' : 'Your learning path'}</p><p className="text-xs text-slate-500 dark:text-slate-400">{selectedStep ? 'What to learn and build' : 'Select a step to see more'}</p></div><button type="button" onClick={() => setShowMobilePanel(false)} aria-label="Close steps" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"><X size={18} /></button></div>
            {selectedStep ? <div className="p-5">
              <button type="button" onClick={() => setSelectedStepId(null)} className="mb-5 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"><ChevronLeft size={15} /> All steps</button>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{selectedStep.level || 'Learning step'}</span>
              <h2 className="mt-3 text-xl font-semibold leading-7">{selectedStep.label}</h2>
              {selectedStep.description && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedStep.description}</p>}
              {selectedStep.outcome && <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Outcome</p><p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">{selectedStep.outcome}</p></div>}
              {selectedStep.skills?.length ? <section className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills to learn</h3><ul className="mt-3 space-y-2">{selectedStep.skills.map((skill, index) => <li key={`${skill}-${index}`} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200"><Check size={15} className="mt-0.5 shrink-0 text-blue-600" />{skill}</li>)}</ul></section> : null}
              {selectedStep.projects?.length ? <section className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Build to practice</h3><ul className="mt-3 space-y-2">{selectedStep.projects.map((project, index) => <li key={`${project}-${index}`} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">{project}</li>)}</ul></section> : null}
              {selectedStep.resources?.length ? <section className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resources</h3><div className="mt-3 space-y-2">{selectedStep.resources.filter((resource) => /^https?:\/\//.test(resource.url)).map((resource, index) => <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"><span className="min-w-0 truncate">{resource.title}</span><ExternalLink size={14} className="shrink-0" /></a>)}</div></section> : null}
            </div> : <div className="p-4"><p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{roadmap.description || 'Work through these steps at your own pace.'}</p><div className="mb-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800"><Clock3 size={13} /> {roadmap.estimatedTime || 'Flexible pace'}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">{roadmap.level || 'All levels'}</span></div><div className="space-y-1">{roadmap.nodes.map((step, index) => <button key={String(step.id)} type="button" onClick={() => selectStep(String(step.id))} className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium leading-5">{step.label}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{step.level || 'Step'}</span></span><ArrowRight size={15} className="mt-1 shrink-0 text-slate-400" /></button>)}</div></div>}
          </aside>
        </div>
      </main>}
    </div>
  );
}
