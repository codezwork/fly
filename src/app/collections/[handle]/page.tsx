export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Collection } from "@/components/AdminCollectionManager";
import { Product } from "@/store/useStore";
import CollectionPreLaunchWrapper from "@/components/CollectionPreLaunchWrapper";

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
      <CollectionPreLaunchWrapper 
        collectionData={collectionData}
        collectionProducts={collectionProducts}
        categories={categories}
      />
    </main>
  );
}
