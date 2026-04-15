"use client";

import { useEffect, useRef, useState } from "react";
import SafeImage from "./SafeImage";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";
import { usePreLaunch } from "@/context/PreLaunchContext";
import { maskPrice } from "@/lib/priceMask";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductGrid({ products: initialProducts, hideCTA = false }: { products?: Product[], hideCTA?: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const { isPreLaunchMode } = usePreLaunch();

  useEffect(() => {
    if (initialProducts) return;
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [initialProducts]);

  useEffect(() => {
    if (loading || products.length === 0) return;
    
    // Slight delay to allow DOM to paint
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
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
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, products]);

  if (loading) {
    return (
      <section className="w-full bg-brand-offWhite py-32 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32 md:gap-x-24 md:gap-y-48 animate-pulse">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <div className="w-full aspect-[3/4] bg-brand-grey/20 mb-6" />
              <div className="w-24 h-4 bg-brand-grey/30 mb-2" />
              <div className="w-12 h-3 bg-brand-grey/20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-brand-offWhite py-32 px-6">
      <div 
        ref={gridRef}
        className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32 md:gap-x-24 md:gap-y-48"
      >
        {products.map((product) => (
          <Link 
            key={product.id}
            href={`/products/${product.handle}`}
            data-cursor="view" 
            className="product-card group flex flex-col items-center justify-center cursor-none opacity-0"
          >
            <div 
              className={`relative w-full aspect-[3/4] overflow-hidden bg-white/50 mb-6 ${isPreLaunchMode ? "select-none [-webkit-touch-callout:none]" : ""}`}
              onContextMenu={isPreLaunchMode ? (e) => e.preventDefault() : undefined}
            >
              {isPreLaunchMode && (
                <div className="absolute inset-0 z-30 backdrop-blur-md bg-white/30 flex items-center justify-center">
                  <span className="font-heading font-bold text-lg md:text-xl text-black uppercase tracking-widest px-4 text-center select-none shadow-black drop-shadow-md">
                    // CLASSIFIED<br/>SCHEMATICS
                  </span>
                </div>
              )}
              <SafeImage 
                src={typeof product.imageStudio === "string" ? product.imageStudio : (product.imageStudio?.[0] || '')} 
                alt={`${product.name} Studio`}
                fill
                className="object-cover absolute inset-0 z-10 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
                sizes="(max-width: 768px) 100vw, 50vw"
                draggable={false}
              />
              <SafeImage 
                src={typeof product.imageLifestyle === "string" ? product.imageLifestyle : (product.imageLifestyle?.[0] || '')} 
                alt={`${product.name} Lifestyle`}
                fill
                className="object-cover absolute inset-0 z-0 scale-[1.03] transition-transform duration-[2s] ease-out group-hover:scale-100 pointer-events-none"
                sizes="(max-width: 768px) 100vw, 50vw"
                draggable={false}
              />
              
              {/* Archived Tag */}
              {product.availability === 'archived' && (
                <div className="absolute bottom-4 right-4 z-20 bg-brand-black text-white px-3 py-1 font-body text-[10px] font-bold tracking-widest uppercase">
                  [ARCHIVED]
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-brand-black font-body font-bold text-[12px] tracking-widest uppercase mb-1">
                {product.name}
              </h3>
              <p className="text-brand-grey font-body text-[10px] tracking-widest">
                {maskPrice(product.price, isPreLaunchMode)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!hideCTA && (
        <div className="w-full flex justify-center mt-24 md:mt-32">
          <Link 
            href="/products"
            className="group flex items-center justify-center border border-brand-black text-brand-black py-4 px-12 md:px-16 uppercase font-body text-[10px] md:text-xs font-bold tracking-[0.2em] hover:bg-brand-black hover:text-white transition-colors duration-300 cursor-none"
            data-cursor="view"
          >
            View All Products
          </Link>
        </div>
      )}
    </section>
  );
}
