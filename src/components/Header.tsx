"use client";

import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNav } from '@/context/NavContext';

export default function Header() {
  const { openCart } = useCart();
  const { openNav } = useNav();

  return (

    <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 py-8 mix-blend-difference text-white pointer-events-none">
      
      {/* Left: Hamburger Menu */}
      <button 
        onClick={openNav}
        className="pointer-events-auto p-2 hover:opacity-60 transition-opacity duration-300"
      >
        <Menu strokeWidth={1} size={28} />
      </button>

      {/* Center: Brand Logo */}
      <Link 
        href="/" 
        className="pointer-events-auto font-heading text-2xl font-bold tracking-[0.2em] uppercase"
      >
        FLY STORE
      </Link>

      {/* Right: Cart Icon */}
      <button 
        onClick={openCart}
        className="pointer-events-auto p-2 hover:opacity-60 transition-opacity duration-300"
      >
        <ShoppingBag strokeWidth={1} size={28} />
      </button>

    </header>
  );
}