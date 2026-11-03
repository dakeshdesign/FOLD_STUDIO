import React, { useEffect, useRef } from 'react';

/**
 * FOLD cursor — editorial orbit.
 *
 * A precise 5px burnt-orange dot sits on the pointer and a fine 34px ivory ring
 * spring-follows it. States (data-state on the wrapper, styled in index.css):
 *   default  dot + fine orbit
 *   view     images and team photos (or any data-cursor element): 60px ring with the label
 *   link     links and buttons: ring fills burnt orange and shows ↗
 *   text     inputs and textareas: thin I-beam
 * Holding the mouse button presses the ring in slightly.
 */
type CursorState = 'default' | 'view' | 'link' | 'text';

const INTERACTIVE = 'a, button, [role="button"], label, select, summary';
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';

export const CustomCursor: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current!, ring = ringRef.current!, dot = dotRef.current!, label = labelRef.current!;
    document.documentElement.classList.add('has-fold-cursor');

    let mx = -100, my = -100;   // pointer
    let rx = mx, ry = my;       // ring position
    let vx = 0, vy = 0;         // ring velocity (spring)
    let state: CursorState = 'default';
    let raf = 0;

    const setState = (next: CursorState, text = '') => {
      if (next === state && label.textContent === text) return;
      state = next;
      root.dataset.state = next;
      label.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      if (root.dataset.visible !== 'true') { rx = mx; ry = my; root.dataset.visible = 'true'; }
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      if (t.closest(TEXT_FIELD)) return setState('text');
      const labelled = t.closest('[data-cursor]');
      if (labelled) return setState('view', labelled.getAttribute('data-cursor') || 'VIEW');
      const img = t.closest('img');
      if (img && img.getBoundingClientRect().width >= 80) return setState('view', 'VIEW');
      if (t.closest(INTERACTIVE)) return setState('link');
      setState('default');
    };

    // Pick ink or ivory from the first solid background under the pointer
    const toneAt = (x: number, y: number): 'light' | 'dark' => {
      let el = document.elementFromPoint(x, y) as Element | null;
      while (el) {
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] > 0.5)) {
          const [r, g, b] = m.map(Number);
          return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? 'light' : 'dark';
        }
        el = el.parentElement;
      }
      return 'light';
    };
    let toneX = -1, toneY = -1;

    const onDown = () => { root.dataset.down = 'true'; };
    const onUp = () => { delete root.dataset.down; };
    const onLeave = () => { root.dataset.visible = 'false'; };

    const tick = () => {
      if (reduced) { rx = mx; ry = my; }
      else {
        // subtle spring: a touch of follow-through, no wobble
        vx = (vx + (mx - rx) * 0.16) * 0.62;
        vy = (vy + (my - ry) * 0.16) * 0.62;
        rx += vx; ry += vy;
      }
      if (Math.abs(mx - toneX) + Math.abs(my - toneY) > 4) {
        toneX = mx; toneY = my;
        const tone = toneAt(mx, my);
        if (root.dataset.tone !== tone) root.dataset.tone = tone;
      }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-fold-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="fold-cursor" data-state="default" data-tone="light" data-visible="false" aria-hidden="true">
      <div ref={ringRef} className="fold-cursor__ring">
        <div className="fold-cursor__orb">
          <span ref={labelRef} className="fold-cursor__label" />
          <svg className="fold-cursor__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
            <path d="M6 18L18 6M8.5 6H18v9.5" />
          </svg>
        </div>
      </div>
      <div ref={dotRef} className="fold-cursor__dot" />
    </div>
  );
};
