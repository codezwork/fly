"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PreLaunchContextType {
  isPreLaunchMode: boolean;
}

const PreLaunchContext = createContext<PreLaunchContextType>({
  isPreLaunchMode: false,
});

export function PreLaunchProvider({ children }: { children: React.ReactNode }) {
  const [isPreLaunchMode, setIsPreLaunchMode] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "storeConfig"), (doc) => {
      if (doc.exists()) {
        setIsPreLaunchMode(doc.data()?.isPreLaunchMode ?? false);
      }
    }, (error) => {
      console.error("Failed to fetch Pre-Launch state:", error);
    });

    return () => unsub();
  }, []);

  return (
    <PreLaunchContext.Provider value={{ isPreLaunchMode }}>
      {children}
    </PreLaunchContext.Provider>
  );
}

export const usePreLaunch = () => useContext(PreLaunchContext);
