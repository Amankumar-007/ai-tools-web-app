"use client";

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './comic-theme.css';
import { Sparkles, Map, MessageSquare, X, Loader2, Zap, Target } from 'lucide-react';
import dagre from 'dagre';
import TopicNode from './TopicNode';
import { authFetch } from "@/lib/auth-fetch";

const nodeTypes = {
  topic: TopicNode,
  checkpoint: TopicNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Increased spacing for a cleaner, modern layout
  const nodeWidth = 320;
  const nodeHeight = 200;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const roundedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: roundedNodes, edges };
};

export default function RoadmapGeneratorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isFloatingInputOpen, setIsFloatingInputOpen] = useState(false);

  // Sample data matching the image structure
  const sampleData = {
    nodes: [
      {
        id: '1',
        type: 'topic',
        data: { 
          label: 'cars going too fast in my neighborhood', 
          category: 'problem',
          description: ''
        }
      },
      {
        id: '2',
        type: 'topic',
        data: { 
          label: 'bottom of hill has intersection but no legal need to stop', 
          category: 'cause',
          description: ''
        }
      },
      {
        id: '3',
        type: 'topic',
        data: { 
          label: 'people get places faster', 
          category: 'benefit',
          description: ''
        }
      },
      {
        id: '4',
        type: 'topic',
        data: { 
          label: 'pedestrians might get hit', 
          category: 'detriment',
          description: ''
        }
      },
      {
        id: '5',
        type: 'topic',
        data: { 
          label: 'legally requires people to stop at bottom of hill', 
          category: 'benefit',
          description: ''
        }
      },
      {
        id: '6',
        type: 'topic',
        data: { 
          label: 'significantly reduces traffic throughput', 
          category: 'detriment',
          description: ''
        }
      },
      {
        id: '7',
        type: 'topic',
        data: { 
          label: 'stop sign at intersection', 
          category: 'solution',
          description: ''
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        label: 'causes'
      },
      {
        id: 'e2-1',
        source: '2',
        target: '1',
        label: 'created by'
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        label: 'creates'
      },
      {
        id: 'e1-4',
        source: '1',
        target: '4',
        label: 'creates'
      },
      {
        id: 'e7-5',
        source: '7',
        target: '5',
        label: 'creates'
      },
      {
        id: 'e7-6',
        source: '7',
        target: '6',
        label: 'creates'
      },
      {
        id: 'e7-1',
        source: '7',
        target: '1',
        label: 'addresses'
      }
    ]
  };

  // Initialize with sample data
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      sampleData.nodes, 
      sampleData.edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        labelStyle: { fill: '#64748b', fontSize: 12 }
      }))
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setHasGenerated(true);
  }, []);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setHasGenerated(false);

    try {
      const res = await authFetch('/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      const roadmap = data.roadmap;

      const initialNodes = roadmap.nodes.map((n: any) => ({
        id: n.id,
        type: n.type || 'topic',
        data: {
          label: n.label,
          description: n.description,
          resources: n.resources,
          type: n.type
        },
        position: { x: 0, y: 0 } 
      }));

      const initialEdges = roadmap.edges.map((e: any, idx: number) => ({
        id: e.id || `e${idx}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep', // Modern curved angles
        animated: true,
        style: { stroke: '#cbd5e1', strokeWidth: 2 }, // Soft slate color
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setHasGenerated(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-slate-900 relative overflow-hidden">
      {/* Clean Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white z-10 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Map className="w-5 h-5" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
            RoadmapAI
          </h1>
        </div>

        <form onSubmit={generateRoadmap} className="flex-1 max-w-2xl w-full flex items-center gap-3 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. Rust, Next.js)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full pl-5 pr-32 py-2.5 bg-slate-100 border border-transparent rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </form>
      </header>

      <main className="flex-1 relative bg-white">
        {/* Clean Empty State */}
        {!hasGenerated && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <div className="max-w-md flex flex-col items-center">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-300">
                <Map className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Design your learning path</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter a topic above to generate a structured, step-by-step roadmap tailored to your goals.
              </p>
            </div>
          </div>
        )}

        {/* Clean Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-white/80 backdrop-blur-sm transition-all duration-500">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" strokeWidth={2.5} />
              <p className="text-slate-700 font-medium text-sm">Generating your roadmap...</p>
            </div>
          </div>
        )}

        {/* Clean Error State */}
        {error && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-red-200 p-4 rounded-2xl z-30 shadow-lg shadow-red-100/50 flex items-center gap-3 max-w-md w-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-sm text-slate-700 font-medium">{error}</p>
          </div>
        )}

        {hasGenerated && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-white"
            minZoom={0.2}
            maxZoom={1.5}
          >
            {/* Clean dot pattern */}
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#cbd5e1" />
            
            <Controls 
              className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden [&>button]:border-b [&>button]:border-slate-100 [&>button]:text-slate-600 [&>button]:hover:bg-slate-50" 
            />
            
            <MiniMap
              className="bg-white border border-slate-200 shadow-sm rounded-xl"
              nodeColor={(node) => {
                if (node.type === 'checkpoint') return '#10b981'; 
                return '#3b82f6'; 
              }}
              maskColor="rgba(248, 250, 252, 0.7)" 
              nodeBorderRadius={8}
            />
          </ReactFlow>
        )}
      </main>
    </div>
  );
}