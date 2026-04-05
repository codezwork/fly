"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
      gsap.to(bgRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power2.out" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.5, ease: "power4.out" });
    } else {
      document.body.style.overflow = "";
      gsap.to(bgRef.current, { opacity: 0, pointerEvents: "none", duration: 0.3, ease: "power2.in" });
      gsap.to(drawerRef.current, { x: "100%", duration: 0.4, ease: "power3.in" });
    }
  }, [isOpen]);

  return (
    <>
      {/* Blurred Background Overlay */}
      <div 
        ref={bgRef}
        onClick={closeCart}
        className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-md opacity-0 pointer-events-none"
      />

      {/* The Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-brand-offWhite z-[200] translate-x-full shadow-2xl flex flex-col cursor-none"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-8 border-b border-black/10">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-widest text-brand-black">Cart</h2>
          <button 
            onClick={closeCart}
            className="text-xs font-bold uppercase tracking-widest text-brand-black hover:opacity-50 transition-opacity"
          >
            Close
          </button>
        </div>

        {/* Cart Items (Mock Data) */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
          <div className="flex gap-4">
            <div className="relative w-20 h-24 bg-white/50">
              <Image 
                src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Hoodie" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex flex-col justify-between flex-1 py-1">
              <div>
                <h3 className="font-body text-xs font-bold uppercase tracking-widest text-brand-black mb-1">Heavyweight Hoodie</h3>
                <span className="font-body text-[10px] uppercase text-brand-grey">Size: L</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3 text-xs">
                  <button className="hover:opacity-50 transition-opacity">–</button>
                  <span>1</span>
                  <button className="hover:opacity-50 transition-opacity">+</button>
                </div>
                <span className="font-body text-xs text-brand-black">$120</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Invisible Upsell */}
        <div className="px-6 py-6 border-t border-black/10">
          <h3 className="font-body text-[10px] uppercase tracking-widest text-brand-grey mb-4">Complete the Look</h3>
          <div className="flex justify-between items-center group cursor-none">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white/50 rounded-full overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Beanie" fill className="object-cover" />
              </div>
              <span className="font-body text-xs font-bold uppercase tracking-wider text-brand-black">Ribbed Beanie</span>
            </div>
            <button className="font-body text-xs font-bold uppercase tracking-wider text-brand-black opacity-0 group-hover:opacity-100 transition-opacity">
              + Add
            </button>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-8 border-t border-black/10 bg-brand-offWhite">
          <div className="flex justify-between items-center mb-6">
            <span className="font-body text-xs font-bold uppercase tracking-widest text-brand-grey">Subtotal</span>
            <span className="font-body text-sm font-bold uppercase text-brand-black">$120</span>
          </div>
          <button className="w-full bg-brand-black text-white py-5 flex justify-center items-center group relative overflow-hidden">
            <span className="relative z-10 font-heading text-xs uppercase tracking-widest font-bold group-hover:-translate-x-2 transition-transform">
              Proceed to Checkout
            </span>
            <span className="absolute z-10 right-1/4 opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all">
              →
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
