"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, Product } from "@/store/useStore";
import gsap from "gsap";

export default function BuyBox({ product }: { product: Product }) {
  const openCart = useStore((state) => state.openCart);
  const addToCart = useStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const isArchived = product.availability === "archived";

  const handleAdd = () => {
    if (buttonState !== "idle" && buttonState !== "error") return;
    
    if (!selectedSize) {
      setButtonState("error");
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { x: -8 },
          { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: "power1.inOut", onComplete: () => { gsap.set(buttonRef.current, { x: 0 }); } }
        );
      }
      setTimeout(() => setButtonState("idle"), 2000);
      return;
    }

    setButtonState("loading");
    addToCart(product, selectedSize);
    
    // Simulate network add to cart
    setTimeout(() => {
      setButtonState("added");
      // Open the off-canvas drawer
      setTimeout(() => {
        openCart();
        // Reset after a delay so they can add again if they close drawer
        setTimeout(() => setButtonState("idle"), 2000);
      }, 400); 
    }, 800);
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full lg:sticky lg:top-32 lg:h-[calc(100vh-128px)] w-full py-12 px-6 lg:px-12 pointer-events-auto">
      
      {/* Header Info */}
      <div className="mb-12">
        <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest text-brand-black mb-2 leading-none">
          {product.name || "Heavyweight Hoodie"}
        </h1>
        <p className="font-body text-xs text-brand-grey font-medium tracking-widest">
          ₹{product.price || "120"}
        </p>
      </div>

      {/* Sizing Toggles */}
      <div className="mb-12">
        <div className="flex gap-6">
          {product.sizes && product.sizes.length > 0 ? product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const isSoldOut = false; // Add real inventory check later if needed
            return (
              <button
                key={size}
                onClick={() => !isSoldOut && !isArchived && setSelectedSize(size)}
                disabled={isSoldOut || isArchived}
                className={`
                  relative font-body text-sm font-bold uppercase tracking-widest transition-colors px-4 py-2 flex items-center justify-center min-w-[3rem] border
                  ${isSelected ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-transparent text-black dark:text-white border-black dark:border-white"}
                  ${!isSelected && !isSoldOut && !isArchived ? "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black" : ""}
                  ${isSoldOut || isArchived ? "opacity-50 overflow-hidden pointer-events-none" : "cursor-none"}
                `}
              >
                {size}
                {isSoldOut && (
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-black dark:bg-white -rotate-12" />
                )}
              </button>
            );
          }) : (
            <p className="font-body text-xs font-bold uppercase tracking-widest text-brand-grey">ONE SIZE</p>
          )}
        </div>
      </div>

      {/* Massive CTA */}
      <button 
        ref={buttonRef}
        onClick={handleAdd}
        disabled={buttonState !== "idle" && buttonState !== "error" || isArchived}
        className={`w-full h-[70px] uppercase font-bold tracking-widest text-xs flex items-center justify-center relative overflow-hidden transition-colors border ${
          isArchived 
            ? "bg-[#333333] text-white/50 cursor-default border-[#333333]" 
            : "bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border-black dark:border-white disabled:hover:bg-black dark:disabled:hover:bg-white cursor-none"
        } ${
          buttonState === "error" && !isArchived ? "border-2 border-red-500 !text-red-500" : ""
        }`}
      >
        {isArchived ? (
          <span>UNAVAILABLE</span>
        ) : (
          <AnimatePresence mode="wait">
            {buttonState === "idle" && (
            <motion.span 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute pointer-events-none"
            >
              Add to Bag
            </motion.span>
          )}
          {buttonState === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none flex items-center gap-2"
            >
              {/* Minimalist Spinner */}
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
          {buttonState === "added" && (
            <motion.span 
              key="added"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none"
            >
              Added.
            </motion.span>
          )}
        </AnimatePresence>
        )}
      </button>

      {/* Accordions */}
      <div className="mt-16 flex flex-col gap-6">
        
        {/* Detail Accordion */}
        <div className="border-b border-black/10 pb-6">
          <button 
            onClick={() => toggleAccordion("details")}
            className={`font-body text-[10px] uppercase tracking-[0.2em] transition-colors w-full text-left ${activeAccordion === "details" ? "text-brand-black font-bold" : "text-brand-grey"}`}
          >
            {"// "}Details
          </button>
          <motion.div 
            initial={false}
            animate={{ height: activeAccordion === "details" ? "auto" : 0, opacity: activeAccordion === "details" ? 1 : 0 }}
            className="overflow-hidden"
          >
            <p className="font-body text-xs leading-relaxed text-brand-black/80 pt-4">
              Constructed from 400GSM loopback cotton. Pre-shrunk and garment dyed for an architectural drape. Drop shoulder silhouette with reinforced raw hem detailing. 
            </p>
          </motion.div>
        </div>

        {/* Sizing Accordion */}
        <div className="border-b border-black/10 pb-6">
          <button 
            onClick={() => toggleAccordion("sizing")}
            className={`font-body text-[10px] uppercase tracking-[0.2em] transition-colors w-full text-left ${activeAccordion === "sizing" ? "text-brand-black font-bold" : "text-brand-grey"}`}
          >
            {"// "}Sizing
          </button>
          <motion.div 
            initial={false}
            animate={{ height: activeAccordion === "sizing" ? "auto" : 0, opacity: activeAccordion === "sizing" ? 1 : 0 }}
            className="overflow-hidden"
          >
            <p className="font-body text-xs leading-relaxed text-brand-black/80 pt-4">
              Model is 6&apos;1&quot; and wears a size L. Fits true to size with an intentionally dropped shoulder and cropped body.
            </p>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
