import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, useStore } from "@/store/useStore";
import { Collection } from "./AdminCollectionManager";
import { useDropzone } from "react-dropzone";
import { Loader2, Image as ImageIcon } from "lucide-react";
import SortableImageGrid from "./SortableImageGrid";

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionsList, setCollectionsList] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const showToast = useStore((state) => state.showToast);

  const [formData, setFormData] = useState<Partial<Product>>({
    id: "", handle: "", name: "", price: "", category: "", collectionHandle: "",
    imageStudio: [""], imageLifestyle: [""], availability: "live", sizes: [],
    productDetails: "", productSizing: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingState, setUploadingState] = useState<{
    studio: { active: boolean; current: number; total: number };
    lifestyle: { active: boolean; current: number; total: number };
  }>({
    studio: { active: false, current: 0, total: 0 },
    lifestyle: { active: false, current: 0, total: 0 },
  });

  const handleFileUpload = async (files: File[], type: "imageStudio" | "imageLifestyle") => {
    if (!formData.id) {
        showToast("ERROR: DOCUMENT ID REQUIRED FOR UPLOAD");
        return;
    }

    const key = type === "imageStudio" ? "studio" : "lifestyle";
    setUploadingState(prev => ({ ...prev, [key]: { active: true, current: 0, total: files.length } }));

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        setUploadingState(prev => ({ ...prev, [key]: { ...prev[key], current: i + 1 } }));
        const file = files[i];

        try {
            // 1. Get Presigned URL with productId for folder structuring
            const res = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({ 
                    filename: file.name, 
                    contentType: file.type,
                    productId: formData.id 
                }),
            });
            
            if (!res.ok) throw new Error("Failed to get upload URL");
            
            const { uploadUrl, publicUrl } = await res.json();

            // 2. Upload to R2
            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            uploadedUrls.push(publicUrl);
        } catch (error) {
            console.error("Upload failed for", file.name, error);
            showToast(`UPLOAD FAILED: ${file.name.toUpperCase()}`);
        }
    }

    setFormData(prev => ({
        ...prev,
        [type]: [...(prev[type] as string[] || []), ...uploadedUrls]
    }));

    setUploadingState(prev => ({ ...prev, [key]: { active: false, current: 0, total: 0 } }));
    showToast(`${uploadedUrls.length} IMAGES UPLOADED`);
  };

  const onDropStudio = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles, "imageStudio");
  }, [formData]);

  const onDropLifestyle = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles, "imageLifestyle");
  }, [formData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(collection(db, "products"));
      const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
      setProducts(pData);

      const cSnap = await getDocs(collection(db, "collections"));
      const cData = cSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Collection[];
      setCollectionsList(cData);
    } catch (e) {
      console.error(e);
      showToast("FAILED TO FETCH DATA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        imageStudio: (formData.imageStudio as string[] || []).filter(u => u !== ""),
        imageLifestyle: (formData.imageLifestyle as string[] || []).filter(u => u !== "")
      };
      
      const docRef = doc(db, "products", formData.id as string);
      
      if (isEditing) {
        await updateDoc(docRef, parsedData);
        showToast("PRODUCT UPDATED");
      } else {
        await setDoc(docRef, parsedData);
        showToast("PRODUCT CREATED");
      }
      
      resetForm();
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("ERROR SAVING PRODUCT");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      showToast("PRODUCT DELETED");
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("ERROR DELETING");
    }
  };

  const handleEdit = (product: Product) => {
    // Convert legacy strings to array for form patching
    setFormData({
      ...product,
      imageStudio: typeof product.imageStudio === "string" ? [product.imageStudio] : (product.imageStudio || []),
      imageLifestyle: typeof product.imageLifestyle === "string" ? [product.imageLifestyle] : (product.imageLifestyle || []),
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: "", handle: "", name: "", price: "", category: "", collectionHandle: "", imageStudio: [], imageLifestyle: [], availability: "live", sizes: [], productDetails: "", productSizing: "" });
    setIsEditing(false);
  };

  if (loading) return <div className="text-white font-body text-xs tracking-widest uppercase">Fetching Datastore...</div>;

  return (
    <div className="w-full flex flex-col xl:flex-row gap-12 items-start pointer-events-auto">
      
      {/* FORM PANEL */}
      <div className="w-full xl:w-1/3 bg-brand-offWhite p-8 border border-black backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
          <h2 className="font-heading text-lg font-bold uppercase tracking-widest text-brand-black">
            {isEditing ? "Edit Product" : "New Product"}
          </h2>
          {isEditing && (
             <button onClick={resetForm} className="text-[10px] uppercase font-bold tracking-widest hover:text-brand-grey transition-colors text-brand-black">Cancel</button>
          )}
        </div>
        
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
              placeholder="DOC ID (e.g. prod_01)" 
              value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} disabled={isEditing}
            />
            <input 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
              placeholder="HANDLE (e.g. basic-tee)" 
              value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} 
            />
          </div>
          
          <input 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
            placeholder="NAME (e.g. BASIC TEE)" 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black" 
              placeholder="PRICE (e.g. 150)" 
              value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
            <select 
              className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black uppercase text-brand-black"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="" disabled>SELECT CATEGORY</option>
              <option value="Outerwear">OUTERWEAR</option>
              <option value="Tops">TOPS</option>
              <option value="Bottoms">BOTTOMS</option>
              <option value="Accessories">ACCESSORIES</option>
            </select>
          </div>

          <select 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black uppercase text-brand-black"
            value={formData.collectionHandle}
            onChange={(e) => setFormData({...formData, collectionHandle: e.target.value})}
          >
            <option value="" disabled>SELECT A COLLECTION</option>
            {collectionsList.map(c => (
              <option key={c.id} value={c.handle}>{c.name}</option>
            ))}
          </select>

          <textarea 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black h-20 resize-none" 
            placeholder="PRODUCT DETAILS (Optional)" 
            value={formData.productDetails} onChange={(e) => setFormData({...formData, productDetails: e.target.value})} 
          />

          <textarea 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black text-brand-black h-20 resize-none" 
            placeholder="PRODUCT SIZING SUMMARY (Optional)" 
            value={formData.productSizing} onChange={(e) => setFormData({...formData, productSizing: e.target.value})} 
          />

          {/* Studio Images Section */}
          <div className="flex flex-col gap-3 mt-4">
            <label className="text-[10px] font-bold tracking-widest text-brand-grey uppercase">Studio Images</label>
            
            <DropzoneArea 
                onDrop={onDropStudio} 
                uploading={uploadingState.studio}
                disabled={!formData.id}
            />

            <SortableImageGrid 
                images={(formData.imageStudio as string[]) || []}
                setImages={(newImages) => setFormData(prev => ({...prev, imageStudio: newImages}))}
            />
          </div>

          {/* Lifestyle Images Section */}
          <div className="flex flex-col gap-3 mt-4">
            <label className="text-[10px] font-bold tracking-widest text-brand-grey uppercase">Lifestyle Images</label>
            
            <DropzoneArea 
                onDrop={onDropLifestyle} 
                uploading={uploadingState.lifestyle}
                disabled={!formData.id}
            />

            <SortableImageGrid 
                images={(formData.imageLifestyle as string[]) || []}
                setImages={(newImages) => setFormData(prev => ({...prev, imageLifestyle: newImages}))}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] font-bold tracking-widest text-brand-grey uppercase">Available Sizes</label>
            <div className="flex gap-2 flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map(s => {
                const isSelected = formData.sizes?.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          sizes: prev.sizes?.includes(s) ? prev.sizes.filter(z => z !== s) : [...(prev.sizes || []), s]
                        }));
                    }}
                    className={`px-4 py-2 border text-xs font-bold font-body transition-colors ${isSelected ? 'bg-white text-black border-black border-2' : 'border-brand-black/20 text-brand-black hover:border-brand-black'}`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <select 
            className="border border-brand-black/20 p-3 bg-transparent text-xs font-body focus:outline-none focus:border-brand-black uppercase text-brand-black"
            value={formData.availability}
            onChange={(e) => setFormData({...formData, availability: e.target.value as "live" | "archived"})}
          >
            <option value="live">LIVE</option>
            <option value="archived">ARCHIVED</option>
          </select>

          <button type="submit" className="mt-4 bg-brand-black text-white h-[50px] uppercase font-bold tracking-widest text-xs hover:bg-brand-black/80 transition-colors">
            {isEditing ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
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
              <th className="pb-4 font-normal">Status</th>
              <th className="pb-4 font-normal">Sizes</th>
              <th className="pb-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#222] hover:bg-[#111] transition-colors group">
                <td className="py-4 text-[#888] font-mono">{p.id}</td>
                <td className="py-4 font-bold tracking-wider">{p.name}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-[10px] tracking-widest uppercase font-bold ${p.availability === 'live' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {p.availability}
                  </span>
                </td>
                <td className="py-4 text-[#888]">{p.sizes?.join(", ") || "-"}</td>
                <td className="py-4 text-right opacity-50 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="mr-6 hover:text-white transition-colors uppercase tracking-widest font-bold">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#555] tracking-widest uppercase">NO PRODUCTS FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function DropzoneArea({ onDrop, uploading, disabled }: { onDrop: (files: File[]) => void, uploading: { active: boolean, current: number, total: number }, disabled?: boolean }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        disabled: disabled || uploading.active
    });

    return (
        <div 
            {...getRootProps()} 
            className={`cursor-pointer border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                isDragActive ? 'border-brand-black bg-black/5 scale-[0.99]' : 'border-brand-black/30 bg-transparent hover:border-brand-black hover:bg-black/2'
            } ${uploading.active || disabled ? 'pointer-events-none opacity-50 bg-black/5' : ''}`}
        >
            <input {...getInputProps()} />
            
            {uploading.active ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-black" />
                    <p className="font-mono text-[10px] font-bold tracking-widest text-brand-black uppercase">
                        {`// UPLOADING: ${uploading.current} OF ${uploading.total}`}
                    </p>
                </div>
            ) : (
                <>
                   <ImageIcon className={`w-5 h-5 ${isDragActive ? 'text-brand-black' : 'text-brand-black/40'}`} />
                   <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-center text-brand-black px-4 leading-relaxed">
                       {disabled 
                         ? "[ ENTER DOC ID TO ENABLE UPLOAD ]" 
                         : (isDragActive ? "[ RELEASE TO UPLOAD ]" : "[ DROP IMAGES HERE OR CLICK TO BROWSE ]")}
                   </p>
                </>
            )}
        </div>
    );
}
