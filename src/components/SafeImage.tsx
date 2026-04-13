"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends ImageProps {
  fallbackClassName?: string;
}

export default function SafeImage({ fallbackClassName, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !props.src) {
    return (
      <div className={`flex items-center justify-center bg-brand-offWhite border border-black/5 ${props.className} ${fallbackClassName}`}>
        <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="w-8 h-8 border border-black/20 flex items-center justify-center opacity-30">
                <span className="text-[10px]">?</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-grey leading-tight">
                Image<br />Not Found
            </span>
        </div>
      </div>
    );
  }

  return (
    <Image 
      {...props} 
      onError={() => {
        console.warn(`SafeImage: Failed to load image at ${props.src}`);
        setError(true);
      }} 
    />
  );
}
