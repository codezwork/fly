"use client";

import { useState } from "react";
import { Input, TextArea } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";

export default function ConciergePage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "received">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    // Simulate POST request to Google Apps Script
    setTimeout(() => {
      setStatus("received");
      // Reset form after a few seconds
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <main className="w-full bg-brand-offWhite min-h-screen pt-40 px-6 pb-24">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
        
        {/* Left Side: Contact Context */}
        <div className="flex flex-col">
          <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-widest text-brand-black mb-8 leading-none">
            Concierge
          </h1>
          <p className="font-body text-xs leading-relaxed text-brand-grey uppercase tracking-widest max-w-sm mb-12">
            For styling inquiries, bespoke tailoring, or assistance with a current order, please contact the studio.
          </p>

          <div className="flex flex-col gap-6 font-body text-[10px] uppercase font-bold tracking-[0.2em] text-brand-black">
            <div>
              <span className="text-brand-grey block mb-1">Email</span>
              <a href="mailto:studio@flystore.com" className="hover:opacity-50 transition-opacity">studio@flystore.com</a>
            </div>
            <div>
              <span className="text-brand-grey block mb-1">Location</span>
              <p>Chennai, India</p>
            </div>
            <div>
              <span className="text-brand-grey block mb-1">Hours</span>
              <p>Mon-Fri, 10am—6pm IST</p>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="flex flex-col justify-center relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {status !== "received" ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit} 
                className="w-full max-w-md"
              >
                <Input label="Name" type="text" required disabled={status === "submitting"} />
                <Input label="Email Address" type="email" required disabled={status === "submitting"} />
                
                {/* Custom select mimicking single line */}
                <div className="relative w-full mb-8">
                  <select 
                    required 
                    disabled={status === "submitting"}
                    className="w-full appearance-none bg-transparent border-b border-black/20 outline-none pb-2 pt-4 text-brand-black text-sm uppercase font-body tracking-wider"
                  >
                    <option value="support">Customer Support</option>
                    <option value="wholesale">Wholesale / Press</option>
                    <option value="styling">Styling Inquiry</option>
                  </select>
                  {/* Custom arrow indicator */}
                  <div className="absolute right-0 bottom-3 pointer-events-none text-[10px]">▼</div>
                </div>

                <TextArea label="Message" required disabled={status === "submitting"} />

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="mt-8 text-[10px] tracking-widest font-bold uppercase text-brand-black hover:opacity-50 transition-opacity flex items-center gap-4"
                >
                  {status === "submitting" ? "Sending..." : "Submit Inquiry"}
                  {status !== "submitting" && <span>→</span>}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center"
              >
                <h2 className="font-heading text-4xl font-bold uppercase tracking-[0.2em] text-brand-black">
                  Received.
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
