"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";
import ProductCard from "./ProductCard";

export default function HomeShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionsMap, setCollectionsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pSnap, cSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "collections"))
        ]);
        const data = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(data);

        const cMap: Record<string, string> = {};
        cSnap.docs.forEach(doc => {
          cMap[doc.data().handle] = doc.data().name;
        });
        setCollectionsMap(cMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getDataGroups = () => {
    // Sort by createdAt descending
    const sorted = [...products].sort((a, b) => {
      const aTime = (a as any).createdAt ? (typeof (a as any).createdAt === 'number' ? (a as any).createdAt : (a as any).createdAt?.seconds * 1000 || 0) : 0;
      const bTime = (b as any).createdAt ? (typeof (b as any).createdAt === 'number' ? (b as any).createdAt : (b as any).createdAt?.seconds * 1000 || 0) : 0;
      return bTime - aTime;
    });

    const grouped: { handle: string, name: string, categories: { name: string, item: Product }[] }[] = [];

    sorted.forEach((product) => {
      const colHandle = product.collectionHandle || "other";
      let colGroup = grouped.find(g => g.handle === colHandle);
      if (!colGroup) {
        colGroup = {
          handle: colHandle,
          name: collectionsMap[colHandle] || colHandle.replace(/-/g, " "),
          categories: []
        };
        grouped.push(colGroup);
      }

      const catName = product.category || "General";
      if (!colGroup.categories.find(c => c.name === catName)) {
        colGroup.categories.push({ name: catName, item: product });
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <section className="w-full bg-brand-offWhite py-32 px-6 overflow-hidden">
        <div className="container mx-auto flex flex-col gap-8 animate-pulse">
            <div className="h-8 bg-brand-grey/20 w-48 mb-4" />
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[80vw] md:w-[30vw] flex-shrink-0 flex flex-col">
                  <div className="w-full aspect-[3/4] bg-brand-grey/20 mb-6" />
                  <div className="w-24 h-4 bg-brand-grey/30 mb-2 mx-auto" />
                </div>
              ))}
            </div>
        </div>
      </section>
    );
  }

  const groupedData = getDataGroups();

  return (
    <section className="w-full bg-brand-offWhite py-32 flex flex-col gap-32 overflow-hidden">
      {groupedData.map((group) => (
        <div key={group.handle} className="w-full flex flex-col">
          <div className="container mx-auto px-6 mb-8">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[0.2em] text-brand-black mb-2">
              // {group.name}
            </h2>
          </div>

          {/* Horizontal scroll container */}
          <div className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 px-6 md:px-12 lg:px-24">
            {group.categories.map((cat) => (
              <div key={cat.name} className="flex flex-col snap-start shrink-0">
                <p className="font-body text-[10px] md:text-xs tracking-widest text-brand-grey uppercase mb-4 pl-2 font-bold">
                  // {cat.name}
                </p>
                <ProductCard product={cat.item} />
              </div>
            ))}
            {/* spacer for end of scroll */}
            <div className="w-[1vw] shrink-0" />
          </div>
        </div>
      ))}
    </section>
  );
}
