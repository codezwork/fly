"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface BreadcrumbProps {
  collectionHandle: string;
  collectionName: string;
  productName: string;
}

export default function BreadcrumbNav({ collectionHandle, collectionName, productName }: BreadcrumbProps) {
  const router = useRouter();
  const lenis = useLenis();

  const handleSafeNavigate = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    // 1. Instantly kill scroll debt BEFORE Next.js starts the route transition
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    
    // 2. Force GSAP to clear its mathematical memory of the pin-spacers
    ScrollTrigger.clearScrollMemory?.();
    ScrollTrigger.refresh(true);

    // 3. Perform the soft route without Next.js native scroll interference
    router.push(path, { scroll: false });
  };

  return (
    <div className="w-full px-6 lg:px-12 mb-8 flex items-center">
      <p className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-grey">
        <a 
          href="/products" 
          onClick={(e) => handleSafeNavigate(e, "/products")}
          className="hover:text-brand-black transition-colors cursor-none"
        >
          Products
        </a>
        <span className="mx-2">/</span>
        <a 
          href={`/collections/${collectionHandle}`} 
          onClick={(e) => handleSafeNavigate(e, `/collections/${collectionHandle}`)}
          className="hover:text-brand-black transition-colors cursor-none"
        >
          {collectionName}
        </a>
        <span className="mx-2">/</span>
        <span className="text-brand-black">{productName}</span>
      </p>
    </div>
  );
}
