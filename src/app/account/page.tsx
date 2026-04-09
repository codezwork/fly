"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";

export default function AccountPage() {
  const user = useStore((state) => state.user);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const showToast = useStore((state) => state.showToast);
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    async function fetchData() {
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
        console.error("Failed to fetch data", e);
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

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PACKED':
        return <span className="bg-gray-200 text-gray-700 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">PACKED</span>;
      case 'DISPATCHED':
        return <span className="underline decoration-2 underline-offset-4 animate-pulse px-3 py-1 font-bold text-[10px] tracking-widest uppercase">DISPATCHED</span>;
      case 'DELIVERED':
        return <span className="bg-black text-white px-3 py-1 font-bold text-[10px] tracking-widest uppercase">DELIVERED</span>;
      case 'PROCESSING':
      default:
        return <span className="border border-black text-black px-3 py-1 font-bold text-[10px] tracking-widest uppercase">PROCESSING</span>;
    }
  };

  return (
    <main className="w-full min-h-screen bg-brand-offWhite flex flex-col lg:flex-row pointer-events-auto">
      {/* LEFT COLUMN: PROFILE */}
      <div className="w-full lg:w-1/3 pt-32 px-6 lg:px-12 pb-24 border-r border-black/10">
        <h1 className="font-heading text-xl font-bold uppercase tracking-widest text-brand-black mb-12 border-b border-black/10 pb-4">Profile</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
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
            className="mt-4 w-full border border-brand-black text-brand-black h-[70px] uppercase font-bold tracking-widest text-xs flex items-center justify-center transition-colors hover:bg-black hover:text-white disabled:hover:bg-transparent disabled:hover:text-brand-black cursor-none"
          >
            {isSaving ? "Syncing..." : "Update Details"}
          </button>
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
              <div key={order.id} className="border border-black/10 p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 group hover:border-black/30 transition-colors">
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-heading text-sm sm:text-base uppercase tracking-widest font-bold">{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="font-body text-[10px] sm:text-xs text-brand-grey mb-4">
                    {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>

                  <div className="flex flex-col gap-2">
                    {order.items?.map((item: any, idx: number) => (
                      <p key={idx} className="font-body text-xs uppercase text-brand-black">
                        {item.quantity}x {item.product.name} (Size: {item.selectedSize})
                      </p>
                    ))}
                  </div>
                </div>

                <div className="md:text-right border-t md:border-t-0 md:border-l border-black/10 pt-4 md:pt-0 md:pl-6 min-w-[120px] flex flex-col justify-between h-full">
                  <p className="font-body text-[10px] text-brand-grey tracking-widest uppercase mb-1">Total</p>
                  <p className="font-body text-sm font-bold text-brand-black">₹{order.totalAmount?.toFixed(2)}</p>
                  
                  {order.status === 'DISPATCHED' && order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 font-body text-[10px] font-bold underline uppercase tracking-widest hover:text-brand-grey cursor-none">
                      Track Package
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
