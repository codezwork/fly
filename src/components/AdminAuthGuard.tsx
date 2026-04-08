"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && user && user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-brand-offWhite flex items-center justify-center">
        <p className="font-heading uppercase font-bold tracking-widest text-xs animate-pulse">Verifying Credentials...</p>
      </div>
    );
  }

  // If user is logged in, but not admin, the useEffect will kick them. Show loading state meanwhile.
  if (user && user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
    return (
      <div className="min-h-screen bg-brand-offWhite flex items-center justify-center">
        <p className="font-heading uppercase font-bold tracking-widest text-xs text-red-500">UNAUTHORIZED. REDIRECTING...</p>
      </div>
    );
  }

  // If completely unauthenticated, show Email/Password login strictly for Admin.
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-6 pointer-events-auto">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="font-heading text-white text-2xl uppercase tracking-widest font-bold mb-4">RESTRICTED ACCESS</h1>
          {error && <p className="text-red-500 font-body text-[10px] uppercase tracking-widest">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ADMIN EMAIL"
            className="bg-transparent border-b border-white/20 py-3 text-white font-body text-sm focus:outline-none focus:border-white transition-colors cursor-text"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="bg-transparent border-b border-white/20 py-3 text-white font-body text-sm focus:outline-none focus:border-white transition-colors cursor-text"
          />
          <button type="submit" className="mt-4 bg-white text-brand-black py-4 uppercase font-bold tracking-widest text-xs hover:bg-white/80 transition-colors">
            ENTER
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
