'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useZettelStore } from '@/lib/store';
import { GraphNode } from '@/types/zettel';
import { RefreshCw, ZoomIn, ZoomOut, Zap } from 'lucide-react';

// Dynamically import ForceGraph2D to prevent SSR hydration errors
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-cyan-400/60 font-mono text-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mr-3"></div>
      Inisialisasi Neural Force Field...
    </div>
  ),
});

export default function NeuralGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const {
    getGraphData,
    activeNoteId,
    setActiveNoteId,
    selectedNodeIds,
    toggleNodeSelection,
    synapticThreshold,
    setSynapticThreshold,
  } = useZettelStore();

  const graphData = getGraphData();

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Center on active node when it changes
  useEffect(() => {
    if (activeNoteId && fgRef.current) {
      const node = graphData.nodes.find((n) => n.id === activeNoteId);
      if (node && node.x !== undefined && node.y !== undefined) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.5, 800);
      }
    }
  }, [activeNoteId]);

  const handleNodeClick = useCallback(
    (node: any, event: MouseEvent) => {
      if (event.shiftKey) {
        toggleNodeSelection(node.id);
      } else {
        setActiveNoteId(node.id);
      }
    },
    [setActiveNoteId, toggleNodeSelection]
  );

  const renderCustomNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isActive = node.id === activeNoteId;
      const isSelected = selectedNodeIds.includes(node.id);
      const isHovered = hoveredNode?.id === node.id;
      const radius = node.val || 5;

      // 1. Glowing Aura (Halo)
      if (isActive || isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * (isActive ? 2.2 : 1.6), 0, 2 * Math.PI, false);
        ctx.fillStyle = isActive
          ? 'rgba(6, 182, 212, 0.35)'
          : isSelected
          ? 'rgba(168, 85, 247, 0.4)'
          : 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      }

      // 2. Node Core Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color || '#38bdf8';
      ctx.shadowColor = node.color || '#38bdf8';
      ctx.shadowBlur = isActive || isHovered ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 3. Selection / Active Ring
      if (isActive || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isActive ? '#06b6d4' : '#c084fc';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // 4. Label text (visible when zoomed in or active/hovered)
      if (globalScale > 1.2 || isActive || isHovered) {
        const label = node.title || node.id;
        const fontSize = Math.max(10 / globalScale, 3);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text background pill
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.fillRect(
          node.x - textWidth / 2 - 3,
          node.y + radius + 4,
          textWidth + 6,
          fontSize + 4
        );

        ctx.fillStyle = isActive ? '#38bdf8' : '#e2e8f0';
        ctx.fillText(label, node.x, node.y + radius + fontSize / 2 + 5);
      }
    },
    [activeNoteId, selectedNodeIds, hoveredNode]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#030712] overflow-hidden select-none">
      {/* Background Neural Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(n: any) => `${n.title} (${n.cluster})`}
        nodeCanvasObject={renderCustomNode}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, (node.val || 5) + 4, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={(node: any) => setHoveredNode(node || null)}
        linkColor={(link: any) => link.color || '#38bdf8'}
        linkWidth={(link: any) => (link.type === 'explicit' ? 1.5 : 0.8)}
        linkLineDash={(link: any) => (link.type === 'synaptic' ? [4, 3] : null)}
        linkDirectionalParticles={(link: any) => (link.type === 'synaptic' ? 2 : 0)}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#c084fc'}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Floating Control HUD */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl glass-panel text-slate-300">
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 300)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => fgRef.current?.zoomToFit(400, 30)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Synaptic Sensitivity Slider */}
        <div className="p-2.5 rounded-xl glass-panel text-xs text-slate-300 w-52">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <Zap className="w-3.5 h-3.5" /> Sinapsis AI
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {Math.round(synapticThreshold * 100)}% Match
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.45"
            step="0.01"
            value={synapticThreshold}
            onChange={(e) => setSynapticThreshold(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>Banyak Sinapsis</span>
            <span>Ketat</span>
          </div>
        </div>
      </div>

      {/* Legend & Hint Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 glass-panel px-3 py-2 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400 rounded"></span>
          <span>Hard Link (Manual)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-dashed border-t-2 border-purple-400"></span>
          <span>Synaptic Link (AI Latent)</span>
        </div>
        <div className="text-slate-500 border-l border-slate-700 pl-3">
          <span className="text-cyan-300 font-mono">Shift + Klik</span> multi-node untuk Sintesis AI
        </div>
      </div>
    </div>
  );
}
