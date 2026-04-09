"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

export default function AdminOrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const showToast = useStore(state => state.showToast);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      showToast("FAILED TO FETCH ORDERS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`ORDER MARKED AS ${newStatus}`);
    } catch (e) {
      console.error(e);
      showToast("FAILED TO UPDATE STATUS");
    }
  };

  if (loading) return <div className="font-heading uppercase animate-pulse">Loading orders...</div>;

  return (
    <div className="w-full flex-col flex gap-8">
      <div className="overflow-x-auto border border-black/10 text-xs sm:text-sm shadow-sm bg-white">
        <table className="w-full text-left font-body bg-black">
          <thead className="bg-brand-offWhite border-b border-black/10 uppercase font-bold tracking-widest text-[10px]">
            <tr>
              <th className="p-4 whitespace-nowrap">Order ID</th>
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4 whitespace-nowrap">Total (₹)</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-xs text-brand-black">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-brand-grey uppercase tracking-widest">
                  No orders found.
                </td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-brand-offWhite/50 transition-colors">
                <td className="p-4 font-heading font-bold tracking-wider">{order.id}</td>
                <td className="p-4 uppercase text-[10px] text-brand-grey whitespace-nowrap">
                  {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 uppercase whitespace-nowrap break-words max-w-[200px]">
                  {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}<br />
                  <span className="text-[10px] text-brand-grey">{order.shippingDetails?.email}</span>
                </td>
                <td className="p-4 text-[10px] uppercase leading-tight min-w-[200px]">
                  {order.cart?.map((item: any, i: number) => (
                    <div key={i} className="mb-1 truncate">
                      {item.quantity}x {item.product.name} (SZ: {item.selectedSize})
                    </div>
                  ))}
                </td>
                <td className="p-4 font-bold">₹{order.totalAmount?.toFixed(2)}</td>
                <td className="p-4">
                  <select 
                    value={order.status || "PROCESSING"}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="font-body text-[10px] uppercase font-bold tracking-widest bg-transparent border-b border-brand-black pb-1 focus:outline-none cursor-pointer"
                  >
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
