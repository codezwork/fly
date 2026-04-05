import Hero from "@/components/Hero";
import BrandStatement from "@/components/BrandStatement";
import Preloader from "@/components/Preloader";
import ProductGrid from "@/components/ProductGrid";
import FeatureBanners from "@/components/FeatureBanners";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-brand-black w-full overflow-x-hidden">
      <Preloader />
      <Hero />
      <BrandStatement />
      <ProductGrid />
      <FeatureBanners />
    </main>
  );
}