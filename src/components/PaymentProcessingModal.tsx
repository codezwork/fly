"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";

interface PaymentProcessingModalProps {
  isOpen: boolean;
}

export default function PaymentProcessingModal({ isOpen }: PaymentProcessingModalProps) {
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen, lenis]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg border border-white/20 p-8 md:p-12 shadow-[8px_8px_0_0_rgba(255,255,255,1)] bg-black flex flex-col items-center text-center">
        <h2 className="uppercase tracking-[0.2em] font-heading font-bold text-white mb-6 text-2xl md:text-3xl animate-pulse">
          {"// "}SECURING TRANSACTION
        </h2>
        
        <p className="font-body text-xs md:text-sm text-white/80 leading-relaxed uppercase tracking-widest font-bold">
          DO NOT CLOSE OR REFRESH THIS WINDOW.<br /><br />
          YOUR ORDER IS BEING WRITTEN TO THE VAULT.
        </p>

        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 bg-white animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-white animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-white animate-bounce"></div>
        </div>
      </div>
    </div>,
    document.body
  );
}
