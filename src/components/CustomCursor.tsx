"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
  const pathname = usePathname();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Use spring physics for the "Thread Cursor Wake" feel
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [cursorState, setCursorState] = useState<"default" | "view" | "zoom">("default");

  // Reset cursor state on pathname change to prevent sticky cursors
  useEffect(() => {
    setCursorState("default");
  }, [pathname]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);

    // Global listener to check if hovering over specific elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor='view']")) {
        setCursorState("view");
      } else if (target.closest("[data-cursor='zoom']")) {
        setCursorState("zoom");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Framer Motion variants
  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "#000",
      borderColor: "transparent",
      borderWidth: 0,
      x: "-50%",
      y: "-50%",
    },
    view: {
      width: 64,
      height: 64,
      backgroundColor: "transparent",
      borderColor: "#000",
      borderWidth: 1,
      x: "-50%",
      y: "-50%",
    },
    zoom: {
      width: 64,
      height: 64,
      backgroundColor: "transparent",
      borderColor: "#000",
      borderWidth: 1,
      x: "-50%",
      y: "-50%",
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference invert"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
      variants={variants}
      animate={cursorState}
      transition={{ type: "tween", ease: "backOut", duration: 0.3 }}
    >
      {cursorState === "view" && (
        <span className="text-[10px] text-black font-bold tracking-widest uppercase">View</span>
      )}
      {cursorState === "zoom" && (
        <span className="text-[10px] text-black font-bold tracking-widest uppercase">Zoom</span>
      )}
    </motion.div>
  );
}
