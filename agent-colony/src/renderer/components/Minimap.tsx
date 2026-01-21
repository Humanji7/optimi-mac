/**
 * Minimap Component
 * Purpose: Кликабельная миникарта с агентами и viewport rect
 */

import { useRef, useEffect, useCallback } from 'react';
import type { Viewport } from 'pixi-viewport';

interface MinimapAgent {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'working' | 'error' | 'paused';
}

interface MinimapProps {
  agents: MinimapAgent[];
  viewport: Viewport | null;
  worldWidth?: number;
  worldHeight?: number;
}

const MINIMAP_SIZE = 150;
const DEFAULT_WORLD_SIZE = 1024;

const STATUS_COLORS: Record<string, string> = {
  idle: '#888888',
  working: '#22c55e',
  error: '#ef4444',
  paused: '#eab308',
};

export function Minimap({
  agents,
  viewport,
  worldWidth = DEFAULT_WORLD_SIZE,
  worldHeight = DEFAULT_WORLD_SIZE
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = MINIMAP_SIZE / Math.max(worldWidth, worldHeight);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw grid (optional, subtle)
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const pos = (i / 8) * MINIMAP_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, MINIMAP_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(MINIMAP_SIZE, pos);
      ctx.stroke();
    }

    // Draw agents as dots
    for (const agent of agents) {
      const x = agent.x * scale;
      const y = agent.y * scale;

      ctx.fillStyle = STATUS_COLORS[agent.status] || STATUS_COLORS.idle;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw viewport rect
    if (viewport) {
      try {
        const bounds = viewport.getVisibleBounds();
        const rx = bounds.x * scale;
        const ry = bounds.y * scale;
        const rw = bounds.width * scale;
        const rh = bounds.height * scale;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, rw, rh);
      } catch (e) {
        // Viewport may not be ready
      }
    }
  }, [agents, viewport, scale]);

  // Redraw on changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Redraw periodically to update viewport rect
  useEffect(() => {
    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!viewport) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const minimapX = e.clientX - rect.left;
    const minimapY = e.clientY - rect.top;

    const worldX = minimapX / scale;
    const worldY = minimapY / scale;

    // Snap camera to clicked position
    viewport.snap(worldX, worldY, {
      time: 300,
      topLeft: false,
      interrupt: true
    });
  };

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        onClick={handleClick}
        style={styles.canvas}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 4,
    overflow: 'hidden',
    border: '2px solid #444',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  canvas: {
    display: 'block',
    cursor: 'pointer',
  },
};
