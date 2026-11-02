import React, { useEffect, useRef } from 'react';

export const PaperFoldVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interactive target
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const draw = () => {
      time += 0.015;
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw paper grid fold perspective lines
      const cols = 16;
      const rows = 10;
      const cellW = width / cols;
      const cellH = height / rows;

      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * cellW;
          const y = j * cellH;

          // Distort grid based on distance to mouse and wave
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const foldFactor = Math.sin(dist * 0.01 - time * 2) * Math.max(0, 1 - dist / 500);

          const offsetX = (dx / (dist + 1)) * foldFactor * 25;
          const offsetY = (dy / (dist + 1)) * foldFactor * 25;

          const renderX = x + offsetX;
          const renderY = y + offsetY;

          // Connect horizontal mesh line
          if (i < cols) {
            const nextX = (i + 1) * cellW;
            const nextDx = nextX - mouseX;
            const nextDist = Math.sqrt(nextDx * nextDx + dy * dy);
            const nextFold = Math.sin(nextDist * 0.01 - time * 2) * Math.max(0, 1 - nextDist / 500);
            const nextRenderX = nextX + (nextDx / (nextDist + 1)) * nextFold * 25;
            const nextRenderY = y + (dy / (nextDist + 1)) * nextFold * 25;

            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(nextRenderX, nextRenderY);
            // Highlight crease folds with signature orange tint
            const isFoldLine = (i + j) % 4 === 0;
            ctx.strokeStyle = isFoldLine
              ? `rgba(255, 77, 0, ${0.15 + Math.abs(foldFactor) * 0.3})`
              : `rgba(245, 244, 240, ${0.04 + Math.abs(foldFactor) * 0.1})`;
            ctx.stroke();
          }

          // Connect vertical mesh line
          if (j < rows) {
            const nextY = (j + 1) * cellH;
            const nextDy = nextY - mouseY;
            const nextDist = Math.sqrt(dx * dx + nextDy * nextDy);
            const nextFold = Math.sin(nextDist * 0.01 - time * 2) * Math.max(0, 1 - nextDist / 500);
            const nextRenderX = x + (dx / (nextDist + 1)) * nextFold * 25;
            const nextRenderY = nextY + (nextDy / (nextDist + 1)) * nextFold * 25;

            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(nextRenderX, nextRenderY);
            ctx.strokeStyle = `rgba(245, 244, 240, 0.05)`;
            ctx.stroke();
          }

          // Render parametric fold nodes
          if ((i + j) % 3 === 0 && Math.abs(foldFactor) > 0.1) {
            ctx.beginPath();
            ctx.arc(renderX, renderY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4d00';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-60 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
