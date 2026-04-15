import Hero from "@/components/Hero";
import BrandStatement from "@/components/BrandStatement";
import Preloader from "@/components/Preloader";
import ProductGrid from "@/components/ProductGrid";
import FeatureBanners from "@/components/FeatureBanners";
import LaunchAnnouncement from "@/components/LaunchAnnouncement";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-brand-black w-full overflow-x-hidden">
      <Preloader />
      <Hero />
      <BrandStatement />
      <LaunchAnnouncement />
      <ProductGrid />
      <FeatureBanners />
    </main>
  );
}