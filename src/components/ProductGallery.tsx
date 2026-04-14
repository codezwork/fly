"use client";

import { useLayoutEffect, useRef, useState } from "react";
import SafeImage from "./SafeImage";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductGallery({ images }: { images: string[] }) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const displayImages = images?.length > 0 ? images : [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop",
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const pinDistance = sectionRef.current?.offsetWidth || 0;
        
        gsap.to(sectionRef.current, {
          x: () => -(sectionRef.current!.scrollWidth - window.innerWidth * 0.6),
          ease: "none",
          scrollTrigger: {
            trigger: triggerRef.current,
            pin: true,
            scrub: 1,
            start: "top 128px", // Matches navbar height/padding
            end: () => `+=${sectionRef.current!.scrollWidth * 1.5}`,
            invalidateOnRefresh: true,
          }
        });

        // Sync with Lenis/DOM after layout settles
        const timer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
        return () => clearTimeout(timer);
      });

      return () => mm.revert();
    }, triggerRef);

    return () => ctx.revert();
  }, [displayImages]);

  return (
    <div ref={triggerRef} className="w-full">
      <div 
        ref={sectionRef} 
        className="flex flex-row overflow-x-auto snap-x snap-mandatory w-full md:w-max hide-scrollbar"
      >
        {displayImages.map((src, i) => (
          <div 
            key={i} 
            className="relative flex-shrink-0 w-[90vw] md:h-[calc(100vh-8rem)] md:w-auto md:max-w-none snap-center aspect-[3/4] cursor-none bg-[#EAEAEA]"
            data-cursor="zoom"
          >
            {/* Zoom Interaction Area */}
            <motion.div 
              className="w-full h-full relative overflow-hidden"
              onHoverStart={() => setZoomedIndex(i)}
              onHoverEnd={() => setZoomedIndex(null)}
            >
              <motion.div
                className="w-full h-full origin-center relative cursor-none"
                initial={{ scale: 1 }}
                animate={{ scale: zoomedIndex === i ? 1.5 : 1 }}
                transition={{ ease: "easeOut", duration: 0.4 }}
              >
                 <SafeImage 
                    src={src}
                    alt={`Product View ${i + 1}`}
                    fill
                    className="object-cover cursor-none"
                    priority={i === 0}
                 />
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
