"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AccountPage() {
  const user = useStore((state) => state.user);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const showToast = useStore((state) => state.showToast);
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || ""
          });
        }
      } catch (e) {
        console.error("Failed to fetch user data", e);
      } finally {
        setIsFetching(false);
      }
    }
    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { ...formData });
      showToast("PROFILE UPDATED");
    } catch (err) {
      showToast("ERROR UPDATING PROFILE");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || !user || isFetching) {
    return (
      <main className="w-full min-h-screen bg-brand-offWhite pt-40 px-6 flex justify-center">
        <p className="font-heading uppercase tracking-widest text-xs font-bold animate-pulse">Loading Profile...</p>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-brand-offWhite pt-32 px-6 lg:px-12 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h1 className="font-heading text-4xl font-bold uppercase tracking-widest text-brand-black mb-12">Account</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full pointer-events-auto">
          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Legal Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
              placeholder="e.g. JOHN DOE"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Phone Number</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
              placeholder="+1 ..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Shipping Address</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors resize-none h-32 cursor-none"
              placeholder="123 MAIN ST..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="mt-8 w-full bg-brand-black text-white h-[70px] uppercase font-bold tracking-widest text-xs flex items-center justify-center transition-colors hover:bg-black/80 disabled:hover:bg-brand-black cursor-none"
          >
            {isSaving ? "Syncing..." : "Update Details"}
          </button>
        </form>
      </div>
    </main>
  );
}
