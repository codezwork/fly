"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CheckoutPage() {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const showToast = useStore(state => state.showToast);
  const user = useStore(state => state.user);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    phone: ""
  });

  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.price) * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    }
  }, [cart, router]);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setFormData(prev => ({
            ...prev,
            firstName: data.name ? data.name.split(' ')[0] : prev.firstName,
            lastName: data.name ? data.name.split(' ').slice(1).join(' ') : prev.lastName,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            email: user.email || prev.email,
          }));
        } else {
          setFormData(prev => ({...prev, email: user.email || prev.email}));
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;
    
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });
      
      const { id: order_id } = await res.json();

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: Math.round(total * 100),
        currency: "INR",
        name: "FLY STORE",
        description: "Purchase from Fly Store",
        image: "https://github.com/codezwork/fly/blob/main/public/payment-module.png?raw=true",
        order_id: order_id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              cart,
              totalAmount: total,
              userId: user.uid,
              shippingDetails: formData
            })
          });

          if (verifyRes.ok) {
            clearCart();
            showToast("PAYMENT SUCCESSFUL");
            router.push(`/checkout/success?orderId=${response.razorpay_order_id}`);
          } else {
            const data = await verifyRes.json();
            showToast(`PAYMENT VERIFICATION FAILED: ${data.message || 'Unknown Error'}`);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        showToast("PAYMENT CANCELLED OR FAILED");
        setIsProcessing(false);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      showToast("FAILED TO INITIATE CHECKOUT");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <>
      <main className="w-full min-h-screen bg-brand-offWhite flex flex-col lg:flex-row pointer-events-auto">
      
      {/* LEFT COLUMN: FORM */}
      <div className="w-full lg:w-1/2 pt-32 px-6 lg:px-24 pb-24 border-r border-black/10">
        <Link href="/" className="font-heading text-2xl font-bold tracking-[0.2em] uppercase cursor-none mb-12 block">
          FLY STORE
        </Link>
        <h1 className="font-heading text-xl uppercase tracking-widest text-black mb-8 border-b border-black/10 pb-4">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Contact</h2>
            <div className="grid gap-4">
              <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
              <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border-b border-brand-black/20 py-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black transition-colors" />
            </div>
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

          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-brand-black text-white py-6 mt-8 uppercase font-bold tracking-widest text-xs hover:bg-brand-black/80 transition-colors cursor-none disabled:opacity-50"
          >
            {isProcessing ? "PROCESSING SECURE CHECKOUT..." : "PAY WITH RAZORPAY"}
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: ORDER SUMMARY */}
      <div className="w-full lg:w-1/2 pt-12 lg:pt-32 px-6 lg:px-24 bg-white pb-24 text-black">
        <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-black mb-8 hidden lg:block">Order Summary</h2>
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
                <h3 className="font-body text-xs font-bold uppercase tracking-widest text-black">{item.product.name}</h3>
                <p className="font-body text-[10px] uppercase text-black">Size: {item.selectedSize}</p>
              </div>
              <span className="font-body text-xs font-bold text-black">₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-black/10 pt-8 flex flex-col gap-4">
          <div className="flex justify-between font-body text-xs text-black">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-xs text-black">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-sm font-bold uppercase pt-4 border-t border-black/10 text-black">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </main>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </>
  );
}
