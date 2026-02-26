"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function WaveScrollIndicator() {
  const [progress, setProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pendingYRef = useRef<number | null>(null);
  const progressRafRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<number>(0);

  const railTop = 84;
  const railBottom = 12;
  const knobHeight = 58;

  const ratioFromPointer = useCallback((clientY: number) => {
    const usable = Math.max(1, viewportHeight - railTop - railBottom - knobHeight);
    const relative = clientY - railTop - knobHeight / 2;
    const clamped = Math.max(0, Math.min(relative, usable));
    return clamped / usable;
  }, [viewportHeight]);

  const scrollToRatio = useCallback((ratio: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    window.scrollTo({ top: ratio * max, behavior: "auto" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      pendingProgressRef.current = Math.min(1, Math.max(0, window.scrollY / max));
      if (progressRafRef.current !== null) return;
      progressRafRef.current = requestAnimationFrame(() => {
        progressRafRef.current = null;
        setProgress(pendingProgressRef.current);
      });
    };

    const onResize = () => {
      setViewportHeight(window.innerHeight);
      onScroll();
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (progressRafRef.current !== null) {
        cancelAnimationFrame(progressRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      pendingYRef.current = event.clientY;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const y = pendingYRef.current;
        if (y === null) return;
        const ratio = ratioFromPointer(y);
        scrollToRatio(ratio);
      });
    };

    const onUp = () => {
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, ratioFromPointer, scrollToRatio]);

  useEffect(() => {
    if (!dragging) return;
    document.body.classList.add("wave-dragging");
    return () => document.body.classList.remove("wave-dragging");
  }, [dragging]);

  // Keep the marker attached to the right edge and move by scroll progress.
  const usable = Math.max(0, viewportHeight - railTop - railBottom - knobHeight);
  const markerTop = railTop + usable * progress;

  return (
    <div className="wave-scroll" aria-hidden="true" style={{ top: `${markerTop}px` }}>
      <div
        className={`wave-scroll-core ${dragging ? "wave-scroll-core-dragging" : ""}`}
        onPointerDown={() => {
          setDragging(true);
        }}
      >
        <span className="wave-scroll-ripple wave-scroll-ripple-1" />
        <span className="wave-scroll-ripple wave-scroll-ripple-2" />
      </div>
    </div>
  );
}
