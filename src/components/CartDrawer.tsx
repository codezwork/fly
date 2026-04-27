"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import SafeImage from "./SafeImage";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { usePreLaunch } from "@/context/PreLaunchContext";
import { maskPrice } from "@/lib/priceMask";
import { useLenis } from "lenis/react";

export default function CartDrawer() {
  const router = useRouter();
  const isCartOpen = useStore((state) => state.isCartOpen);
  const closeCart = useStore((state) => state.closeCart);
  const cart = useStore((state) => state.cart);
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);
  const increaseQuantity = useStore((state) => state.increaseQuantity);
  const decreaseQuantity = useStore((state) => state.decreaseQuantity);
  const { isPreLaunchMode } = usePreLaunch();
  const lenis = useLenis();

  const drawerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
      gsap.to(bgRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power2.out" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.5, ease: "power4.out" });
    } else {
      document.body.style.overflow = "";
      lenis?.start();
      gsap.to(bgRef.current, { opacity: 0, pointerEvents: "none", duration: 0.3, ease: "power2.in" });
      gsap.to(drawerRef.current, { x: "100%", duration: 0.4, ease: "power3.in" });
    }
  }, [isCartOpen, lenis]);

  const subtotal = cart.reduce((acc, item) => {
    return acc + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      showToast("AUTHENTICATION REQUIRED TO CHECKOUT");
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Auth failed:", error);
      }
      return;
    }
    
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      <div 
        ref={bgRef}
        onClick={closeCart}
        className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-md opacity-0 pointer-events-none"
      />

      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-brand-offWhite z-[200] translate-x-full shadow-2xl flex flex-col cursor-none"
      >
        <div className="flex justify-between items-center px-6 py-8 border-b border-black/10">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-widest text-brand-black">Cart</h2>
          <button 
            onClick={closeCart}
            className="text-xs font-bold uppercase tracking-widest text-brand-black hover:opacity-50 transition-opacity"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 mt-12">
              <p className="font-body text-xs text-brand-grey uppercase tracking-widest">Cart is empty.</p>
              <Link 
                href="/products" 
                onClick={closeCart}
                className="border border-brand-black text-brand-black px-8 py-3 font-body text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-brand-black hover:text-white transition-colors cursor-none"
              >
                Explore Fly
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4">
                <div 
                  className={`relative w-20 h-24 bg-white/50 ${isPreLaunchMode ? "select-none [-webkit-touch-callout:none]" : ""}`}
                  onContextMenu={isPreLaunchMode ? (e) => e.preventDefault() : undefined}
                >
                  {isPreLaunchMode && (
                    <div className="absolute inset-0 z-30 backdrop-blur-sm bg-white/30 flex items-center justify-center">
                    </div>
                  )}
                  {item.product.imageStudio && (item.product.imageStudio.length > 0) ? (
                    <SafeImage 
                      src={typeof item.product.imageStudio === "string" ? item.product.imageStudio : item.product.imageStudio[0]} 
                      alt={item.product.name} 
                      fill 
                      className={`object-cover ${isPreLaunchMode ? "pointer-events-none" : ""}`}
                      draggable={!isPreLaunchMode}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="font-body text-xs font-bold uppercase tracking-widest text-brand-black mb-1">{item.product.name}</h3>
                    <span className="font-body text-[10px] uppercase text-brand-grey">Size: {item.selectedSize}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 text-xs">
                      <button onClick={() => decreaseQuantity(item.product.id, item.selectedSize)} className="hover:opacity-50 transition-opacity p-2 -ml-2">–</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.product.id, item.selectedSize)} className="hover:opacity-50 transition-opacity p-2 -mr-2">+</button>
                    </div>
                    <span className="font-body text-xs text-brand-black">{maskPrice(item.product.price, isPreLaunchMode)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-8 border-t border-black/10 bg-brand-offWhite">
          <div className="flex justify-between items-center mb-6">
            <span className="font-body text-xs font-bold uppercase tracking-widest text-brand-grey">Subtotal</span>
            <span className="font-body text-sm font-bold uppercase text-brand-black">{maskPrice(subtotal.toFixed(2), isPreLaunchMode)}</span>
          </div>
          <button 
            onClick={isPreLaunchMode ? undefined : handleCheckout}
            disabled={cart.length === 0 || isPreLaunchMode}
            className={`w-full bg-black text-white dark:bg-white dark:text-black py-5 flex justify-center items-center group relative overflow-hidden transition-colors ${isPreLaunchMode ? "opacity-50 cursor-not-allowed" : "disabled:opacity-50"}`}
          >
            <span className="relative z-10 font-heading text-xs uppercase tracking-widest font-bold group-hover:-translate-x-2 transition-transform">
              {isPreLaunchMode ? "// SYSTEM LOCKED" : "Proceed to Checkout"}
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
