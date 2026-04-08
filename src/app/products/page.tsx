"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";
import { Collection } from "@/components/AdminCollectionManager";

export default function ProductsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colSnap, prodSnap] = await Promise.all([
          getDocs(collection(db, "collections")),
          getDocs(collection(db, "products"))
        ]);
        
        setCollections(colSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Collection));
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product));
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
     return <main className="w-full min-h-screen bg-brand-offWhite flex items-center justify-center font-heading text-xl uppercase tracking-widest text-brand-black">LOADING ARCHIVE...</main>;
  }

  return (
    <main className="w-full min-h-screen bg-brand-offWhite pt-32 pb-24 text-brand-black">
      
      {/* 1. All Collections Highlight */}
      <section className="w-full px-6 md:px-12 mb-32">
        <div className="flex justify-between items-end mb-8 border-b border-black/20 pb-4">
          <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tighter loading-none">
            Index
          </h1>
          <span className="font-body text-xs uppercase tracking-widest text-brand-grey font-bold">
            All Collections
          </span>
        </div>
        
        <div className="w-full overflow-x-auto no-scrollbar relative flex gap-6 sm:gap-12 pb-8">
          {collections.map((col, idx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="flex-shrink-0 w-[400px] md:w-[600px] group"
            >
              <Link href={`/collections/${col.handle}`} className="block relative cursor-none" data-cursor="view">
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-brand-black mb-4">
                  <Image 
                    src={col.posterUrl}
                    alt={col.name}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  
                  <div className="absolute bottom-6 left-6 z-10">
                    <h2 className="text-white font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest drop-shadow-lg">
                      {col.name}
                    </h2>
                  </div>
                </div>
                <p className="font-body text-xs md:text-sm uppercase tracking-widest text-brand-grey group-hover:text-brand-black transition-colors">
                  Explore →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Products By Category */}
      <section className="w-full px-6 md:px-12 flex flex-col gap-32">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category);
          
          return (
            <div key={category} className="w-full">
              <div className="border-b border-black/20 pb-4 mb-12">
                <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest opacity-30">
                  {category}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16 md:gap-x-12 md:gap-y-24">
                {categoryProducts.map((product) => (
                   <Link 
                     key={product.id}
                     href={`/products/${product.handle}`}
                     className="group flex flex-col items-center cursor-none"
                     data-cursor="view"
                   >
                     <div className="relative w-full aspect-[3/4] overflow-hidden bg-brand-black/5 mb-4">
                       <Image 
                         src={typeof product.imageStudio === 'string' ? product.imageStudio : (product.imageStudio?.[0] || '')} 
                         alt={product.name}
                         fill
                         className="object-cover transition-opacity duration-700 group-hover:opacity-0"
                       />
                       <Image 
                         src={typeof product.imageLifestyle === 'string' ? product.imageLifestyle : (product.imageLifestyle?.[0] || '')} 
                         alt={`${product.name} Lifestyle`}
                         fill
                         className="object-cover absolute inset-0 -z-10 scale-[1.03] transition-transform duration-[2s] ease-out group-hover:scale-100"
                       />
                     </div>
                     <div className="text-center w-full">
                       <h3 className="text-brand-black font-body font-bold text-[10px] md:text-xs tracking-widest uppercase mb-1 truncate">
                         {product.name}
                       </h3>
                       <p className="text-brand-grey font-body text-[10px] tracking-widest">
                         ${product.price}
                       </p>
                     </div>
                   </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      
    </main>
  );
}
