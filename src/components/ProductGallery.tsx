"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";
import { motion } from "framer-motion";

export default function ProductGallery({ images }: { images: string[] }) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  // Fallback to high res mock images.
  const displayImages = images?.length > 0 ? images : [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <div className="w-full flex md:flex-col overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none hide-scrollbar">
      {displayImages.map((src, i) => (
        <div 
          key={i} 
          className="relative flex-shrink-0 w-full md:w-full h-[80vh] md:h-[120vh] snap-center cursor-none bg-[#EAEAEA]"
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
  );
}
