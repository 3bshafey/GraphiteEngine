import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { dda } from '../../algorithms/lines/dda';
import { bresenhamLine } from '../../algorithms/lines/bresenham';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const PerformanceChart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Benchmark Lines
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 1000, y: 1000 };
    
    const t0 = performance.now();
    for(let i=0; i<1000; i++) dda(p1, p2);
    const t1 = performance.now();
    
    const t2 = performance.now();
    for(let i=0; i<1000; i++) bresenhamLine(p1, p2);
    const t3 = performance.now();

    setData({
      labels: ['DDA Line', 'Bresenham Line'],
      datasets: [
        {
          label: 'Execution Time (ms) for 1000 iterations',
          data: [t1 - t0, t3 - t2],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
        },
      ],
    });
  }, []);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl text-white relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          Algorithm Performance Comparison
        </h2>
        
        <div className="h-[400px]">
          <Bar 
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: '#cbd5e1' }
                },
                title: {
                  display: true,
                  text: 'DDA vs Bresenham',
                  color: '#f8fafc'
                }
              },
              scales: {
                y: {
                  grid: { color: '#334155' },
                  ticks: { color: '#cbd5e1' }
                },
                x: {
                  grid: { color: '#334155' },
                  ticks: { color: '#cbd5e1' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
