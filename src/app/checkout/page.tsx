"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const showToast = useStore(state => state.showToast);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
    exp: "",
    cvc: ""
  });

  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.price) * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    }
  }, [cart, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    showToast("PROCESSING ORDER...");
    setTimeout(() => {
      clearCart();
      showToast("ORDER PLACED SUCCESSFULLY");
      router.push("/");
    }, 1500);
  };

  if (cart.length === 0) return null;

  return (
    <main className="w-full min-h-screen bg-brand-offWhite flex flex-col lg:flex-row pointer-events-auto">
      
      {/* LEFT COLUMN: FORM */}
      <div className="w-full lg:w-1/2 pt-32 px-6 lg:px-24 pb-24 border-r border-black/10">
        <Link href="/" className="font-heading text-2xl font-bold tracking-[0.2em] uppercase cursor-none mb-12 block">
          FLY STORE
        </Link>
        <h1 className="font-heading text-xl uppercase tracking-widest text-brand-black mb-8 border-b border-black/10 pb-4">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Contact</h2>
            <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
          </section>

          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
              <input required type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            </div>
            <input required type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-4 w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input required type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
              <input required type="text" placeholder="ZIP code" value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            </div>
          </section>

          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Payment (Mock)</h2>
            <input required type="text" placeholder="Card number" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input required type="text" placeholder="Expiration date (MM / YY)" value={formData.exp} onChange={(e) => setFormData({...formData, exp: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
              <input required type="text" placeholder="Security code" value={formData.cvc} onChange={(e) => setFormData({...formData, cvc: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            </div>
          </section>

          <button 
            type="submit"
            className="w-full bg-brand-black text-white py-6 mt-8 uppercase font-bold tracking-widest text-xs hover:bg-brand-black/80 transition-colors cursor-none"
          >
            Pay ${total.toFixed(2)}
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: ORDER SUMMARY */}
      <div className="w-full lg:w-1/2 pt-12 lg:pt-32 px-6 lg:px-24 bg-white pb-24">
        <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-8 hidden lg:block">Order Summary</h2>
        <div className="flex flex-col gap-6">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4 items-center">
              <div className="relative w-16 h-20 bg-brand-offWhite border border-black/10">
                {item.product.imageStudio && item.product.imageStudio.length > 0 && (
                  <Image src={typeof item.product.imageStudio === "string" ? item.product.imageStudio : item.product.imageStudio[0]} alt={item.product.name} fill className="object-cover" />
                )}
                <span className="absolute -top-2 -right-2 bg-brand-grey text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-body text-xs font-bold uppercase tracking-widest text-brand-black">{item.product.name}</h3>
                <p className="font-body text-[10px] uppercase text-brand-black">Size: {item.selectedSize}</p>
              </div>
              <span className="font-body text-xs font-bold text-brand-black">₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-black/10 pt-8 flex flex-col gap-4">
          <div className="flex justify-between font-body text-xs text-brand-black">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-xs text-brand-black">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-sm font-bold uppercase pt-4 border-t border-black/10">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </main>
  );
}
