"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";

export default function AccountPage() {
  const user = useStore((state) => state.user);
  const userProfile = useStore((state) => state.userProfile);
  const setUser = useStore((state) => state.setUser);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const showToast = useStore((state) => state.showToast);
  const router = useRouter();

  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    phone: "", 
    address: "",
    city: "",
    pincode: "" 
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const isDataChanged = JSON.stringify(formData) !== JSON.stringify({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
    city: userProfile?.city || "",
    pincode: userProfile?.pincode || ""
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        address: userProfile.address,
        city: userProfile.city,
        pincode: userProfile.pincode
      });
    }
  }, [userProfile]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "orders"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);

      } catch (e) {
        console.error("Failed to fetch orders", e);
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { ...formData });
      setUserProfile({ ...formData });
      showToast("PROFILE UPDATED");
    } catch (err) {
      showToast("ERROR UPDATING PROFILE");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      showToast("SIGN OUT FAILED");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsCanceling(true);
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, { status: "CANCELLATION PENDING" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLATION PENDING" } : o));
      showToast("CANCELLATION REQUESTED");
      setOrderToCancel(null);
    } catch (err) {
      console.error(err);
      showToast("FAILED TO CANCEL ORDER");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isAuthLoading || !user || isFetching) {
    return (
      <main className="w-full min-h-screen bg-brand-offWhite pt-40 px-6 flex justify-center">
        <p className="font-heading uppercase tracking-widest text-xs font-bold animate-pulse">Loading Profile...</p>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PACKED':
        return <span className="bg-gray-200 text-gray-700 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">PACKED</span>;
      case 'DISPATCHED':
        return <span className="underline decoration-2 underline-offset-4 animate-pulse px-3 py-1 font-bold text-[10px] tracking-widest uppercase">DISPATCHED</span>;
      case 'DELIVERED':
        return <span className="bg-black text-white px-3 py-1 font-bold text-[10px] tracking-widest uppercase">DELIVERED</span>;
      case 'CANCELLATION PENDING':
        return <span className="bg-red-600 text-white px-3 py-1 font-bold text-[10px] tracking-widest uppercase">CANCELLATION PENDING</span>;
      case 'CANCELED & REFUNDED':
        return <span className="bg-transparent border border-red-600 text-red-600 px-3 py-1 font-bold text-[10px] tracking-widest uppercase line-through">REFUNDED</span>;
      case 'REFUND PROCESSING':
        return <span className="border border-dashed border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">REFUND PROCESSING</span>;
      case 'PROCESSING':
      default:
        return <span className="border border-black text-black px-3 py-1 font-bold text-[10px] tracking-widest uppercase">PROCESSING</span>;
    }
  };

  return (
    <>
      <main className="w-full min-h-screen bg-brand-offWhite flex flex-col lg:flex-row pointer-events-auto">
      {/* LEFT COLUMN: PROFILE */}
      <div className="w-full lg:w-1/3 pt-32 px-6 lg:px-12 pb-24 border-r border-black/10">
        <h1 className="font-heading text-xl font-bold uppercase tracking-widest text-brand-black mb-12 border-b border-black/10 pb-4">Profile</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">First Name</label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
                placeholder="JOHN"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Last Name</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
                placeholder="DOE"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Phone Number</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
              placeholder="+91 ..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Shipping Address</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors resize-none h-24 cursor-none"
              placeholder="123 MAIN ST..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">City</label>
              <input 
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
                placeholder="MUMBAI"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body text-[10px] font-bold uppercase tracking-widest text-brand-grey">Pincode</label>
              <input 
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                className="bg-transparent border-b-2 border-brand-black py-4 font-body text-brand-black focus:outline-none focus:border-brand-grey transition-colors cursor-none"
                placeholder="400001"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <button 
              type="submit" 
              disabled={isSaving || !isDataChanged}
              className="w-full border border-brand-black text-brand-black h-[70px] uppercase font-bold tracking-widest text-xs flex items-center justify-center transition-colors hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-black cursor-none"
            >
              {isSaving ? "Syncing..." : "Update Details"}
            </button>

            <button 
              type="button"
              onClick={() => setShowSignOutModal(true)}
              className="w-full h-12 uppercase font-bold tracking-[0.2em] text-[10px] text-red-600 hover:text-red-700 transition-colors cursor-none flex items-center justify-center"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: ORDER HISTORY */}
      <div className="w-full lg:w-2/3 pt-12 lg:pt-32 px-6 lg:px-12 bg-white pb-24 text-black">
        <h2 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey mb-8">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-black/10">
            <p className="font-body text-xs text-brand-grey uppercase tracking-widest mb-6 border-b pb-1">No orders found.</p>
            <Link href="/products" className="font-body text-[10px] font-bold uppercase tracking-[0.2em] underline hover:opacity-50 cursor-none">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-black/10 overflow-hidden group hover:border-black/30 transition-colors">
                
                {/* Header Row (Clickable) */}
                <div 
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 cursor-none bg-white relative transition-colors hover:bg-brand-offWhite/50"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-heading text-sm sm:text-base uppercase tracking-widest font-bold">{order.id}</span>
                        <div className="font-body text-[10px] sm:text-xs text-brand-grey block sm:hidden">
                          {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex shrink-0">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="font-body text-[10px] sm:text-xs text-brand-grey hidden sm:block">
                      {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="md:text-right border-t md:border-t-0 md:border-l border-black/10 pt-4 md:pt-0 md:pl-6 min-w-[120px] flex flex-col justify-between h-full">
                    <p className="font-body text-[10px] text-brand-grey tracking-widest uppercase mb-1">Total</p>
                    <p className="font-body text-sm font-bold text-brand-black">₹{order.totalAmount?.toFixed(2)}</p>
                    
                    {order.status === 'DISPATCHED' && order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-4 font-body text-[10px] font-bold underline uppercase tracking-widest hover:text-brand-grey cursor-none">
                        Track Package
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded Content Accordion */}
                <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${expandedOrderId === order.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden bg-brand-offWhite border-t border-black/10">
                    <div className="p-6 flex flex-col gap-6">
                      <div className="flex justify-between items-end border-b border-black/10 pb-4">
                        <h4 className="font-body text-[10px] uppercase font-bold tracking-widest text-brand-grey">Items</h4>
                        
                        {/* 3-Dot Cancellation Menu with Popover */}
                        {order.status === 'PROCESSING' && (
                           <div className="relative action-menu-container">
                             <button
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setActiveMenuId(activeMenuId === order.id ? null : order.id);
                               }} 
                               className="text-brand-black/50 hover:text-brand-black transition-colors cursor-none px-2 py-1 flex items-center justify-center outline-none bg-transparent"
                               title="Order Options"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                             </button>
                             
                             {/* Popover */}
                             {activeMenuId === order.id && (
                               <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-10 flex flex-col pointer-events-auto">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setOrderToCancel(order.id);
                                     setActiveMenuId(null);
                                   }}
                                   className="w-full text-left px-4 py-3 font-body text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-black hover:text-white transition-colors cursor-none"
                                 >
                                   Cancel Order
                                 </button>
                               </div>
                             )}
                           </div>
                        )}
                      </div>

                      {/* Order Cart Details */}
                      <div className="flex flex-col gap-6">
                        {(order.cart || order.items)?.map((item: any, idx: number) => (
                           <div key={idx} className="flex gap-4 items-center">
                             <div className="relative w-20 h-24 bg-white border border-black/10 shrink-0">
                                {item.product.imageStudio && item.product.imageStudio.length > 0 && (
                                  <Image src={typeof item.product.imageStudio === "string" ? item.product.imageStudio : item.product.imageStudio[0]} alt={item.product.name} fill className="object-cover object-top" />
                                )}
                             </div>
                             <div className="flex-1 flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-2 items-start">
                               <div>
                                  <h3 className="font-body text-xs sm:text-sm font-bold uppercase tracking-widest text-black">{item.product.name}</h3>
                                  <p className="font-body text-[10px] uppercase text-brand-grey tracking-widest mt-1">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                               </div>
                               <span className="font-body text-xs font-bold text-black sm:border-l border-black/10 sm:pl-6 border-0 pl-0">
                                 ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                               </span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>

    {/* CANCELLATION MODAL */}
    {orderToCancel && (
      <div className="fixed inset-0 z-50 bg-brand-offWhite/90 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto">
        <div className="bg-white p-8 max-w-lg w-full border-2 border-red-600 shadow-2xl flex flex-col gap-6">
          <h3 className="font-heading text-2xl uppercase tracking-widest font-bold text-red-600">Cancel Order</h3>
          <div className="border border-red-600/20 bg-red-50 p-4">
            <p className="font-body text-xs font-bold text-red-900 uppercase tracking-widest leading-relaxed">
              Refunds require 4-5 business days to process. Are you sure you want to cancel this order?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={() => setOrderToCancel(null)}
              disabled={isCanceling}
              className="flex-1 border-2 border-black py-4 font-body text-xs font-bold tracking-widest uppercase hover:bg-brand-offWhite transition-colors cursor-none disabled:opacity-50 text-black"
            >
              Go Back
            </button>
            <button 
              onClick={() => handleCancelOrder(orderToCancel)}
              disabled={isCanceling}
              className="flex-1 bg-red-600 text-white border-2 border-red-600 py-4 font-body text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors cursor-none disabled:opacity-50"
            >
              {isCanceling ? 'Processing...' : 'Yes, Cancel My Order'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SIGN OUT MODAL */}
    {showSignOutModal && (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto">
        <div className="bg-brand-offWhite p-12 max-w-md w-full border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col gap-8">
          <h3 className="font-heading text-3xl uppercase tracking-tighter font-black text-black leading-none">
            EXIT<br/>SESSION?
          </h3>
          <p className="font-body text-sm font-bold uppercase tracking-widest text-brand-grey leading-tight">
            YOUR CART AND PROFILE DETAILS ARE SECURELY SYNCED.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleSignOut}
              className="w-full bg-black text-white py-6 font-bold uppercase tracking-[0.3em] text-xs hover:bg-red-600 transition-colors cursor-none"
            >
              Confirm Exit
            </button>
            <button 
              onClick={() => setShowSignOutModal(false)}
              className="w-full border-2 border-black py-4 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-colors cursor-none text-black"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
