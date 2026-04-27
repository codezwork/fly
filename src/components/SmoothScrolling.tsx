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
    const lenis = lenisRef.current?.lenis;

    // 1. Aggressive Native Reset (Clears scroll debt on route change)
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    document.body.style.overflow = "";
    
    if (lenis) {
      lenis.start();
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.resize(); 
    }

    ScrollTrigger.clearScrollMemory?.(); 

    // Helper function to force both engines to recalculate mathematically
    const synchronizeScroll = () => {
      ScrollTrigger.refresh(true);
      lenis?.resize();
    };

    // 2. COLD LOAD CATCHER (For Incognito / Hard Refreshes)
    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        requestAnimationFrame(synchronizeScroll);
      } else {
        Promise.all([
          document.fonts.ready,
          new Promise((resolve) => window.addEventListener("load", resolve, { once: true }))
        ]).then(() => {
          requestAnimationFrame(synchronizeScroll);
        });
      }
    }

    // 3. SOFT ROUTE CATCHER (For Next.js <Link> clicks where window.onload does NOT fire)
    // We must wait for React to unmount the old page and paint the new DOM
    const t1 = setTimeout(synchronizeScroll, 150);
    const t2 = setTimeout(synchronizeScroll, 500);

    // 4. DYNAMIC MUTATION CATCHER (For Firebase loads, accordions, images)
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(synchronizeScroll);
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false} options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}
