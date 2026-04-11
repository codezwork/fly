import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const syncCartToFirebase = async (cart: CartItem[], user: User | null) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid), { cart }, { merge: true });
  } catch (error) {
    console.error("Failed to sync cart:", error);
  }
};

export type Product = {
  id: string;
  handle: string;
  name: string;
  price: string;
  category: string;
  collectionHandle: string;
  imageStudio: string[];
  imageLifestyle: string[];
  availability: "live" | "archived";
  sizes: string[];
  productDetails: string;
  productSizing: string;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

interface AppState {
  // User Slice
  user: User | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // UI Slice (replaces CartContext)
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart Slice
  cart: CartItem[];
  addToCart: (product: Product, selectedSize: string) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  increaseQuantity: (productId: string, selectedSize: string) => void;
  decreaseQuantity: (productId: string, selectedSize: string) => void;
  clearCart: () => void;

  // Global Toast
  toastMessage: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User Slice
      user: null,
      userProfile: null,
      isAuthLoading: true,
      setUser: async (user) => {
        set({ user });
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.cart) set({ cart: data.cart });
              
              set({ 
                userProfile: {
                  firstName: data.firstName || (data.name ? data.name.split(' ')[0] : ""),
                  lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : ""),
                  phone: data.phone || "",
                  address: data.address || "",
                  city: data.city || "",
                  pincode: data.pincode || data.zip || "",
                }
              });
            }
          } catch (e) {
            console.error("Failed to fetch user data", e);
          }
        } else {
          set({ userProfile: null });
        }
      },
      setUserProfile: (userProfile) => set({ userProfile }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      // UI Slice
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      // Cart Slice
      cart: [],
      addToCart: (product, selectedSize) => set((state) => {
        const index = state.cart.findIndex(
          (item) => item.product.id === product.id && item.selectedSize === selectedSize
        );
        let newCart: CartItem[];
        if (index !== -1) {
          newCart = [...state.cart];
          newCart[index].quantity += 1;
        } else {
          newCart = [...state.cart, { product, selectedSize, quantity: 1 }];
        }
        syncCartToFirebase(newCart, state.user);
        return { cart: newCart };
      }),
      removeFromCart: (productId, selectedSize) => set((state) => {
        const newCart = state.cart.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize));
        syncCartToFirebase(newCart, state.user);
        return { cart: newCart };
      }),
      increaseQuantity: (productId, selectedSize) => set((state) => {
        const newCart = state.cart.map((item) =>
          (item.product.id === productId && item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        syncCartToFirebase(newCart, state.user);
        return { cart: newCart };
      }),
      decreaseQuantity: (productId, selectedSize) => set((state) => {
        const newCart = state.cart.reduce<CartItem[]>((acc, item) => {
          if (item.product.id === productId && item.selectedSize === selectedSize) {
            if (item.quantity > 1) {
              acc.push({ ...item, quantity: item.quantity - 1 });
            }
          } else {
            acc.push(item);
          }
          return acc;
        }, []);
        syncCartToFirebase(newCart, state.user);
        return { cart: newCart };
      }),
      clearCart: () => set((state) => {
        syncCartToFirebase([], state.user);
        return { cart: [] };
      }),

      // Global Toast
      toastMessage: null,
      showToast: (message) => set({ toastMessage: message }),
      hideToast: () => set({ toastMessage: null }),
    }),
    {
      name: 'fly-store-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
