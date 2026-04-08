export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Collection } from "@/components/AdminCollectionManager";
import { Product } from "@/store/useStore";

// Define the params interface for the page
type Props = {
  params: Promise<{ handle: string }>;
};

// Next 15 metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  const colRef = collection(db, "collections");
  const q = query(colRef, where("handle", "==", resolvedParams.handle));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return { title: 'Collection Not Found' };
  }
  
  const collectionData = snap.docs[0].data() as Collection;
  
  return {
    title: `${collectionData.name} Collection — FLY STORE`,
    description: collectionData.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const resolvedParams = await params;
  
  // Find matching collection
  const colRef = collection(db, "collections");
  const q = query(colRef, where("handle", "==", resolvedParams.handle));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    notFound();
  }
  
  const collectionData = snap.docs[0].data() as Collection;

  // Filter products for this collection
  const prodRef = collection(db, "products");
  const pQ = query(prodRef, where("collectionHandle", "==", collectionData.handle));
  const pSnap = await getDocs(pQ);
  const collectionProducts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
  
  // Extract distinct categories from this collection's products
  const categories = Array.from(new Set(collectionProducts.map(p => p.category)));

  return (
    <main className="w-full min-h-screen bg-brand-offWhite text-brand-black overflow-x-hidden">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-screen bg-brand-black z-10 flex flex-col justify-center items-center overflow-hidden">
        {/* Background Loop Video */}
        {collectionData.featureVideoUrl && (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale"
          >
            <source src={collectionData.featureVideoUrl} type="video/mp4" />
          </video>
        )}
        
        {/* Collection Typography Overlay */}
        <div className="relative z-20 text-center flex flex-col items-center mt-24">
          <span className="text-brand-offWhite/50 font-body text-xs uppercase tracking-[0.3em] font-bold mb-6">
            Collection
          </span>
          <h1 className="text-brand-offWhite font-heading text-6xl md:text-9xl font-bold uppercase tracking-tighter mix-blend-exclusion">
            {collectionData.name}
          </h1>
          <p className="mt-8 max-w-sm md:max-w-md text-brand-offWhite/80 font-body text-xs md:text-sm tracking-widest text-center leading-relaxed">
            {collectionData.description}
          </p>
        </div>
      </section>

      {/* 2. Collection Products List */}
      <section className="relative z-20 w-full bg-brand-offWhite px-6 md:px-12 py-32 flex flex-col gap-32">
        {categories.length === 0 ? (
          <div className="w-full text-center py-32">
             <h2 className="font-heading text-3xl font-bold uppercase tracking-widest text-brand-grey">
               No Archives Recovered.
             </h2>
          </div>
        ) : (
          categories.map((category) => {
            const categoryProducts = collectionProducts.filter(p => p.category === category);
            
            return (
              <div key={category} className="w-full">
                <div className="border-b border-black/20 pb-4 mb-12">
                  <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-widest opacity-30">
                    {category}
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16 md:gap-x-12 md:gap-y-24">
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
                           ₹{product.price}
                         </p>
                       </div>
                     </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
      
    </main>
  );
}
