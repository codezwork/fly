"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="w-full max-w-2xl border border-brand-black/20 p-8 md:p-16 flex flex-col items-center text-center bg-white">
      <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-widest text-brand-black mb-6">
        Order Secured
      </h1>
      <p className="font-body text-xs md:text-sm text-brand-grey uppercase tracking-widest mb-12">
        We have received your payment.
      </p>

      <div className="w-full flex-col flex items-center border-t border-b border-black/10 py-8 mb-12">
        <span className="font-body text-[10px] text-brand-grey uppercase tracking-widest mb-2">Order Reference</span>
        <span className="font-heading text-xl md:text-2xl font-bold uppercase tracking-widest text-brand-black">
          {orderId || "FLY-UNKNOWN"}
        </span>
      </div>

      <div className="flex w-full gap-4 flex-col sm:flex-row justify-center">
        <Link 
          href="/account"
          className="flex-1 border border-brand-black bg-brand-black text-white hover:bg-white hover:text-brand-black transition-colors py-5 uppercase font-bold tracking-widest text-[10px] sm:text-xs cursor-none"
        >
          View in Account
        </Link>
        <Link 
          href="/products"
          className="flex-1 border border-brand-black text-brand-black hover:bg-brand-black hover:text-white transition-colors py-5 uppercase font-bold tracking-widest text-[10px] sm:text-xs cursor-none"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="w-full min-h-screen bg-brand-offWhite pt-32 px-6 flex items-center justify-center pointer-events-auto">
      <Suspense fallback={<div className="animate-pulse">LOADING...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
