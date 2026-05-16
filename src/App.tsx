import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import { AlgorithmCanvas } from './components/Canvas/AlgorithmCanvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { EquationsOverlay } from './components/Equations/EquationsOverlay';
import { AlgorithmPanel } from './components/AlgorithmPanel/AlgorithmPanel';

function App() {
  // We force dark mode for this premium look based on requirements
  const isDark = true; // Forcing dark mode for premium feel
  const [appMode, setAppMode] = useState<'free' | 'algorithm'>('free');

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isDark ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      
      {/* TOP BAR - Mode Switcher */}
      <div className="flex justify-center items-center h-12 border-b border-slate-800 gap-2 shrink-0 bg-slate-900 z-50">
        <button 
          onClick={() => setAppMode('free')}
          className={`px-4 py-1.5 rounded-md transition-colors text-sm font-medium ${appMode === 'free' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          Free Canvas
        </button>
        <button 
          onClick={() => setAppMode('algorithm')}
          className={`px-4 py-1.5 rounded-md transition-colors text-sm font-medium ${appMode === 'algorithm' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          Algorithm View
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* FREE CANVAS MODE */}
        {appMode === 'free' && (
          <div className="h-full w-full relative flex">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full relative">
              <Toolbar />
              <main className="flex-1 relative overflow-hidden bg-slate-950 flex">
                 <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_100%)] pointer-events-none" />
                 <div className="flex-1 relative">
                   <Canvas isActive={true} />
                   <EquationsOverlay />
                 </div>
              </main>
            </div>
          </div>
        )}

        {/* ALGORITHM VIEW MODE */}
        {appMode === 'algorithm' && (
          <div className="h-full w-full relative flex">
            <main className="flex-1 relative overflow-hidden bg-slate-950 flex">
               <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_100%)] pointer-events-none" />
               <AlgorithmPanel />
               <div className="flex-1 relative">
                 <AlgorithmCanvas isActive={true} />
               </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
