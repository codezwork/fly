"use client";

import { useState, useRef, useEffect } from "react";
import { Input, TextArea } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";

const SUBJECT_OPTIONS = [
  { value: "support", label: "Customer Support" },
  { value: "wholesale", label: "Wholesale / Press" },
  { value: "styling", label: "Styling Inquiry" },
];

// Placeholder Google Form URL and entry IDs - USER to replace
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc-SQ-QsAoiRbLXLVsuvUc7MNVOctGBZBnQgWQiGri9Q82LPQ/formResponse";
const ENTRY_IDS = {
  name: "entry.728570642",
  email: "entry.1780182052",
  subject: "entry.1543535383",
  message: "entry.1228269716",
};

export default function ConciergePage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "received">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFormValid = 
    formData.name.trim() !== "" && 
    formData.email.trim() !== "" && 
    formData.subject !== "" && 
    formData.message.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || status === "submitting") return;

    setStatus("submitting");
    
    try {
      const searchParams = new URLSearchParams();
      searchParams.append(ENTRY_IDS.name, formData.name);
      searchParams.append(ENTRY_IDS.email, formData.email);
      searchParams.append(ENTRY_IDS.subject, formData.subject);
      searchParams.append(ENTRY_IDS.message, formData.message);

      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams.toString(),
      });

      // Since mode is 'no-cors', we won't get a true response status, 
      // but the fetch will resolve if the request was sent.
      setStatus("received");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Return to idle after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("idle");
      // You might want to show an error message here in a real scenario
    }
  };

  const selectedSubjectLabel = SUBJECT_OPTIONS.find(opt => opt.value === formData.subject)?.label || "Select Subject";

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
              <a href="mailto:contact@flystore.com" className="hover:opacity-50 transition-opacity">contact@flystore.com</a>
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
                <Input 
                  label="Name" 
                  type="text" 
                  required 
                  disabled={status === "submitting"} 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input 
                  label="Email Address" 
                  type="email" 
                  required 
                  disabled={status === "submitting"} 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                
                {/* Custom Brutalist Dropdown */}
                <div className="relative w-full mb-8 pt-4" ref={dropdownRef}>
                  <label className={`absolute left-0 pointer-events-none transition-all duration-300 font-body uppercase tracking-widest ${
                    formData.subject || isDropdownOpen ? "-top-2 text-[10px] text-brand-grey font-bold" : "top-4 text-xs text-brand-black/50"
                  }`}>
                    Subject
                  </label>
                  <button
                    type="button"
                    disabled={status === "submitting"}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left bg-transparent border-b border-black/20 outline-none pb-2 text-brand-black font-body text-sm uppercase tracking-wider flex justify-between items-center group"
                  >
                    <span className={formData.subject ? "opacity-100" : "opacity-0"}>
                      {selectedSubjectLabel}
                    </span>
                    <span className="text-[10px] transition-transform duration-300" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {SUBJECT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, subject: option.value });
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <TextArea 
                  label="Message" 
                  required 
                  disabled={status === "submitting"} 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                <button 
                  type="submit" 
                  disabled={!isFormValid || status === "submitting"}
                  className={`mt-8 text-[10px] tracking-widest font-bold uppercase transition-all flex items-center gap-4 ${
                    !isFormValid || status === "submitting" 
                      ? "opacity-30 cursor-not-allowed text-brand-black" 
                      : "text-brand-black hover:opacity-50"
                  }`}
                >
                  {status === "submitting" ? (
                    <span className="flex items-center gap-2">
                      TRANSMITTING
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      >...</motion.span>
                    </span>
                  ) : "Submit Inquiry"}
                  {status !== "submitting" && <span>→</span>}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] text-brand-black mb-4">
                  Sent.
                </h2>
                <p className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey">
                  Your inquiry has been logged. We will be in touch shortly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
