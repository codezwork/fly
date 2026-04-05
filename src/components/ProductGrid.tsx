"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { PRODUCTS as MOCK_PRODUCTS } from "@/lib/mockData";

export default function ProductGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal of products as user scrolls to the grid
      gsap.fromTo(
        ".product-card",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 75%",
          }
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-brand-offWhite py-32 px-6">
      <div 
        ref={gridRef}
        // Borderless grid with massive gutters for negative space
        className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32 md:gap-x-24 md:gap-y-48"
      >
        {MOCK_PRODUCTS.map((product) => (
          <Link 
            key={product.id}
            href={`/products/${product.handle}`}
            // Trigger "VIEW" cursor via data attribute for CustomCursor.tsx
            data-cursor="view" 
            className="product-card group flex flex-col items-center justify-center cursor-none"
          >
            {/* Image Container - No borders, no shadows */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-white/50 mb-6">
              
              {/* Studio Image (Default) */}
              <Image 
                src={product.imageStudio} 
                alt={`${product.name} Studio`}
                fill
                className="object-cover absolute inset-0 z-10 transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Lifestyle Image (Revealed on hover) */}
              <Image 
                src={product.imageLifestyle} 
                alt={`${product.name} Lifestyle`}
                fill
                className="object-cover absolute inset-0 z-0 scale-[1.03] transition-transform duration-[2s] ease-out group-hover:scale-100"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Typography hierarchy as specified: bold 12px title, lighter 10px price */}
            <div className="text-center">
              <h3 className="text-brand-black font-body font-bold text-[12px] tracking-widest uppercase mb-1">
                {product.name}
              </h3>
              <p className="text-brand-grey font-body text-[10px] tracking-widest">
                ${product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <div className="w-full flex justify-center mt-24 md:mt-32">
        <Link 
          href="/products"
          className="group flex items-center justify-center border border-brand-black text-brand-black py-4 px-12 md:px-16 uppercase font-body text-[10px] md:text-xs font-bold tracking-[0.2em] hover:bg-brand-black hover:text-white transition-colors duration-300 cursor-none"
          data-cursor="view"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}
