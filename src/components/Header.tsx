"use client";

import Link from 'next/link';
import { Menu, ShoppingBag, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNav } from '@/context/NavContext';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export default function Header() {
  const openCart = useStore((state) => state.openCart);
  const user = useStore((state) => state.user);
  const { openNav } = useNav();
  const router = useRouter();

  const handleUserClick = async () => {
    if (user) {
      router.push('/account');
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Google Auth failed", error);
      }
    }
  };

  return (

    <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 py-8 mix-blend-difference text-white pointer-events-none">
      
      {/* Left: Hamburger Menu */}
      <div className="flex-1 flex justify-start items-center">
        <button 
          onClick={openNav}
          className="pointer-events-auto p-2 hover:opacity-60 transition-opacity duration-300"
        >
          <Menu strokeWidth={1} className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Center: Brand Logo */}
      <div className="flex-1 flex justify-center items-center">
        <Link 
          href="/" 
          className="pointer-events-auto font-heading text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase whitespace-nowrap"
        >
          FLY STORE
        </Link>
      </div>

      {/* Right: User Icon & Cart Icon */}
      <div className="flex-1 flex justify-end items-center gap-1 sm:gap-4">
        <button 
          onClick={handleUserClick}
          className="pointer-events-auto p-2 hover:opacity-60 transition-opacity duration-300"
        >
          <User strokeWidth={1} className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
        <button 
          onClick={openCart}
          className="pointer-events-auto p-2 hover:opacity-60 transition-opacity duration-300"
        >
          <ShoppingBag strokeWidth={1} className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

    </header>
  );
}