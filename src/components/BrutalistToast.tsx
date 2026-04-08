"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

export default function BrutalistToast() {
  const toastMessage = useStore((state) => state.toastMessage);
  const hideToast = useStore((state) => state.hideToast);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastMessage && toastRef.current) {
      // Animate in
      gsap.fromTo(toastRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );

      // Auto dismiss after 3s
      const timer = setTimeout(() => {
        gsap.to(toastRef.current, {
          y: 50, opacity: 0, duration: 0.3, ease: "power2.in",
          onComplete: hideToast
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-8 left-0 w-full flex justify-center z-[500] pointer-events-none">
      <div 
        ref={toastRef}
        className="bg-brand-black text-xs text-white uppercase font-bold tracking-widest px-6 py-4 border-2 border-red-500 shadow-2xl"
      >
        {toastMessage}
      </div>
    </div>
  );
}
