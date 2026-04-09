"use client";

import { useState } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import AdminProductManager from "@/components/AdminProductManager";
import AdminCollectionManager from "@/components/AdminCollectionManager";
import AdminOrderManager from "@/components/AdminOrderManager";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"collections" | "products" | "orders">("collections");

  return (
    <AdminAuthGuard>
      <main className="w-full min-h-screen bg-brand-offWhite pt-32 px-6 lg:px-12 pb-24">
        <div className="flex justify-between items-end border-b-4 border-brand-black pb-4 mb-8">
          <h1 className="font-heading text-4xl lg:text-6xl font-bold uppercase tracking-[0.1em] text-brand-black">DASHBOARD</h1>
          <span className="font-body text-xs font-bold uppercase tracking-widest text-brand-grey mb-2">RESTRICTED_ACCESS // 01</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-12 border-b border-black/10 pb-4">
          <button 
            onClick={() => setActiveTab("collections")}
            className={`font-body text-xs uppercase font-bold tracking-widest transition-colors ${activeTab === 'collections' ? 'text-brand-black border-b border-brand-black pb-1' : 'text-brand-grey hover:text-brand-black'}`}
          >
            Collections
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`font-body text-xs uppercase font-bold tracking-widest transition-colors ${activeTab === 'products' ? 'text-brand-black border-b border-brand-black pb-1' : 'text-brand-grey hover:text-brand-black'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`font-body text-xs uppercase font-bold tracking-widest transition-colors ${activeTab === 'orders' ? 'text-brand-black border-b border-brand-black pb-1' : 'text-brand-grey hover:text-brand-black'}`}
          >
            Orders
          </button>
        </div>

        {activeTab === "collections" && <AdminCollectionManager />}
        {activeTab === "products" && <AdminProductManager />}
        {activeTab === "orders" && <AdminOrderManager />}
        
      </main>
    </AdminAuthGuard>
  );
}
