"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, Product } from "@/store/useStore";
import gsap from "gsap";
import { usePreLaunch } from "@/context/PreLaunchContext";
import { maskPrice } from "@/lib/priceMask";
import { Share2, Check } from "lucide-react";
import PreLaunchModal from "./PreLaunchModal";

export default function BuyBox({ product }: { product: Product }) {
  const openCart = useStore((state) => state.openCart);
  const addToCart = useStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isPreLaunchMode } = usePreLaunch();
  
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

  const handleShare = async () => {
    const shareData = { title: product.name, url: window.location.href };
    try {
      if (!navigator.share) throw new Error("Web Share not supported");
      await navigator.share(shareData);
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipboardErr) {
        console.error("Clipboard fallback failed", clipboardErr);
      }
    }
  };

  return (
    <div className="flex flex-col w-full py-12 px-6 lg:px-12 pointer-events-auto">
      
      {/* Header Info */}
      <div className="mb-12">
        <div className="flex flex-row items-start justify-between gap-4 mb-2">
          <h1 className="font-heading font-bold uppercase tracking-widest text-brand-black leading-none text-[clamp(2rem,4vw,3rem)]">
            {product.name || "Heavyweight Hoodie"}
          </h1>
          {!isPreLaunchMode && (
            <button
              onClick={handleShare}
              className="p-2 md:p-3 flex items-center justify-center hover:bg-brand-black hover:text-brand-offWhite transition-colors cursor-none shrink-0"
              aria-label="Share product"
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
          )}
        </div>
        <p className="font-body text-xs text-brand-grey font-medium tracking-widest">
          {maskPrice(product.price || "120", isPreLaunchMode)}
        </p>
      </div>

      {/* Lockdown conditional */}
      {isPreLaunchMode ? (
        <div className="mb-12">
          <button 
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="w-full h-[70px] bg-brand-black text-brand-offWhite font-heading text-lg font-bold uppercase tracking-[0.2em] border border-brand-black hover:bg-brand-grey transition-colors cursor-none"
          >
            {"// CLASSIFIED SCHEMATICS"}
          </button>
        </div>
      ) : (
        <>
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
          {/* 👇 THIS IS THE MISSING ERROR BLOCK 👇 */}
          {buttonState === "error" && (
            <motion.span 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute pointer-events-none font-bold tracking-widest"
            >
              SELECT SIZE
            </motion.span>
          )}
        </AnimatePresence>
        )}
      </button>
      </>
      )}

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

      <PreLaunchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
