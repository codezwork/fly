"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // 1. Synchronize Lenis and GSAP ticker for perfect scroll harmony
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    // 2. Handle route changes
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
    }, 150);

    // 3. Handle dynamic DOM height changes safely (State toggles, lazy images)
    let debounceTimer: NodeJS.Timeout;
    let lastHeight = document.body.scrollHeight;

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newHeight = document.body.scrollHeight;
        // Only refresh if height changed significantly to prevent GSAP infinite loops
        if (Math.abs(newHeight - lastHeight) > 10) {
          lastHeight = newHeight;
          ScrollTrigger.refresh();
        }
      }, 250);
    });

    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(timeout);
      clearTimeout(debounceTimer);
      resizeObserver.disconnect();
    };
  }, [pathname]);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false} options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}
