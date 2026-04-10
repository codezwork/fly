"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-black text-brand-black dark:text-white px-6 py-24 min-h-[80vh] flex flex-col justify-between relative z-10 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-0 font-body text-sm text-brand-black/80 dark:text-white/80">
        
        {/* Newsletter / Archive */}
        <div className="col-span-1">
          <h3 className="uppercase tracking-[0.2em] font-heading font-medium text-black dark:text-white mb-6">
            {"// "}The Archive
          </h3>
          <div className="relative w-full max-w-[300px] group">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS"
              className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-2 outline-none focus:border-black dark:focus:border-white transition-colors uppercase placeholder:text-black/30 dark:placeholder:text-white/30 text-black dark:text-white"
            />
            <button className="absolute right-0 bottom-2 opacity-0 group-focus-within:opacity-100 transition-opacity hover:opacity-70 text-black dark:text-white">
              <ArrowRight strokeWidth={1} size={18} />
            </button>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="col-span-1 flex flex-col items-start gap-3">
          <MagneticLink href="/manifesto">Vision</MagneticLink>
          <MagneticLink href="/concierge">Concierge</MagneticLink>
          <MagneticLink href="/shipping">Shipping</MagneticLink>
        </div>

        {/* Links Column 2 */}
        <div className="col-span-1 flex flex-col items-start gap-3">
          <MagneticLink href="https://instagram.com" external>Instagram</MagneticLink>
          <MagneticLink href="https://twitter.com" external>Twitter</MagneticLink>
          <MagneticLink href="/terms">Terms</MagneticLink>
        </div>

      </div>

      <div className="w-full mt-32 flex flex-col items-center">
        {/* Massive Typography */}
        <div className="w-full relative overflow-hidden flex items-end justify-center pointer-events-none pb-4">
          <h1 className="font-heading font-bold text-[18vw] leading-[0.8] tracking-tighter text-black dark:text-white uppercase text-center w-full transition-colors duration-300">
            FLY STORE
          </h1>
        </div>
        
        <div className="w-full flex justify-between items-center text-xs text-black/40 dark:text-white/40 uppercase tracking-widest border-t border-black/10 dark:border-white/10 pt-6 transition-colors duration-300">
          <span>© {new Date().getFullYear()}</span>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-black dark:hover:text-white transition-colors pointer-events-auto"
          >
            ↑ TOP
          </button>
        </div>
      </div>
    </footer>
  );
}

// Magnetic Link Component Logic
function MagneticLink({ children, href, external = false }: { children: React.ReactNode, href: string, external?: boolean }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link 
        href={href} 
        target={external ? "_blank" : "_self"}
        className="uppercase tracking-[0.1em] text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors inline-block"
      >
        {children}
      </Link>
    </motion.div>
  );
}
