"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const NEWSLETTER_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfe7t6A0TxTHSBW_uFJ5RVQPgEUYhOvKDZouebOVaWFSHKpiA/formResponse";
const EMAIL_ENTRY_ID = "entry.1884975893";

interface PreLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreLaunchModal({ isOpen, onClose }: PreLaunchModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "received">("idle");
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen, lenis]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isEmailValid = validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || status !== "idle") return;

    setStatus("submitting");

    try {
      const searchParams = new URLSearchParams();
      searchParams.append(EMAIL_ENTRY_ID, email);

      await fetch(NEWSLETTER_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams.toString(),
      });

      setStatus("received");
      setEmail("");
    } catch (error) {
      console.error("Newsletter submission error:", error);
      setStatus("idle");
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#e5e5e5] dark:bg-[#111111] border border-black dark:border-white p-8 md:p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-black dark:text-white hover:opacity-50 transition-opacity font-bold font-heading text-sm uppercase tracking-widest flex items-center justify-center"
        >
          [X]
        </button>

        <h2 className="uppercase tracking-[0.2em] font-heading font-medium text-black dark:text-white mb-4 text-2xl pt-2">
          {"// "}CLASSIFIED ACCESS
        </h2>
        
        <p className="font-body text-sm text-brand-black/80 dark:text-white/80 mb-8 leading-relaxed uppercase tracking-wider">
          The vault is sealed. Join the registry to be notified the moment these schematics are unlocked.
        </p>

        <div className="relative w-full h-12 overflow-hidden border border-black/20 dark:border-white/20 p-2 bg-white dark:bg-black">
          <AnimatePresence mode="wait">
            {status !== "received" ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="relative w-full h-full flex items-center"
              >
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting"}
                  className="w-full h-full bg-transparent outline-none uppercase placeholder:text-black/30 dark:placeholder:text-white/30 text-black dark:text-white disabled:opacity-50 font-body px-2 text-xs font-bold tracking-widest"
                />
                <button 
                  type="submit"
                  disabled={!isEmailValid || status === "submitting"}
                  className={`absolute right-1 px-3 py-1 bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] tracking-widest font-bold transition-all transition-opacity duration-300 ${
                    isEmailValid && status !== "submitting" ? "opacity-100 hover:bg-black/80 dark:hover:bg-white/80" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {status === "submitting" ? (
                    "..."
                  ) : (
                    "SUBMIT"
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center h-full w-full bg-black dark:bg-white text-white dark:text-black"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Registry Updated.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
