"use client";

import { useEffect, useRef } from "react";
import styles from "./DataGrid.module.css";

interface GridCell {
  x: number;
  y: number;
  active: boolean;
}

export const DataGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<GridCell[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const cellSize = 8;
    const createCells = (width: number, height: number) => {
      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);
      const cells: GridCell[] = [];

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          cells.push({
            x,
            y,
            active: Math.random() < 0.15,
          });
        }
      }
      cellsRef.current = cells;
    };

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { width, height };
      createCells(width, height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      timeRef.current += 0.02;
      const cells = cellsRef.current;
      const { width, height } = sizeRef.current;

      ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
      ctx.fillRect(0, 0, width, height);

      cells.forEach((cell) => {
        const wave = Math.sin(cell.x * 0.08 + timeRef.current) * Math.cos(cell.y * 0.08 + timeRef.current);

        if (Math.random() < 0.003) {
          cell.active = !cell.active;
        }

        if (cell.active || wave > 0.7) {
          const alpha = cell.active ? 0.8 : Math.max(0, (wave - 0.7) / 0.3);

          ctx.fillStyle = cell.active
            ? `rgba(234, 166, 53, ${alpha})`
            : `rgba(164, 191, 217, ${alpha * 0.4})`;

          ctx.fillRect(
            cell.x * cellSize + 1,
            cell.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
          );
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};
