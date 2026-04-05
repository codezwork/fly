import ProductGallery from "@/components/ProductGallery";
import BuyBox from "@/components/BuyBox";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTS, COLLECTIONS } from "@/lib/mockData";
import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  
  const product = PRODUCTS.find((p) => p.handle === handle) || PRODUCTS[0];
  const collection = COLLECTIONS.find((c) => c.handle === product.collectionHandle);

  const productImages = [
    product.imageStudio,
    product.imageLifestyle,
    product.imageStudio // Repeating studio as placeholder for 3rd image
  ];

  return (
    <main className="w-full bg-brand-offWhite min-h-screen pt-32">
      
      {/* Location tag / Breadcrumbs */}
      <div className="w-full px-6 lg:px-12 mb-8 flex items-center">
        <p className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-grey">
          <Link href="/products" className="hover:text-brand-black transition-colors cursor-none">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.collectionHandle}`} className="hover:text-brand-black transition-colors cursor-none">{collection?.name || product.category}</Link>
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
          <BuyBox product={product} />
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
            <ProductGrid />
          </div>
        </div>
      </div>

    </main>
  );
}
