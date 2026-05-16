import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  Minus, Circle, PenTool, Hexagon, 
  Move, Scissors, Save, Upload,
  MousePointer2, Trash2, Undo2, Redo2,
  BarChart2, MonitorPlay
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

import { PerformanceChart } from '../Charts/PerformanceChart';

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
};

export const Sidebar: React.FC = () => {
  const store = useStore();
  const [showChart, setShowChart] = React.useState(false);

  const toolCategories = [
    {
      title: 'Basic Tools',
      items: [
        { id: 'SELECT', icon: MousePointer2, label: 'Select' },
        { id: 'DRAW_LINE', icon: Minus, label: 'Line' },
        { id: 'DRAW_CIRCLE', icon: Circle, label: 'Circle' },
        { id: 'DRAW_CURVE', icon: PenTool, label: 'Curve' },
        { id: 'DRAW_POLYGON', icon: Hexagon, label: 'Polygon' },
      ]
    },
    {
      title: 'Advanced',
      items: [
        { id: 'TRANSFORM', icon: Move, label: 'Transform' },
        { id: 'CLIP', icon: Scissors, label: 'Clip' },
      ]
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.shapes) {
          store.loadState(json.shapes);
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const data = JSON.stringify({ shapes: store.shapes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graphics_scene.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 h-full glass-panel border-r border-slate-700/50 flex flex-col relative z-20 text-slate-300 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
    >
      <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
          <MonitorPlay className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Graphite<span className="text-cyan-400">Engine</span></h1>
          <p className="text-[10px] text-cyan-500/70 font-mono uppercase tracking-widest mt-0.5">Core Algorithms</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
        
        {/* Tools */}
        {toolCategories.map((cat) => (
          <div key={cat.title}>
            <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest pl-1">
              {cat.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map((tool) => {
                const Icon = tool.icon;
                const isActive = store.currentMode === tool.id;
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={tool.id}
                    onClick={() => store.setMode(tool.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                      isActive 
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                        : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {isActive && <div className="absolute inset-0 bg-cyan-400/5 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]" />}
                    <Icon className={cn("w-5 h-5 mb-2 transition-transform duration-300 group-hover:-translate-y-0.5", isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]")} />
                    <span className="text-[11px] font-medium tracking-wide z-10">{tool.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Algorithm Selection Area */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-inner">
          {store.currentMode === 'DRAW_LINE' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-[10px] uppercase font-bold text-cyan-500/70 mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Line Algorithm
              </h3>
              <div className="flex flex-col gap-2">
                {['DDA', 'BRESENHAM'].map(algo => (
                  <button
                    key={algo}
                    onClick={() => store.setAlgorithm(algo as any)}
                    className={cn(
                      "px-4 py-2.5 text-sm text-left rounded-lg border transition-all duration-300 font-medium tracking-wide",
                      store.currentAlgorithm === algo
                        ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-cyan-500/50 text-cyan-300 shadow-[inset_2px_0_0_rgba(34,211,238,1)]"
                        : "border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {algo === 'DDA' ? 'DDA Algorithm' : 'Bresenham'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.currentMode === 'DRAW_CIRCLE' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-[10px] uppercase font-bold text-cyan-500/70 mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Circle Algorithm
              </h3>
              <div className="flex flex-col gap-2">
                {['MIDPOINT', 'BRESENHAM'].map(algo => (
                  <button
                    key={algo}
                    onClick={() => store.setAlgorithm(algo as any)}
                    className={cn(
                      "px-4 py-2.5 text-sm text-left rounded-lg border transition-all duration-300 font-medium tracking-wide",
                      store.currentAlgorithm === algo
                        ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-cyan-500/50 text-cyan-300 shadow-[inset_2px_0_0_rgba(34,211,238,1)]"
                        : "border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {algo === 'MIDPOINT' ? 'Midpoint Circle' : 'Bresenham Circle'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.currentMode === 'DRAW_CURVE' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-[10px] uppercase font-bold text-cyan-500/70 mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Curve Algorithm
              </h3>
              <div className="flex flex-col gap-2">
                {['BEZIER', 'B_SPLINE'].map(algo => (
                  <button
                    key={algo}
                    onClick={() => store.setAlgorithm(algo as any)}
                    className={cn(
                      "px-4 py-2.5 text-sm text-left rounded-lg border transition-all duration-300 font-medium tracking-wide",
                      store.currentAlgorithm === algo
                        ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-cyan-500/50 text-cyan-300 shadow-[inset_2px_0_0_rgba(34,211,238,1)]"
                        : "border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {algo === 'BEZIER' ? 'Bezier Curve' : 'B-Spline Curve'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.currentMode === 'TRANSFORM' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-[10px] uppercase font-bold text-cyan-500/70 mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Transformations
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  className="px-4 py-2.5 text-sm text-left rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700 hover:border-slate-600 text-slate-300 transition-all duration-200"
                  onClick={() => {
                    store.saveHistory();
                    store.shapes.forEach(shape => {
                      store.updateShape(shape.id, {
                        points: shape.points.map(p => ({ x: p.x + 10, y: p.y + 10 }))
                      });
                    });
                  }}
                >
                  Translate (+10, +10)
                </button>
                <button
                  className="px-4 py-2.5 text-sm text-left rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700 hover:border-slate-600 text-slate-300 transition-all duration-200"
                  onClick={() => {
                    store.saveHistory();
                    const cx = window.innerWidth / 2;
                    const cy = window.innerHeight / 2;
                    const rad = 15 * Math.PI / 180;
                    const cosA = Math.cos(rad);
                    const sinA = Math.sin(rad);
                    
                    store.shapes.forEach(shape => {
                      store.updateShape(shape.id, {
                        points: shape.points.map(p => {
                          const dx = p.x - cx;
                          const dy = p.y - cy;
                          return {
                            x: Math.round(cx + dx * cosA - dy * sinA),
                            y: Math.round(cy + dx * sinA + dy * cosA)
                          };
                        })
                      });
                    });
                  }}
                >
                  Rotate 15°
                </button>
              </div>
            </div>
          )}
          
          {store.currentMode !== 'DRAW_LINE' && store.currentMode !== 'DRAW_CIRCLE' && store.currentMode !== 'DRAW_CURVE' && store.currentMode !== 'TRANSFORM' && (
            <div className="text-center py-4 text-slate-500 text-sm italic">
              Select a drawing tool to view algorithm options.
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div>
          <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest pl-1">Theme Colors</h3>
          <div className="grid grid-cols-5 gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50">
            {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#94a3b8'].map(color => (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                key={color}
                onClick={() => store.setColor(color)}
                className={cn(
                  "w-full aspect-square rounded-full border-2 transition-all shadow-md relative",
                  store.currentColor === color ? "border-white scale-110 z-10" : "border-slate-800"
                )}
                style={{ 
                  backgroundColor: color,
                  boxShadow: store.currentColor === color ? `0 0 12px ${color}80` : undefined
                }}
              >
                {store.currentColor === color && (
                  <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2 mb-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={store.undo} className="p-2 flex items-center justify-center rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600/50" title="Undo">
            <Undo2 className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={store.redo} className="p-2 flex items-center justify-center rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600/50" title="Redo">
            <Redo2 className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={store.clearAll} className="p-2 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/30" title="Clear Canvas">
            <Trash2 className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowChart(true)} className="p-2 flex items-center justify-center rounded-lg hover:bg-cyan-500/20 text-cyan-500 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-500/30" title="Charts">
            <BarChart2 className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="py-2 px-3 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
              <Save className="w-3.5 h-3.5" /> Save
            </motion.button>
            <label className="py-2 px-3 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Load
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
            </label>
        </div>
      </div>
      
      {showChart && <PerformanceChart onClose={() => setShowChart(false)} />}
    </motion.aside>
  );
};
