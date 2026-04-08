"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Preloader() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Reset completion state when coming back to the home page
  useEffect(() => {
    if (pathname === "/") {
      setIsComplete(false);
    } else {
      setIsComplete(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isComplete) return;

    // Disable scroll while preloading
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        setIsComplete(true);
        document.body.style.overflow = "";
        // Force refresh all triggers after the scroll lock is removed
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
      },
    });

    // Rapid counter ticking
    const counter = { value: 0 };
    tl.to(counter, {
      value: 100,
      duration: 1.5,
      ease: "power4.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.innerText = Math.round(counter.value).toString() + "%";
        }
      },
    });

    // The Logo Flash replacement
    tl.to(counterRef.current, {
      opacity: 0,
      duration: 0.2,
    });
    
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // Split background and scale out logo simultaneously
    tl.to(".preloader-top", {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      delay: 0.4,
    }, "split");
    
    tl.to(".preloader-bottom", {
      yPercent: 100,
      duration: 1,
      ease: "power4.inOut",
      delay: 0.4,
    }, "split");

    tl.to(logoRef.current, {
      opacity: 0,
      scale: 3,
      duration: 0.8,
      ease: "power4.inOut",
      delay: 0.4,
    }, "split");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (isComplete) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
    >
      <div className="preloader-top absolute top-0 left-0 w-full h-1/2 bg-brand-black" />
      <div className="preloader-bottom absolute bottom-0 left-0 w-full h-1/2 bg-brand-black" />
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div ref={logoRef} className="w-8 h-8 absolute opacity-0 scale-50 drop-shadow-2xl flex justify-center items-center">
          <Image 
            src="/logo.png" 
            alt="FLY Logo" 
            fill
            priority
            className="object-contain brightness-0 invert"
          />
        </div>
        <span 
          ref={counterRef}
          className="text-white font-mono text-sm tracking-widest absolute"
        >
          0%
        </span>
      </div>
    </div>
  );
}
