import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Layers, Compass } from 'lucide-react';

export const Toolbar: React.FC = () => {
  const store = useStore();

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-4xl px-8">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel rounded-2xl flex items-center justify-between px-6 py-3 pointer-events-auto w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-t border-t-white/10 border-b-black/50"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-500 animate-spin-slow" />
            <div className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 bg-slate-800/80 rounded-full border border-slate-700/50 shadow-inner">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Mode</span>
              <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                {store.currentMode.replace('DRAW_', '')}
              </span>
            </div>
          </div>

          {store.currentAlgorithm && (
            <div className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 bg-slate-800/80 rounded-full border border-slate-700/50 shadow-inner">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Algorithm</span>
              <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                {store.currentAlgorithm}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="uppercase tracking-wider text-[10px]">Shapes</span>
            <span className="text-cyan-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">{store.shapes.length}</span>
          </div>
          
          <div className="w-px h-5 bg-slate-700/50" />
          
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-wider text-[10px]">Cursor</span>
            <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-800 min-w-[90px] text-center shadow-inner">
              {store.isDrawing && store.tempPoints.length > 0 ? (
                <span className="font-mono text-cyan-300 text-xs tracking-wider drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">
                  {Math.round(store.tempPoints[store.tempPoints.length - 1].x)}, 
                  {Math.round(store.tempPoints[store.tempPoints.length - 1].y)}
                </span>
              ) : (
                <span className="font-mono text-slate-600 text-xs tracking-wider">-- , --</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
