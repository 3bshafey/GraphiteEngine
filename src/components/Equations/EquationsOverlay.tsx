import React from 'react';
import { useStore } from '../../store/useStore';
import type { Shape } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma } from 'lucide-react';

export const EquationsOverlay: React.FC = () => {
  const store = useStore();
  
  if (store.shapes.length === 0 && !store.isDrawing) return null;

  const renderEquation = (shape: Shape) => {
    if (shape.type === 'LINE') {
      const { points } = shape;
      if (points.length < 2) return null;
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      if (dx === 0) return <span>x = {Math.round(points[0].x)}</span>;
      const m = dy / dx;
      const b = points[0].y - m * points[0].x;
      return (
        <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
          y = {m.toFixed(2)}x {b >= 0 ? '+' : '-'} <span className="text-cyan-300">{Math.abs(b).toFixed(2)}</span>
        </span>
      );
    } else if (shape.type === 'CIRCLE') {
      const { points } = shape;
      if (points.length < 2) return null;
      const cx = Math.round(points[0].x);
      const cy = Math.round(points[0].y);
      const r = Math.round(Math.sqrt(Math.pow(points[1].x - cx, 2) + Math.pow(points[1].y - cy, 2)));
      return (
        <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
          (x - {cx})² + (y - {cy})² = <span className="text-cyan-300">{r}²</span>
        </span>
      );
    }
    return <span className="text-slate-500 italic text-[10px]">Equation not supported for {shape.type}</span>;
  };

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute bottom-8 right-8 glass-panel rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-sm pointer-events-none z-10 border border-slate-700/50"
    >
      <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-3">
        <div className="p-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50">
          <Sigma className="w-4 h-4 text-slate-300" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide">Parametric Equations</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Live Analysis</p>
        </div>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        <AnimatePresence>
          {store.shapes.slice(-4).reverse().map((shape) => (
            <motion.div 
              key={shape.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50 shadow-inner"
            >
              <div 
                className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" 
                style={{ backgroundColor: shape.color, color: shape.color }} 
              />
              <div className="font-mono text-xs tracking-wider">{renderEquation(shape)}</div>
            </motion.div>
          ))}
          {store.isDrawing && store.tempPoints.length === 2 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/30 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]"
            >
              <div 
                className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor] animate-pulse" 
                style={{ backgroundColor: store.currentColor, color: store.currentColor }} 
              />
              <div className="font-mono text-xs tracking-wider">
                {store.currentMode === 'DRAW_LINE' && renderEquation({ type: 'LINE', points: store.tempPoints } as any)}
                {store.currentMode === 'DRAW_CIRCLE' && renderEquation({ type: 'CIRCLE', points: store.tempPoints } as any)}
                {(store.currentMode !== 'DRAW_LINE' && store.currentMode !== 'DRAW_CIRCLE') && <span className="text-cyan-400/50 italic text-[10px]">Calculating...</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
