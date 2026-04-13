"use client";

import { useState, useEffect } from "react";
import { collection as firestoreCollection, getDocs, doc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

const GOOGLE_DRIVE_PATTERNS = [
  /\/file\/d\/([a-zA-Z0-9_-]+)/,
  /[?&]id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/uc\?export=view&id=([a-zA-Z0-9_-]+)/
];

function parseImageUrl(url: string) {
  if (!url) return url;
  
  for (const pattern of GOOGLE_DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
  }
  return url;
}

export type Collection = {
  id: string;
  name: string;
  handle: string;
  description: string;
  featureVideoUrl?: string;
  posterUrl: string;
}

export default function AdminCollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const showToast = useStore((state) => state.showToast);

  const [formData, setFormData] = useState<Partial<Collection>>({
    id: "", name: "", handle: "", description: "", posterUrl: "", featureVideoUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(firestoreCollection(db, "collections"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Collection[];
      setCollections(data);
    } catch (e) {
      console.error(e);
      showToast("FAILED TO FETCH COLLECTIONS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.handle) {
      showToast("ID, NAME AND HANDLE REQUIRED");
      return;
    }
    
    try {
      const parsedData = { 
        ...formData, 
        posterUrl: parseImageUrl(formData.posterUrl || "")
      };
      
      const docRef = doc(db, "collections", formData.id as string);
      
      if (isEditing) {
        await updateDoc(docRef, parsedData);
        showToast("COLLECTION UPDATED");
      } else {
        await setDoc(docRef, parsedData);
        showToast("COLLECTION CREATED");
      }
      
      resetForm();
      fetchCollections();
    } catch (e) {
      console.error(e);
      showToast("ERROR SAVING COLLECTION");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      await deleteDoc(doc(db, "collections", id));
      showToast("COLLECTION DELETED");
      fetchCollections();
    } catch (e) {
      console.error(e);
      showToast("ERROR DELETING");
    }
  };

  const handleEdit = (c: Collection) => {
    setFormData(c);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", handle: "", description: "", posterUrl: "", featureVideoUrl: "" });
    setIsEditing(false);
  };

  if (loading) return <div className="text-white font-body text-xs tracking-widest uppercase">Fetching Collections...</div>;

  return (
    <div className="w-full flex flex-col xl:flex-row gap-12 items-start pointer-events-auto">
      
      {/* FORM PANEL */}
      <div className="w-full xl:w-1/3 bg-brand-offWhite p-8 border border-black backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
          <h2 className="font-heading text-lg font-bold uppercase tracking-widest text-brand-black">
            {isEditing ? "Edit Collection" : "New Collection"}
          </h2>
          {isEditing && (
             <button onClick={resetForm} className="text-[10px] uppercase font-bold tracking-widest hover:text-brand-grey transition-colors text-brand-black">Cancel</button>
          )}
        </div>
        
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
              placeholder="DOC ID (e.g. col_01)" 
              value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} disabled={isEditing}
            />
            <input 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
              placeholder="HANDLE (e.g. fw24-core)" 
              value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} 
            />
          </div>
          
          <input 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
            placeholder="NAME (e.g. FW24 CORE)" 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          
          <textarea 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black h-24 resize-none" 
            placeholder="DETAILS/DESCRIPTION" 
            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
          />

          <input 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
            placeholder="COVER POSTER URL (or GDrive Link)" 
            value={formData.posterUrl} 
            onChange={(e) => {
              const val = e.target.value;
              setFormData({...formData, posterUrl: parseImageUrl(val)});
            }} 
          />

          <input 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
            placeholder="FEATURE VIDEO URL (Optional)" 
            value={formData.featureVideoUrl} 
            onChange={(e) => setFormData({...formData, featureVideoUrl: e.target.value})} 
          />

          <button type="submit" className="mt-4 bg-brand-black text-white h-[50px] uppercase font-bold tracking-widest text-xs hover:bg-brand-black/80 transition-colors">
            {isEditing ? "UPDATE COLLECTION" : "CREATE COLLECTION"}
          </button>
        </form>
      </div>

      {/* TABLE PANEL */}
      <div className="w-full xl:w-2/3 bg-brand-black p-8 overflow-x-auto border border-[#333]">
        <table className="w-full text-left text-white font-body text-xs">
          <thead>
            <tr className="border-b border-[#333] tracking-widest uppercase text-[#888]">
              <th className="pb-4 font-normal">ID</th>
              <th className="pb-4 font-normal">Name</th>
              <th className="pb-4 font-normal">Handle</th>
              <th className="pb-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-[#222] hover:bg-[#111] transition-colors group">
                <td className="py-4 text-[#888] font-mono">{c.id}</td>
                <td className="py-4 font-bold tracking-wider">{c.name}</td>
                <td className="py-4 text-[#888]">{c.handle}</td>
                <td className="py-4 text-right opacity-50 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(c)} className="mr-6 hover:text-white transition-colors uppercase tracking-widest font-bold">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#555] tracking-widest uppercase">NO COLLECTIONS FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
