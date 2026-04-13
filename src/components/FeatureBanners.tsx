"use client";

import { useEffect, useRef } from "react";
import SafeImage from "./SafeImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FeatureBanners() {
  const containerRef = useRef<HTMLDivElement>(null);
  const banner1Ref = useRef<HTMLDivElement>(null);
  const banner2Ref = useRef<HTMLDivElement>(null);
  const banner3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create the pinning "deck of cards" stacking effect
      // Banner 1 pins when it hits top, until the container ends
      ScrollTrigger.create({
        trigger: banner1Ref.current,
        start: "top top",
        endTrigger: containerRef.current,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });

      // Banner 2 pins when it hits top, until the container ends
      ScrollTrigger.create({
        trigger: banner2Ref.current,
        start: "top top",
        endTrigger: containerRef.current,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });

      // Subtle Parallax on images inside the banners
      const images = gsap.utils.toArray(".banner-image") as HTMLElement[];
      images.forEach((image: HTMLElement) => {
        gsap.fromTo(image, 
          { y: "-10%" },
          {
            y: "10%",
            ease: "none",
            scrollTrigger: {
              trigger: image.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    // The container holds the full scroll distance for all banners to stack
    <section ref={containerRef} className="relative w-full bg-brand-black">
      
      {/* Banner 1: Full width */}
      <div 
        ref={banner1Ref}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center z-10 bg-black"
      >
        <div className="absolute inset-0 w-full h-[120%] -top-[10%] bg-black">
          <SafeImage 
            src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Collection 01"
            fill
            className="banner-image object-cover grayscale opacity-60"
            priority
          />
        </div>
        <h2 className="relative z-20 text-white font-heading text-5xl md:text-9xl uppercase font-bold mix-blend-exclusion">
          Collection 01
        </h2>
      </div>

      {/* Banner 2: Asymmetrical width (e.g. 80% width aligned right) */}
      <div 
        ref={banner2Ref}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center z-20 bg-black"
      >
        <div className="absolute inset-0 w-full h-[120%] -top-[10%] bg-black">
          <SafeImage 
            src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Collection 01"
            fill
            className="banner-image object-cover grayscale opacity-60"
            priority
          />
        </div>
        <h2 className="relative z-20 text-white font-heading text-5xl md:text-9xl uppercase font-bold mix-blend-exclusion">
          Heavyweight <br /> Cotton
        </h2>
      </div>

      {/* Banner 3: Full width, final stack */}
      <div 
        ref={banner3Ref}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center z-30 bg-black"
      >
        <div className="absolute inset-0 w-full h-[120%] -top-[10%] bg-black">
          <SafeImage 
            src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Campaign"
            fill
            className="banner-image object-cover grayscale opacity-50"
          />
        </div>
        <div className="relative z-20 flex flex-col items-center">
          <h2 className="text-white font-heading text-4xl md:text-7xl uppercase font-bold mix-blend-exclusion mb-8">
            The Studio
          </h2>
          <button className="border border-white/30 text-white text-xs tracking-widest uppercase py-3 px-8 hover:bg-white hover:text-black transition-colors cursor-none">
            [ Watch Film ]
          </button>
        </div>
      </div>

    </section>
  );
}