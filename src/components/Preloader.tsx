"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function Preloader() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
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

    // The "FLY" Flash replacement
    tl.to(counterRef.current, {
      opacity: 0,
      duration: 0.1,
    });
    
    tl.set(counterRef.current, {
      text: "FLY", // Requires TextPlugin, but we can just use innerText in a callback or set via React state
      opacity: 1,
      scale: 1.2,
      delay: 0.1, // split second pause
    });

    // We can swap the text manually using Call
    tl.call(() => {
      if (counterRef.current) {
        counterRef.current.innerText = "FLY";
      }
    }, [], "-=0.1");

    // Split background and slide up/down
    tl.to(".preloader-top", {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      delay: 0.2, // Split second pause after "FLY"
    }, "split");
    
    tl.to(".preloader-bottom", {
      yPercent: 100,
      duration: 1,
      ease: "power4.inOut",
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
      
      <span 
        ref={counterRef}
        className="relative z-10 text-white font-mono text-sm tracking-widest"
      >
        0%
      </span>
    </div>
  );
}
