"use client";

import Link from "next/link";
import SafeImage from "./SafeImage";
import { Product } from "@/store/useStore";
import { maskPrice } from "@/lib/priceMask";
import { usePreLaunch } from "@/context/PreLaunchContext";

export default function ProductCard({ product, priority = false }: { product: Product, priority?: boolean }) {
  const { isPreLaunchMode } = usePreLaunch();

  return (
    <Link 
      href={`/products/${product.handle}`}
      data-cursor="view" 
      className="product-card group flex flex-col items-center justify-center cursor-none w-[80vw] md:w-[30vw] flex-shrink-0"
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
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover absolute inset-0 z-10 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
        />
        <SafeImage 
          src={typeof product.imageLifestyle === "string" ? product.imageLifestyle : (product.imageLifestyle?.[0] || '')} 
          alt={`${product.name} Lifestyle`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
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

      <div className="text-center w-full px-2">
        <h3 className="text-brand-black font-body font-bold text-[12px] tracking-widest uppercase mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-brand-grey font-body text-[10px] tracking-widest">
          {maskPrice(product.price, isPreLaunchMode)}
        </p>
      </div>
    </Link>
  );
}
