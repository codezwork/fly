"use client";

import { useNav } from "@/context/NavContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";
import { Collection } from "@/components/AdminCollectionManager";

export default function NavDrawer() {
  const { isNavOpen, closeNav } = useNav();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colSnap, prodSnap] = await Promise.all([
          getDocs(collection(db, "collections")),
          getDocs(collection(db, "products"))
        ]);
        
        setCollections(colSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Collection));
        
        const allProducts = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
        const seenCollections = new Set<string>();
        const uniqueProducts: Product[] = [];
        
        for (const prod of allProducts) {
          if (!seenCollections.has(prod.collectionHandle) && prod.collectionHandle) {
            seenCollections.add(prod.collectionHandle);
            uniqueProducts.push(prod);
          }
        }
        setProducts(uniqueProducts);
      } catch (err) {
        console.error("Failed to fetch nav data", err);
      }
    };
    fetchData();
  }, []);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNavOpen]);

  return (
    <AnimatePresence>
      {isNavOpen && (
        <>
          {/* Backdrop - Brutalist stark contrast */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNav}
            className="fixed inset-0 bg-brand-offWhite/80 z-[150] cursor-none"
            style={{ WebkitBackdropFilter: "blur(24px)", backdropFilter: "blur(24px)" }}
            data-cursor="view"
          />

          {/* Drawer Layer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="fixed top-0 left-0 w-full md:w-[70vw] lg:w-[60vw] h-[100dvh] bg-brand-black z-[160] flex flex-col pt-24 px-6 md:px-16"
          >
            {/* Close Button */}
            <button
              onClick={closeNav}
              className="absolute top-8 left-6 md:left-16 text-brand-offWhite hover:opacity-50 transition-opacity p-2 z-[170]"
            >
              <X size={28} strokeWidth={1} />
            </button>

            {/* Block scroll container (fixes Safari flex overflow bug) */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-32">
              <div className="min-h-full flex flex-col justify-center gap-16 md:gap-24 pt-8">
                
                {/* COLLECTIONS RAIL */}
                <div>
                  <div className="w-full flex justify-between items-end mb-4 border-b border-white/20 pb-2">
                     <h2 className="text-white/50 font-body text-xs uppercase tracking-widest font-bold">Collections</h2>
                  </div>
                  <div className="w-full overflow-x-auto no-scrollbar relative z-10 flex gap-12 sm:gap-24 pb-4">
                    {collections.map((col, idx) => (
                      <motion.div 
                        key={col.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Link 
                          href={`/collections/${col.handle}`}
                          onClick={closeNav}
                          className="group flex items-center gap-4 text-white hover:text-brand-offWhite transition-colors whitespace-nowrap"
                        >
                          <span className="font-heading text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.name}
                          </span>
                          <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={32} />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* PRODUCTS RAIL */}
                <div>
                  <div className="w-full flex justify-between items-end mb-4 border-b border-white/20 pb-2">
                     <h2 className="text-white/50 font-body text-xs uppercase tracking-widest font-bold">Index</h2>
                     <Link href="/products" onClick={closeNav} className="text-white text-[10px] uppercase tracking-widest hover:opacity-50 transition-opacity">View All</Link>
                  </div>
                  <div className="w-full overflow-x-auto no-scrollbar relative z-10 flex gap-6 sm:gap-12 pb-4">
                    {products.map((prod, idx) => (
                      <motion.div 
                        key={prod.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="min-w-[180px] sm:min-w-[240px] flex-shrink-0 group"
                      >
                        <Link href={`/products/${prod.handle}`} onClick={closeNav} className="w-full flex flex-col block">
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-brand-offWhite mb-4">
                            <Image 
                              src={typeof prod.imageStudio === 'string' ? prod.imageStudio : (prod.imageStudio?.[0] || "")}
                              alt={prod.name}
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                          </div>
                          <div className="flex justify-between items-center w-full">
                            <h3 className="text-white font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate max-w-[70%]">
                              {prod.name}
                            </h3>
                            <span className="text-white/60 font-body text-[10px] sm:text-xs tracking-widest">
                              ₹{prod.price}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* BRAND LOGO FOOTER */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 left-6 md:left-16 right-6 md:right-16 flex justify-between items-center border-t border-white/20 pt-6"
            >
              <nav className="flex gap-6 z-10 relative">
                <Link href="/manifesto" onClick={closeNav} className="text-white text-[10px] uppercase tracking-widest hover:opacity-50">Vision</Link>
                <Link href="/concierge" onClick={closeNav} className="text-white text-[10px] uppercase tracking-widest hover:opacity-50">Concierge</Link>
              </nav>
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-[0.2em] text-white uppercase pointer-events-none">
                FLY STORE
              </h1>
            </motion.div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
