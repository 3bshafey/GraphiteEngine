# Computer Graphics Algorithms Visualizer

A modern, web-based interactive visualizer for classic computer graphics algorithms. Built with React, TypeScript, and Vite.

## Features

- **Line Drawing**: DDA and Bresenham's algorithms.
- **Circle Drawing**: Midpoint and Bresenham's circle algorithms.
- **Curves**: Bezier and B-Spline curves.
- **Polygons**: Freeform polygon drawing.
- **Transformations**: Translation, Rotation, Scaling, Reflection, and Shearing.
- **Clipping**: Cohen-Sutherland line clipping and Sutherland-Hodgman polygon clipping (implemented in core, UI pending).
- **Equations Overlay**: Real-time visualization of line and circle equations.
- **Performance Benchmarks**: Interactive charts comparing algorithm execution times.
- **Save & Load**: Export your scenes to JSON and load them later.
- **Undo / Redo**: Full action history stack.
- **Modern UI**: Tailored dark mode interface with Lucide icons.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Architecture

The project follows a clean architectural approach:
- `src/algorithms/`: Contains pure, math-based implementations of all graphics algorithms, isolated for testing.
- `src/components/`: Reusable React components (Canvas, Sidebar, Toolbar, Overlays).
- `src/hooks/`: Custom React hooks, including `useDrawing` for connecting mouse events to the canvas.
- `src/store/`: Global state management via Zustand.
- `src/types/`: Centralized TypeScript definitions.
