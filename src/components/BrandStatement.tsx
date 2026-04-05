"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register the ScrollTrigger plugin with Next.js
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BrandStatement() {
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // GSAP Context ensures animations are cleaned up properly when leaving the page
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%", // Triggers when the text is 85% down the screen
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    // The z-20 ensures this white section naturally slides over the dark hero
    <section className="relative w-full bg-brand-offWhite py-32 md:py-48 flex flex-col justify-between overflow-hidden z-20">
      
      {/* The Cinematic Statement Reveal */}
      <div className="container mx-auto px-6 text-center mb-24 md:mb-40">
        <h2 
          ref={textRef}
          className="text-brand-black font-heading text-4xl md:text-6xl lg:text-8xl uppercase font-bold tracking-tight leading-tight"
        >
          Reducing Noise.<br />
          Elevating Form.
        </h2>
      </div>

      {/* The Infinite Scrolling Marquee */}
      {/* We add a subtle top/bottom border to frame the ticker tape */}
      <div className="w-full border-y border-brand-black/10 py-5 flex overflow-hidden group">
        
        {/* The 'animate-marquee' handles the infinite scrolling.
          The 'group-hover' class pauses the animation when the user hovers over it[cite: 68].
        */}
        <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] cursor-none">
          {/* We duplicate the text multiple times to ensure the loop never breaks on wide screens */}
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-brand-black text-lg md:text-2xl font-heading font-medium tracking-[0.2em] px-8 uppercase">
              {"//"} Premium Cotton {"//"} Designed in Chennai {"//"} Engineered for the Global Silhouette
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}