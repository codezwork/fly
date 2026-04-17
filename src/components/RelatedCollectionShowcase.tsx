import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";
import ProductCard from "./ProductCard";

export default async function RelatedCollectionShowcase({ 
  currentProductId, 
  currentCollectionHandle 
}: { 
  currentProductId: string, 
  currentCollectionHandle: string 
}) {

  if (!currentCollectionHandle) return null;

  const q = query(collection(db, "products"), where("collectionHandle", "==", currentCollectionHandle));
  const snap = await getDocs(q);
  const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

  const filtered = products.filter(p => p.id !== currentProductId);
  
  const sorted = [...filtered].sort((a, b) => {
    const aTime = (a as any).createdAt ? (typeof (a as any).createdAt === 'number' ? (a as any).createdAt : (a as any).createdAt?.seconds * 1000 || 0) : 0;
    const bTime = (b as any).createdAt ? (typeof (b as any).createdAt === 'number' ? (b as any).createdAt : (b as any).createdAt?.seconds * 1000 || 0) : 0;
    return bTime - aTime;
  });

  const groups: { category: string, items: Product[] }[] = [];

  sorted.forEach((product) => {
    const cat = product.category || "General";
    let catGroup = groups.find(g => g.category === cat);
    if (!catGroup) {
      catGroup = { category: cat, items: [] };
      groups.push(catGroup);
    }
    catGroup.items.push(product);
  });

  groups.forEach(g => {
    g.items = g.items.slice(0, 5);
  });

  if (groups.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-24 mt-12 overflow-hidden">
      {groups.map((group) => (
        <div key={group.category} className="w-full flex flex-col">
          <h3 className="font-heading text-xl md:text-2xl font-bold uppercase tracking-[0.2em] text-brand-black mb-8 px-6 text-center md:text-left">
            // {group.category}
          </h3>

          <div className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 px-6">
            {group.items.map((product, i) => (
              <div key={product.id} className="snap-start shrink-0">
                <ProductCard product={product} priority={i === 0} />
              </div>
            ))}
            <div className="w-[1vw] shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
