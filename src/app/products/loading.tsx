import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-[#000000] flex items-center justify-center">
      <div 
        className="mamba-loader relative" 
      >
        <Image 
          src="/logo.png" 
          alt="Loading..." 
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
