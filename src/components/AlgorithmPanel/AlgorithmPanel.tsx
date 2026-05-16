import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

import { bresenhamLine } from '../../algorithms/lines/bresenham';
import { dda } from '../../algorithms/lines/dda';
import { bresenhamCircle } from '../../algorithms/circles/bresenham';
import { midpointCircle } from '../../algorithms/circles/midpoint';
import { bezierCurve } from '../../algorithms/curves/bezier';
import { bSplineCurve } from '../../algorithms/curves/bSpline';
import { cohenSutherland } from '../../algorithms/clipping/cohenSutherland';
import { sutherlandHodgman } from '../../algorithms/clipping/sutherlandHodgman';
import { translate, scale, rotate, reflectX, reflectY, shear } from '../../algorithms/transformations';

export const AlgorithmPanel: React.FC = () => {
  const [algo, setAlgo] = useState('bresenhamLine');
  const [inputs, setInputs] = useState<any>({
    x1: 0, y1: 0, x2: 100, y2: 100,
    cx: 0, cy: 0, r: 50,
    points: [{ x: 10, y: 10 }, { x: 50, y: 50 }, { x: 90, y: 10 }],
    degree: 3,
    xMin: 0, yMin: 0, xMax: 100, yMax: 100,
    clipPoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
    tx: 10, ty: 10,
    sx: 2, sy: 2,
    angle: 45,
    centerY: 50, centerX: 50,
    shx: 1, shy: 0
  });

  const [results, setResults] = useState<any[] | null>(null);
  const [expandedResults, setExpandedResults] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const animationRef = useRef<number[]>([]);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 350, y: 100 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        setModalPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - modalPos.x, y: e.clientY - modalPos.y };
  };

  const downloadCSV = () => {
    if (!expandedResults || expandedResults.length === 0) return;
    const headers = ['Step', 'X', 'Y', 'Error/D/P', 'Decision', 'Notes'];
    const rows = expandedResults.map(row => {
      const err = algo === 'dda' ? row.errSlope : (row.d !== undefined ? row.d : row.err);
      return [row.step, row.x, row.y, err ?? '', row.decision ?? '', row.note ?? ''].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${algo}_table.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    const canvas = document.getElementById('algorithm-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${algo}_canvas.png`;
    a.click();
  };
  
  const store = useStore();

  const clearCanvas = () => {
    animationRef.current.forEach(clearTimeout);
    animationRef.current = [];
    store.clearAlgorithmState();
    setResults(null);
    setExpandedResults(null);
  };

  useEffect(() => {
    return () => {
      animationRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePointChange = (listName: string, index: number, field: string, value: string) => {
    setInputs((prev: any) => {
      const newList = [...prev[listName]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listName]: newList };
    });
  };

  const addPoint = (listName: string) => {
    setInputs((prev: any) => ({
      ...prev,
      [listName]: [...prev[listName], { x: 0, y: 0 }]
    }));
  };

  const removePoint = (listName: string, index: number) => {
    setInputs((prev: any) => {
      const newList = [...prev[listName]];
      newList.splice(index, 1);
      return { ...prev, [listName]: newList };
    });
  };

  const parseNum = (val: any) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error('All inputs must be valid numbers');
    return parsed;
  };

  const calculate = () => {
    setErrorMsg('');
    setResults(null);
    try {
      let res: any = null;
      switch (algo) {
        case 'bresenhamLine':
          res = bresenhamLine({ x: parseNum(inputs.x1), y: parseNum(inputs.y1) }, { x: parseNum(inputs.x2), y: parseNum(inputs.y2) });
          break;
        case 'dda':
          res = dda({ x: parseNum(inputs.x1), y: parseNum(inputs.y1) }, { x: parseNum(inputs.x2), y: parseNum(inputs.y2) });
          break;
        case 'bresenhamCircle':
          res = bresenhamCircle({ x: parseNum(inputs.cx), y: parseNum(inputs.cy) }, parseNum(inputs.r));
          break;
        case 'midpointCircle':
          res = midpointCircle({ x: parseNum(inputs.cx), y: parseNum(inputs.cy) }, parseNum(inputs.r));
          break;
        case 'bezier':
          res = bezierCurve(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })));
          break;
        case 'bSpline':
          res = bSplineCurve(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.degree));
          break;
        case 'cohenSutherland':
          const csRes = cohenSutherland(
            { x: parseNum(inputs.x1), y: parseNum(inputs.y1) },
            { x: parseNum(inputs.x2), y: parseNum(inputs.y2) },
            parseNum(inputs.xMin), parseNum(inputs.yMin), parseNum(inputs.xMax), parseNum(inputs.yMax)
          );
          if (csRes) {
            res = [csRes.start, csRes.end];
          } else {
            res = [];
          }
          break;
        case 'sutherlandHodgman':
          res = sutherlandHodgman(
            inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })),
            inputs.clipPoints.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) }))
          );
          break;
        case 'translate':
          res = translate(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.tx), parseNum(inputs.ty));
          break;
        case 'scale':
          res = scale(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.sx), parseNum(inputs.sy), { x: parseNum(inputs.cx), y: parseNum(inputs.cy) });
          break;
        case 'rotate':
          res = rotate(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.angle), { x: parseNum(inputs.cx), y: parseNum(inputs.cy) });
          break;
        case 'reflectX':
          res = reflectX(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.centerY));
          break;
        case 'reflectY':
          res = reflectY(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.centerX));
          break;
        case 'shear':
          res = shear(inputs.points.map((p: any) => ({ x: parseNum(p.x), y: parseNum(p.y) })), parseNum(inputs.shx), parseNum(inputs.shy), { x: parseNum(inputs.cx), y: parseNum(inputs.cy) });
          break;
      }
      
      // Cancel previous animation
      animationRef.current.forEach(clearTimeout);
      animationRef.current = [];
      store.clearAlgorithmState();

      setResults(res);

      if (res && res.length >= 0) {
        // Calculate expanded table rows
        const rows = [];
        if (algo === 'bresenhamCircle' || algo === 'midpointCircle') {
          let r = parseNum(inputs.r);
          let currentD = algo === 'bresenhamCircle' ? 3 - 2 * r : 1 - r;
          let cx = parseNum(inputs.cx);
          let cy = parseNum(inputs.cy);
          
          for (let i = 0; i < res.length; i++) {
            let pt = res[i];
            let group = Math.floor(i / 8) + 1;
            let octantIdx = i % 8;
            const octantLabels = ['(+x,+y)', '(-x,+y)', '(+x,-y)', '(-x,-y)', '(+y,+x)', '(-y,+x)', '(+y,-x)', '(-y,-x)'];
            
            let basePt = res[group * 8 - 8];
            let x = basePt.x - cx;
            let y = basePt.y - cy;
            
            let isDuplicate = x === 0 || y === 0 || x === y;
            let note = '';
            if (group === 1) note = 'Initial point';
            else if (group === res.length / 8) note = 'End Point';
            
            if (group > 1 && octantIdx === 0) {
              let prevBasePt = res[(group - 1) * 8 - 8];
              let prevY = prevBasePt.y - cy;
              if (y < prevY) {
                note = 'y decremented';
              }
            }
            
            let decision = '';
            if (algo === 'bresenhamCircle') {
              if (currentD > 0) decision = 'd > 0 → y--';
              else decision = 'd ≤ 0 → y same';
            } else {
              if (currentD < 0) decision = 'p < 0 → y same';
              else decision = 'p ≥ 0 → y--';
            }

            if (isDuplicate) {
              if (note) note += ' | Axis point (duplicate)';
              else note = 'Axis point (duplicate)';
            }

            rows.push({
              group, step: i + 1, x: pt.x, y: pt.y, d: currentD, decision, octant: octantLabels[octantIdx], note, isDuplicate
            });
            
            if (octantIdx === 7) {
              if (algo === 'bresenhamCircle') {
                if (currentD > 0) currentD = currentD + 4 * (x - y) + 10;
                else currentD = currentD + 4 * x + 6;
              } else {
                if (currentD < 0) currentD = currentD + 2 * x + 1;
                else currentD = currentD + 2 * (x - y) + 1;
              }
            }
          }
        } else if (algo === 'bresenhamLine') {
          let x1 = parseNum(inputs.x1);
          let y1 = parseNum(inputs.y1);
          let x2 = parseNum(inputs.x2);
          let y2 = parseNum(inputs.y2);
          let dx = Math.abs(x2 - x1);
          let dy = Math.abs(y2 - y1);
          let err = dx - dy;

          for (let i = 0; i < res.length; i++) {
            let pt = res[i];
            let note = '';
            if (i === 0) note = 'Start Point';
            if (i === res.length - 1) note = 'End Point';
            
            let e2 = 2 * err;
            let dec = [];
            if (e2 > -dy) dec.push('x++');
            if (e2 < dx) dec.push('y++');
            let decision = dec.join(' and ');
            if (i === res.length - 1) decision = '';
            
            rows.push({ step: i + 1, x: pt.x, y: pt.y, err, decision, note });
            
            if (e2 > -dy) err -= dy;
            if (e2 < dx) err += dx;
          }
        } else if (algo === 'dda') {
          let x1 = parseNum(inputs.x1);
          let y1 = parseNum(inputs.y1);
          let x2 = parseNum(inputs.x2);
          let y2 = parseNum(inputs.y2);
          let dx = x2 - x1;
          let dy = y2 - y1;
          let steps = Math.max(Math.abs(dx), Math.abs(dy));
          let xInc = dx / steps;
          let yInc = dy / steps;
          let curX = x1;
          let curY = y1;
          
          for (let i = 0; i < res.length; i++) {
            let pt = res[i];
            let note = '';
            if (i === 0) note = 'Start Point';
            if (i === res.length - 1) note = 'End Point';
            
            let errSlope = `x=${curX.toFixed(2)}, y=${curY.toFixed(2)}`;
            let decision = `rounded to (${Math.round(curX)}, ${Math.round(curY)})`;
            
            rows.push({ step: i + 1, x: pt.x, y: pt.y, errSlope, decision, note });
            
            curX += xInc;
            curY += yInc;
          }
        } else {
          for (let i = 0; i < res.length; i++) {
            let pt = res[i];
            let note = '';
            if (i === 0) note = 'Start Point';
            if (i === res.length - 1) note = 'End Point';
            if (['cohenSutherland', 'sutherlandHodgman'].includes(algo)) {
              note = note ? note + ' (Accepted)' : 'Accepted';
            }
            rows.push({ step: i + 1, x: pt.x, y: pt.y, note });
          }
        }
        setExpandedResults(rows);

        // Animate
        res.forEach((_: any, idx: number) => {
          const timeoutId = window.setTimeout(() => {
            store.setAlgorithmState(res.slice(0, idx + 1), algo, inputs);
          }, idx * 50);
          animationRef.current.push(timeoutId);
        });
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Error in calculation');
    }
  };

  const renderPointList = (listName: string, label: string) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-2 text-slate-400">{label}</label>
      {inputs[listName].map((pt: any, i: number) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <span className="text-xs text-slate-500">P{i}</span>
          <input type="number" className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-sm" value={pt.x} onChange={(e) => handlePointChange(listName, i, 'x', e.target.value)} placeholder="x" />
          <input type="number" className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-sm" value={pt.y} onChange={(e) => handlePointChange(listName, i, 'y', e.target.value)} placeholder="y" />
          <button className="text-red-400 hover:text-red-300 px-2" onClick={() => removePoint(listName, i)}>✕</button>
        </div>
      ))}
      <button className="text-cyan-400 text-xs hover:underline" onClick={() => addPoint(listName)}>+ Add Point</button>
    </div>
  );

  return (
    <>
    <div 
      style={{
        width: sidebarOpen ? 300 : 0,
        transition: 'width 300ms ease',
        overflow: 'visible',
        flexShrink: 0,
        position: 'relative'
      }}
      onTransitionEnd={() => window.dispatchEvent(new Event('resize'))}
      className="h-full glass-panel border-r border-slate-700/50 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)] bg-slate-950/90 backdrop-blur-xl"
    >
      {/* SECTION 1 - Input Panel */}
      <div 
        className="w-[300px] p-4 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 transition-opacity duration-300" 
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
      >
        <h2 className="text-lg font-bold text-white mb-4">Algorithm Input</h2>

        <div className="flex justify-between items-center mb-4">
          <label className="block text-xs font-semibold text-slate-400">Cell Size (px)</label>
          <input 
            type="range" min="10" max="50" 
            value={store.cellSize} 
            onChange={(e) => store.setCellSize(Number(e.target.value))}
            className="w-2/3 accent-cyan-500"
          />
          <span className="text-xs text-slate-300 w-8 text-right">{store.cellSize}</span>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2 text-slate-400">Select Algorithm</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
            value={algo}
            onChange={(e) => {
              setAlgo(e.target.value);
              clearCanvas();
            }}
          >
            <optgroup label="Lines">
              <option value="bresenhamLine">Bresenham Line</option>
              <option value="dda">DDA</option>
            </optgroup>
            <optgroup label="Circles">
              <option value="bresenhamCircle">Bresenham Circle</option>
              <option value="midpointCircle">Midpoint Circle</option>
            </optgroup>
            <optgroup label="Curves">
              <option value="bezier">Bezier</option>
              <option value="bSpline">B-Spline</option>
            </optgroup>
            <optgroup label="Clipping">
              <option value="cohenSutherland">Cohen-Sutherland</option>
              <option value="sutherlandHodgman">Sutherland-Hodgman</option>
            </optgroup>
            <optgroup label="Transformations">
              <option value="translate">Translate</option>
              <option value="scale">Scale</option>
              <option value="rotate">Rotate</option>
              <option value="reflectX">Reflect X</option>
              <option value="reflectY">Reflect Y</option>
              <option value="shear">Shear</option>
            </optgroup>
          </select>
        </div>

        <div className="flex-1">
          {['bresenhamLine', 'dda', 'cohenSutherland'].includes(algo) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Start X</label>
                <input type="number" value={inputs.x1} onChange={(e) => handleInputChange('x1', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Start Y</label>
                <input type="number" value={inputs.y1} onChange={(e) => handleInputChange('y1', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">End X</label>
                <input type="number" value={inputs.x2} onChange={(e) => handleInputChange('x2', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">End Y</label>
                <input type="number" value={inputs.y2} onChange={(e) => handleInputChange('y2', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {['bresenhamCircle', 'midpointCircle'].includes(algo) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center X</label>
                <input type="number" value={inputs.cx} onChange={(e) => handleInputChange('cx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center Y</label>
                <input type="number" value={inputs.cy} onChange={(e) => handleInputChange('cy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Radius</label>
                <input type="number" value={inputs.r} onChange={(e) => handleInputChange('r', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {['bezier', 'bSpline', 'sutherlandHodgman', 'translate', 'scale', 'rotate', 'reflectX', 'reflectY', 'shear'].includes(algo) && (
            renderPointList('points', 'Points / Vertices')
          )}

          {algo === 'bSpline' && (
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">Degree</label>
              <input type="number" value={inputs.degree} onChange={(e) => handleInputChange('degree', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
            </div>
          )}

          {algo === 'cohenSutherland' && (
            <div className="grid grid-cols-2 gap-2 mb-4 mt-4 border-t border-slate-800 pt-4">
              <div className="col-span-2 text-xs font-semibold text-slate-400">Clip Window</div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Min X</label>
                <input type="number" value={inputs.xMin} onChange={(e) => handleInputChange('xMin', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Min Y</label>
                <input type="number" value={inputs.yMin} onChange={(e) => handleInputChange('yMin', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Max X</label>
                <input type="number" value={inputs.xMax} onChange={(e) => handleInputChange('xMax', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Max Y</label>
                <input type="number" value={inputs.yMax} onChange={(e) => handleInputChange('yMax', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {algo === 'sutherlandHodgman' && (
            <div className="border-t border-slate-800 pt-4 mt-4">
              {renderPointList('clipPoints', 'Clip Polygon Points')}
            </div>
          )}

          {algo === 'translate' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Translate X (tx)</label>
                <input type="number" value={inputs.tx} onChange={(e) => handleInputChange('tx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Translate Y (ty)</label>
                <input type="number" value={inputs.ty} onChange={(e) => handleInputChange('ty', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {algo === 'scale' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Scale X (sx)</label>
                <input type="number" value={inputs.sx} onChange={(e) => handleInputChange('sx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Scale Y (sy)</label>
                <input type="number" value={inputs.sy} onChange={(e) => handleInputChange('sy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center X</label>
                <input type="number" value={inputs.cx} onChange={(e) => handleInputChange('cx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center Y</label>
                <input type="number" value={inputs.cy} onChange={(e) => handleInputChange('cy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {algo === 'rotate' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Angle (degrees)</label>
                <input type="number" value={inputs.angle} onChange={(e) => handleInputChange('angle', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center X</label>
                <input type="number" value={inputs.cx} onChange={(e) => handleInputChange('cx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center Y</label>
                <input type="number" value={inputs.cy} onChange={(e) => handleInputChange('cy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {algo === 'reflectX' && (
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">Center Y (Horizontal Axis)</label>
              <input type="number" value={inputs.centerY} onChange={(e) => handleInputChange('centerY', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
            </div>
          )}

          {algo === 'reflectY' && (
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">Center X (Vertical Axis)</label>
              <input type="number" value={inputs.centerX} onChange={(e) => handleInputChange('centerX', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
            </div>
          )}

          {algo === 'shear' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Shear X (shx)</label>
                <input type="number" value={inputs.shx} onChange={(e) => handleInputChange('shx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Shear Y (shy)</label>
                <input type="number" value={inputs.shy} onChange={(e) => handleInputChange('shy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center X</label>
                <input type="number" value={inputs.cx} onChange={(e) => handleInputChange('cx', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Center Y</label>
                <input type="number" value={inputs.cy} onChange={(e) => handleInputChange('cy', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-red-400 text-sm mt-2 p-2 bg-red-400/10 rounded border border-red-400/30">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={calculate}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
          >
            Calculate
          </button>
          <button
            onClick={clearCanvas}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-lg border border-slate-700 transition-all"
          >
            Clear Canvas
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => setTableOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg shadow-md transition-all"
          >
            Show Table
          </button>
          <button
            onClick={downloadImage}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-lg border border-slate-700 transition-all"
          >
            ⬇ Download Image
          </button>
        </div>
      </div>

      {/* toggle button - always visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 shadow-md rounded-r-md flex items-center justify-center transition-colors"
        style={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          width: 20,
          height: 60,
          cursor: 'pointer'
        }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </div>

    {/* FLOATING MODAL - execution table popup */}
    {tableOpen && (
      <div 
        style={{ 
          position: 'absolute', 
          left: modalPos.x, 
          top: modalPos.y, 
          width: 600, 
          minHeight: 300, 
          maxHeight: '80vh', 
          zIndex: 1000 
        }}
        className="flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div 
          onMouseDown={handleMouseDown}
          className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700 cursor-grab active:cursor-grabbing"
        >
          <h2 className="text-sm font-bold text-white select-none">Execution Table — {algo}</h2>
          <div className="flex gap-2">
            <button 
              onClick={downloadCSV}
              className="text-xs bg-cyan-700 hover:bg-cyan-600 text-white px-2 py-1 rounded"
            >
              ⬇ Download CSV
            </button>
            <button 
              onClick={() => setTableOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          {results ? (
            results.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                No result / Line fully clipped
              </div>
            ) : (
              <>
                <div className="text-xs text-cyan-400 mb-3 font-mono">
                  Total Points: {results.length}
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-800 sticky top-0 text-slate-300">
                      <tr>
                        {['bresenhamCircle', 'midpointCircle'].includes(algo) ? (
                          <>
                            <th className="px-3 py-2 font-semibold">Group</th>
                            <th className="px-3 py-2 font-semibold">Step</th>
                            <th className="px-3 py-2 font-semibold">X</th>
                            <th className="px-3 py-2 font-semibold">Y</th>
                            <th className="px-3 py-2 font-semibold">{algo === 'bresenhamCircle' ? 'd' : 'p'}</th>
                            <th className="px-3 py-2 font-semibold">Decision</th>
                            <th className="px-3 py-2 font-semibold">Octant</th>
                            <th className="px-3 py-2 font-semibold min-w-[150px]">Notes</th>
                          </>
                        ) : ['bresenhamLine', 'dda'].includes(algo) ? (
                          <>
                            <th className="px-3 py-2 font-semibold">Step</th>
                            <th className="px-3 py-2 font-semibold">X</th>
                            <th className="px-3 py-2 font-semibold">Y</th>
                            <th className="px-3 py-2 font-semibold">{algo === 'dda' ? 'Slope' : 'Error'}</th>
                            <th className="px-3 py-2 font-semibold">Decision</th>
                            <th className="px-3 py-2 font-semibold min-w-[150px]">Notes</th>
                          </>
                        ) : (
                          <>
                            <th className="px-3 py-2 font-semibold">Step</th>
                            <th className="px-3 py-2 font-semibold">X</th>
                            <th className="px-3 py-2 font-semibold">Y</th>
                            <th className="px-3 py-2 font-semibold min-w-[150px]">Notes</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {expandedResults?.map((row, i) => {
                        let bgClass = row.isDuplicate ? 'bg-yellow-900/30' : (i === results.length - 1 ? 'bg-cyan-900/30' : 'hover:bg-slate-800/50');
                        let textClass = row.isDuplicate ? 'text-yellow-200' : (i === results.length - 1 ? 'font-medium text-cyan-100' : 'text-slate-400');
                        
                        return (
                          <tr key={i} className={`${bgClass} ${textClass}`}>
                            {['bresenhamCircle', 'midpointCircle'].includes(algo) ? (
                              <>
                                <td className="px-3 py-1.5">{row.group}</td>
                                <td className="px-3 py-1.5">{row.step}</td>
                                <td className="px-3 py-1.5">{typeof row.x === 'number' ? row.x.toFixed(0) : row.x}</td>
                                <td className="px-3 py-1.5">{typeof row.y === 'number' ? row.y.toFixed(0) : row.y}</td>
                                <td className="px-3 py-1.5 font-mono text-xs">{row.d}</td>
                                <td className="px-3 py-1.5 font-mono text-xs text-purple-400">{row.decision}</td>
                                <td className="px-3 py-1.5 text-xs text-slate-500">{row.octant}</td>
                                <td className="px-3 py-1.5 text-xs text-slate-500">{row.note}</td>
                              </>
                            ) : ['bresenhamLine', 'dda'].includes(algo) ? (
                              <>
                                <td className="px-3 py-1.5">{row.step}</td>
                                <td className="px-3 py-1.5">{typeof row.x === 'number' ? row.x.toFixed(0) : row.x}</td>
                                <td className="px-3 py-1.5">{typeof row.y === 'number' ? row.y.toFixed(0) : row.y}</td>
                                <td className="px-3 py-1.5 font-mono text-xs">{algo === 'dda' ? row.errSlope : row.err}</td>
                                <td className="px-3 py-1.5 font-mono text-xs text-purple-400">{row.decision}</td>
                                <td className="px-3 py-1.5 text-xs text-slate-500">{row.note}</td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-1.5">{row.step}</td>
                                <td className="px-3 py-1.5">{typeof row.x === 'number' ? row.x.toFixed(2) : row.x}</td>
                                <td className="px-3 py-1.5">{typeof row.y === 'number' ? row.y.toFixed(2) : row.y}</td>
                                <td className="px-3 py-1.5 text-xs text-slate-500">{row.note}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
              Click Calculate to see execution steps.
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};
