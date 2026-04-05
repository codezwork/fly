"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Wait for Next.js layout shifts to finish
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
      // Ensure Lenis scroll is synced smoothly if necessary
      window.scrollTo(0, 0);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}
