import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

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

export type CartItem = {
  product: Product;
  selectedSize: string;
  quantity: number;
};

interface AppState {
  // User Slice
  user: User | null;
  isAuthLoading: boolean;
  setUser: (user: User | null) => void;
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
      isAuthLoading: true,
      setUser: (user) => set({ user }),
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
        if (index !== -1) {
          const newCart = [...state.cart];
          newCart[index].quantity += 1;
          return { cart: newCart };
        }
        return { cart: [...state.cart, { product, selectedSize, quantity: 1 }] };
      }),
      removeFromCart: (productId, selectedSize) => set((state) => ({
        cart: state.cart.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize))
      })),
      increaseQuantity: (productId, selectedSize) => set((state) => ({
        cart: state.cart.map((item) =>
          (item.product.id === productId && item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      })),
      decreaseQuantity: (productId, selectedSize) => set((state) => ({
        cart: state.cart.reduce<CartItem[]>((acc, item) => {
          if (item.product.id === productId && item.selectedSize === selectedSize) {
            if (item.quantity > 1) {
              acc.push({ ...item, quantity: item.quantity - 1 });
            }
          } else {
            acc.push(item);
          }
          return acc;
        }, [])
      })),
      clearCart: () => set({ cart: [] }),

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
