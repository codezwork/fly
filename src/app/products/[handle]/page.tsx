export const dynamic = 'force-dynamic';

import ProductGallery from "@/components/ProductGallery";
import BuyBox from "@/components/BuyBox";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { Metadata } from "next";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/store/useStore";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  
  const q = query(collection(db, "products"), where("handle", "==", handle), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return {
      title: 'Product Not Found',
    };
  }

  const product = snap.docs[0].data() as unknown as Product;
  
  const description = product.productDetails || `Premium minimal clothing from Fly Store. Explore the ${product.name} and more brutalist silhouettes.`;
  const imageStudio = Array.isArray(product.imageStudio) ? product.imageStudio : (product.imageStudio ? [(product.imageStudio as any)] : []);
  const imageLifestyle = Array.isArray(product.imageLifestyle) ? product.imageLifestyle : (product.imageLifestyle ? [(product.imageLifestyle as any)] : []);
  const imageUrl = imageLifestyle.length > 0 ? imageLifestyle[0] : (imageStudio.length > 0 ? imageStudio[0] : undefined);

  return {
    title: product.name,
    description: description,
    openGraph: {
      title: `${product.name} | FLY STORE`,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `/products/${handle}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  
  const q = query(collection(db, "products"), where("handle", "==", handle), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return (
      <main className="w-full bg-brand-offWhite min-h-screen pt-40 px-6 flex justify-center">
        <h1 className="font-heading text-2xl tracking-[0.2em]">PRODUCT NOT FOUND</h1>
      </main>
    );
  }

  const product = { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;

  let collectionName = product.collectionHandle;
  if (product.collectionHandle) {
    const colQ = query(collection(db, "collections"), where("handle", "==", product.collectionHandle), limit(1));
    const colSnap = await getDocs(colQ);
    if (!colSnap.empty) {
      collectionName = colSnap.docs[0].data().name;
    }
  }

  const sImgs = Array.isArray(product.imageStudio) ? product.imageStudio : (product.imageStudio ? [(product.imageStudio as any)] : []);
  const lImgs = Array.isArray(product.imageLifestyle) ? product.imageLifestyle : (product.imageLifestyle ? [(product.imageLifestyle as any)] : []);
  
  const productImages = [
    ...lImgs,
    ...sImgs
  ];

  return (
    <main className="w-full bg-brand-offWhite min-h-screen pt-32">
      
      {/* Location tag / Breadcrumbs */}
      <div className="w-full px-6 lg:px-12 mb-8 flex items-center">
        <p className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-grey">
          <Link href="/products" className="hover:text-brand-black transition-colors cursor-none">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.collectionHandle}`} className="hover:text-brand-black transition-colors cursor-none">{collectionName}</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-black">{product.name}</span>
        </p>
      </div>

      {/* Structural split screen layout */}
      <div className="flex flex-col md:flex-row w-full relative">
        
        {/* Left Column (60%) - The Imagery */}
        <div className="w-full md:w-[60%] lg:w-[60%]">
          <ProductGallery images={productImages} />
        </div>

        {/* Right Column (40%) - The Buy Box */}
        <div className="w-full md:w-[40%] lg:w-[40%] relative">
          <div className="md:sticky md:top-32 md:h-[calc(100vh-8rem)] md:overflow-y-auto hide-scrollbar bg-white/50 backdrop-blur-md dark:bg-black/20 dark:backdrop-blur-md">
            <BuyBox product={product} />
          </div>
        </div>
        
      </div>

      {/* Complete the Silhouette Section */}
      <div className="w-full mt-32 mb-12">
        <div className="w-full h-[1px] bg-[#E0E0E0] mb-8" />
        <div className="container mx-auto px-6">
          <h3 className="font-body text-xs font-bold uppercase tracking-widest text-brand-black mb-12 text-center md:text-left">
            Complete the Silhouette
          </h3>
          <div className="w-full overflow-hidden">
            <ProductGrid hideCTA />
          </div>
        </div>
      </div>

    </main>
  );
}
