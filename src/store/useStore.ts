import { create } from 'zustand';
import type { Shape, Point, LineAlgorithm, CircleAlgorithm, CurveAlgorithm, ClippingAlgorithm } from '../types';

interface AppState {
  shapes: Shape[];
  history: Shape[][];
  redoHistory: Shape[][];
  selectedShapeId: string | null;
  currentMode: 'SELECT' | 'DRAW_LINE' | 'DRAW_CIRCLE' | 'DRAW_CURVE' | 'DRAW_POLYGON' | 'CLIP' | 'TRANSFORM';
  currentAlgorithm: LineAlgorithm | CircleAlgorithm | CurveAlgorithm | ClippingAlgorithm;
  currentColor: string;
  theme: 'dark' | 'light';
  isDrawing: boolean;
  tempPoints: Point[];
  
  // Algorithm Panel state
  cellSize: number;
  algorithmPoints: Point[]; // Points currently animated
  algorithmType: string | null; // e.g. 'bresenhamLine', 'bresenhamCircle'
  algorithmParams: any; // stores original points, clip window, etc.
  
  // Actions
  setMode: (mode: AppState['currentMode']) => void;
  setAlgorithm: (algo: AppState['currentAlgorithm']) => void;
  setColor: (color: string) => void;
  toggleTheme: () => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, newShape: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  setTempPoints: (points: Point[]) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  
  // Algorithm Panel Actions
  setCellSize: (size: number) => void;
  setAlgorithmState: (points: Point[], type: string | null, params?: any) => void;
  clearAlgorithmState: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  // File operations
  loadState: (shapes: Shape[]) => void;
  clearAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  shapes: [],
  history: [],
  redoHistory: [],
  selectedShapeId: null,
  currentMode: 'DRAW_LINE',
  currentAlgorithm: 'DDA',
  currentColor: '#3b82f6',
  theme: 'dark',
  isDrawing: false,
  tempPoints: [],
  cellSize: 20,
  algorithmPoints: [],
  algorithmType: null,
  algorithmParams: null,

  setMode: (mode) => set({ currentMode: mode, selectedShapeId: null, tempPoints: [], isDrawing: false }),
  setAlgorithm: (algo) => set({ currentAlgorithm: algo }),
  setColor: (color) => set({ currentColor: color }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  addShape: (shape) => set((state) => {
    const newShapes = [...state.shapes, shape];
    return {
      shapes: newShapes,
      history: [...state.history, state.shapes],
      redoHistory: [],
    };
  }),

  updateShape: (id, newShapeData) => set((state) => {
    const newShapes = state.shapes.map((s) => s.id === id ? { ...s, ...newShapeData } : s);
    return { shapes: newShapes };
  }),

  deleteShape: (id) => set((state) => {
    const newShapes = state.shapes.filter((s) => s.id !== id);
    return {
      shapes: newShapes,
      selectedShapeId: state.selectedShapeId === id ? null : state.selectedShapeId,
      history: [...state.history, state.shapes],
      redoHistory: [],
    };
  }),

  selectShape: (id) => set({ selectedShapeId: id }),
  setTempPoints: (points) => set({ tempPoints: points }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  
  setCellSize: (cellSize) => set({ cellSize }),
  setAlgorithmState: (points, type, params = null) => set({ algorithmPoints: points, algorithmType: type, algorithmParams: params }),
  clearAlgorithmState: () => set({ algorithmPoints: [], algorithmType: null, algorithmParams: null }),

  saveHistory: () => set((state) => ({
    history: [...state.history, state.shapes],
    redoHistory: []
  })),

  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousShapes = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    return {
      shapes: previousShapes,
      history: newHistory,
      redoHistory: [...state.redoHistory, state.shapes],
      selectedShapeId: null
    };
  }),

  redo: () => set((state) => {
    if (state.redoHistory.length === 0) return state;
    const nextShapes = state.redoHistory[state.redoHistory.length - 1];
    const newRedoHistory = state.redoHistory.slice(0, -1);
    return {
      shapes: nextShapes,
      history: [...state.history, state.shapes],
      redoHistory: newRedoHistory,
      selectedShapeId: null
    };
  }),

  loadState: (shapes) => set({ shapes, history: [], redoHistory: [], selectedShapeId: null }),
  clearAll: () => set((state) => ({
    shapes: [],
    history: [...state.history, state.shapes],
    redoHistory: [],
    selectedShapeId: null,
    tempPoints: [],
    isDrawing: false
  }))
}));
