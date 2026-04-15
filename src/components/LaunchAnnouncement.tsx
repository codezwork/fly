"use client";

import { usePreLaunch } from "@/context/PreLaunchContext";
import { useEffect } from "react";

export default function LaunchAnnouncement() {
  const { isPreLaunchMode } = usePreLaunch();

  useEffect(() => {
    // Fire on every state change (mount AND unmount) to force layout recalculation
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [isPreLaunchMode]);

  if (!isPreLaunchMode) return null;

  return (
    <div className="w-full border-y border-[#E0E0E0] py-8 my-12 bg-brand-black">
      <h2 className="font-heading text-xl md:text-3xl tracking-[0.2em] uppercase text-white text-center">
        // ACCESS ON 27TH APRIL, 2000HR
      </h2>
    </div>
  );
}
