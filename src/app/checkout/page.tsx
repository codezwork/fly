"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PaymentProcessingModal from "@/components/PaymentProcessingModal";

export default function CheckoutPage() {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const showToast = useStore(state => state.showToast);
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const setUserProfile = useStore(state => state.setUserProfile);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pincode: "",
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
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || prev.firstName,
        lastName: userProfile.lastName || prev.lastName,
        phone: userProfile.phone || prev.phone,
        address: userProfile.address || prev.address,
        city: userProfile.city || prev.city,
        pincode: userProfile.pincode || prev.pincode,
        email: user?.email || prev.email,
      }));
    }
  }, [userProfile, user]);

  const handleFieldBlur = async (field: string, value: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { [field]: value });
      if (userProfile) {
        setUserProfile({ ...userProfile, [field]: value });
      }
    } catch (error) {
      console.error("Auto-save failed", error);
    }
  };

  const handleInitiateCheckout = async () => {
    if (!isRazorpayReady || typeof window === "undefined" || !(window as any).Razorpay) {
      showToast("Securing payment gateway. Please try again in a moment.");
      return;
    }

    const form = document.getElementById("checkout-form") as HTMLFormElement;
    if (form && !form.checkValidity()) {
      const firstInvalid = Array.from(form.elements).find((el: any) => el.validity && !el.validity.valid) as HTMLInputElement;
      if (firstInvalid) {
        setInvalidField(firstInvalid.name);
        firstInvalid.focus();
        setTimeout(() => setInvalidField(null), 1200);
      }
      return;
    }

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
          setIsVerifying(true);
          try {
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
              router.push(`/account`);
            } else {
              const data = await verifyRes.json();
              showToast(`PAYMENT VERIFICATION FAILED: ${data.message || 'Unknown Error'}`);
              setIsProcessing(false);
              setIsVerifying(false);
            }
          } catch (error) {
            console.error("Verification error:", error);
            showToast("PAYMENT VERIFICATION FAILED");
            setIsProcessing(false);
            setIsVerifying(false);
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

        <form id="checkout-form" className="flex flex-col gap-8">
          
          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Contact</h2>
            <div className="grid gap-4">
              <input required name="email" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} onBlur={(e) => handleFieldBlur('email', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'email' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
              <input required name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} onBlur={(e) => handleFieldBlur('phone', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'phone' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
            </div>
          </section>

          <section>
            <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-4">Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} onBlur={(e) => handleFieldBlur('firstName', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'firstName' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
              <input required name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} onBlur={(e) => handleFieldBlur('lastName', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'lastName' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
            </div>
            <input required name="address" type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} onBlur={(e) => handleFieldBlur('address', e.target.value)} className={`mt-4 w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'address' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input required name="city" type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} onBlur={(e) => handleFieldBlur('city', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'city' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
              <input required name="pincode" type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} onBlur={(e) => handleFieldBlur('pincode', e.target.value)} className={`w-full border-b py-3 bg-transparent text-xs font-body focus:outline-none transition-all ${invalidField === 'pincode' ? 'border-red-500 text-red-600 border-b-4 bg-transparent outline-none ring-0' : 'border-brand-black/20 focus:border-brand-black'}`} />
            </div>
          </section>
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

          <button 
            type="button"
            onClick={handleInitiateCheckout}
            disabled={isProcessing}
            className="w-full bg-black text-white py-6 mt-4 uppercase font-bold tracking-widest text-xs hover:bg-black/80 transition-colors cursor-none disabled:opacity-50"
          >
            {isProcessing ? "PROCESSING SECURE CHECKOUT..." : "PAY WITH RAZORPAY"}
          </button>
        </div>
      </div>

    </main>
      <PaymentProcessingModal isOpen={isVerifying} />
      <Script 
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload" 
        onLoad={() => setIsRazorpayReady(true)}
      />
    </>
  );
}
