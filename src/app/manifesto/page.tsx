"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ManifestoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Hero Text blur-to-focus and scale out
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 5]);
  const heroOpacity = useTransform(scrollYProgress, [0.1, 0.2], [1, 0]);
  const heroFilter = useTransform(scrollYProgress, [0, 0.05], ["blur(10px)", "blur(0px)"]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // The Scrolling Monologue (grey to black based on center screen)
      const sentences = gsap.utils.toArray(".manifesto-sentence") as HTMLElement[];
      sentences.forEach((sentence: HTMLElement) => {
        gsap.to(sentence, {
          color: "#000000",
          scrollTrigger: {
            trigger: sentence,
            start: "top 60%",    // Starts turning black as it enters middle
            end: "bottom 40%",   // Full black between 60% and 40%
            scrub: true,
          }
        });
        // Fade back to grey as it leaves top
        gsap.to(sentence, {
          color: "#E0E0E0",
          scrollTrigger: {
            trigger: sentence,
            start: "top 30%",
            end: "bottom 10%",
            scrub: true,
          }
        });
      });

      // Pin and fade the material videos using a single Timeline
      const materialsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".materials-section",
          start: "top top",
          end: "+=300%", // Pin for 3 screen heights
          pin: true,
          scrub: true,
        }
      });

      const vids = gsap.utils.toArray(".material-layer");
      
      materialsTl
        .to(vids[1] as HTMLElement, { opacity: 1, ease: "none", duration: 1 })
        .to(vids[2] as HTMLElement, { opacity: 1, ease: "none", duration: 1 })
        .to({}, { duration: 1 }); // Holds Layer 3 for the final 100% scroll

      // Refresh ScrollTrigger to ensure all layout shifts from Next.js routing/hydration are accounted for
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="w-full relative overflow-x-hidden">
      
      {/* 1. The Hero Statement */}
      <section className="relative w-full h-[150vh] bg-brand-black z-50">
        <div className="sticky top-0 w-full h-screen flex justify-center items-center overflow-hidden">
          <motion.h1 
            style={{ scale: heroScale, opacity: heroOpacity, filter: heroFilter }}
            className="text-white font-heading text-6xl md:text-9xl font-bold uppercase tracking-widest text-center whitespace-nowrap mix-blend-difference"
          >
            Reducing<br />Noise.
          </motion.h1>
        </div>
      </section>

      {/* 2. The Scrolling Monologue */}
      <section className="relative w-full bg-brand-offWhite py-[30vh]">
        <div className="container mx-auto px-6 max-w-4xl flex flex-col gap-[80vh]">
          <p className="manifesto-sentence text-4xl md:text-6xl font-heading font-medium tracking-tight text-[#E0E0E0] uppercase leading-tight">
            We believe in the power of the silhouette.
          </p>
          <p className="manifesto-sentence text-4xl md:text-6xl font-heading font-medium tracking-tight text-[#E0E0E0] uppercase leading-tight">
            We reject the noise of fast fashion.
          </p>
          <p className="manifesto-sentence text-4xl md:text-6xl font-heading font-medium tracking-tight text-[#E0E0E0] uppercase leading-tight">
            We engineer garments that last.
          </p>
        </div>
      </section>

      {/* 3. The Origin */}
      <section className="w-full bg-brand-offWhite py-40">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1 text-sm md:text-base font-body leading-relaxed max-w-sm tracking-wide">
            <p className="mb-6">
              Led by creative director Madhur, FLY STORE was born from a ruthless obsession with structural perfection. 
            </p>
            <p>
              Conceived in Chennai and designed for the global silhouette, the brand bridges the gap between architectural precision and everyday wear.
            </p>
          </div>
          
          <div className="order-1 md:order-2 relative aspect-[3/4] group cursor-none data-cursor-view">
            <Image 
              src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Studio Portrait"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            {/* Reveal Mask Animation element could go here */}
            <div className="absolute inset-0 bg-brand-black origin-right transition-transform duration-1000 group-hover:scale-x-0" />
          </div>
        </div>
      </section>

      {/* 4. The Materials */}
      <section className="materials-section relative w-full h-screen bg-brand-black overflow-hidden">
        {/* Layer 1 */}
        <div className="material-layer absolute inset-0 z-10 w-full h-full opacity-100">
          <Image src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Fabric" fill className="object-cover grayscale" />
          <h2 className="absolute inset-0 flex justify-center items-center font-heading text-4xl md:text-7xl font-bold uppercase mix-blend-difference text-white">
            {"// "}400GSM HEAVYWEIGHT COTTON
          </h2>
        </div>
        
        {/* Layer 2 */}
        <div className="material-layer absolute inset-0 z-20 w-full h-full opacity-0">
          <Image src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Hardware" fill className="object-cover grayscale" />
          <h2 className="absolute inset-0 flex justify-center items-center font-heading text-4xl md:text-7xl font-bold uppercase mix-blend-difference text-white">
            {"// "}ENGINEERED HARDWARE
          </h2>
        </div>

        {/* Layer 3 */}
        <div className="material-layer absolute inset-0 z-30 w-full h-full opacity-0">
          <Image src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Drape" fill className="object-cover grayscale" />
          <h2 className="absolute inset-0 flex justify-center items-center font-heading text-4xl md:text-7xl font-bold uppercase mix-blend-difference text-white">
            {"// "}DRAPE & STRUCTURE
          </h2>
        </div>
      </section>

      {/* 5. The Handoff */}
      <section className="relative w-full h-screen bg-brand-offWhite flex justify-center items-center">
        <Link href="/" className="group relative z-40">
           <div className="w-16 h-16 rounded-full bg-brand-black flex justify-center items-center group-hover:scale-[100] transition-transform duration-[1.5s] ease-in-out cursor-none" />
           <span className="absolute inset-0 flex justify-center items-center text-xs font-bold uppercase tracking-widest text-brand-offWhite whitespace-nowrap mix-blend-difference pointer-events-none z-50">
              Enter Store
           </span>
        </Link>
      </section>

    </main>
  );
}
