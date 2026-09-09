'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { Product, CartItem } from '../types/ecommerce';
import { resolveProductColor } from '@/lib/productVariants';
import { useAuth } from './AuthContext';
import { syncLocalWishlistToServer } from '@/lib/wishlistApi';

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: string;
  statusColor: string;
  total: number;
  trackingNum: string;
  items: {
    title: string;
    price: number;
    color: string;
    size: string;
    quantity: number;
    image: string;
  }[];
  shippingAddress?: string;
  paymentMethod?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlistItems: WishlistItem[];
  wishlistProducts: Product[];
  orders: OrderRecord[];
  isCartOpen: boolean;
  isStorageReady: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string,
    variantId?: string,
    options?: { openDrawer?: boolean },
  ) => void;
  updateCartItemVariant: (
    itemIndex: number,
    selection: { color?: string; size?: string; variantId?: string },
  ) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  addOrder: (order: OrderRecord) => void;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
}

const STORAGE_KEYS = {
  cart: 'ecommerce_cart_v2',
  wishlistItems: 'ecommerce_wishlist_items',
  orders: 'ecommerce_orders',
} as const;

const DEFAULT_ORDERS: OrderRecord[] = [];

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadWishlistItems(): WishlistItem[] {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEYS.wishlistItems);
    if (savedItems) {
      const parsed = JSON.parse(savedItems) as WishlistItem[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // fall through
  }
  return [];
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, isHydrated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const hasSyncedWishlistRef = useRef(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
      const savedOrders = localStorage.getItem(STORAGE_KEYS.orders);

      if (savedCart) setCart(JSON.parse(savedCart));
      setWishlistItems(loadWishlistItems());
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders(DEFAULT_ORDERS);
      }
    } catch (e) {
      console.error('Failed to load cart state', e);
      setOrders(DEFAULT_ORDERS);
    } finally {
      setIsStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
      localStorage.setItem(STORAGE_KEYS.wishlistItems, JSON.stringify(wishlistItems));
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist cart state', e);
    }
  }, [cart, wishlistItems, orders, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady || !isHydrated || !isAuthenticated || !token) return;
    if (hasSyncedWishlistRef.current) return;

    hasSyncedWishlistRef.current = true;
    const productIds = wishlistItems.map((item) => item.product.id);
    if (productIds.length === 0) return;

    syncLocalWishlistToServer(token, productIds).catch((err) => {
      console.warn('Wishlist server sync failed (local wishlist preserved):', err);
      hasSyncedWishlistRef.current = false;
    });
  }, [isStorageReady, isHydrated, isAuthenticated, token, wishlistItems]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedWishlistRef.current = false;
    }
  }, [isAuthenticated]);

  const addToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string,
    variantId?: string,
    options?: { openDrawer?: boolean },
  ) => {
    setCart((prevCart) => {
      const selectedColor = resolveProductColor(product, color);
      const selectedSize = size;

      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize,
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (variantId && !updated[existingIndex].variantId) {
          updated[existingIndex].variantId = variantId;
        }
        return updated;
      }

      return [
        ...prevCart,
        {
          product,
          quantity,
          selectedColor,
          selectedSize,
          variantId,
        },
      ];
    });

    if (options?.openDrawer === true) {
      setIsCartOpen(true);
    }
  };

  const updateCartItemVariant = (
    itemIndex: number,
    selection: { color?: string; size?: string; variantId?: string },
  ) => {
    setCart((prevCart) => {
      const current = prevCart[itemIndex];
      if (!current) return prevCart;

      const updatedItem: CartItem = {
        ...current,
        selectedColor: selection.color ?? current.selectedColor,
        selectedSize: selection.size ?? current.selectedSize,
        variantId: selection.variantId || current.variantId,
      };

      const duplicateIndex = prevCart.findIndex(
        (item, index) =>
          index !== itemIndex &&
          item.product.id === updatedItem.product.id &&
          item.selectedColor === updatedItem.selectedColor &&
          item.selectedSize === updatedItem.selectedSize,
      );

      if (duplicateIndex > -1) {
        const merged = [...prevCart];
        merged[duplicateIndex] = {
          ...merged[duplicateIndex],
          quantity: merged[duplicateIndex].quantity + updatedItem.quantity,
          variantId: selection.variantId || merged[duplicateIndex].variantId,
        };
        merged.splice(itemIndex, 1);
        return merged;
      }

      return prevCart.map((item, index) => (index === itemIndex ? updatedItem : item));
    });
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (color === undefined || item.selectedColor === color) &&
            (size === undefined || item.selectedSize === size)
          )
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          (color === undefined || item.selectedColor === color) &&
          (size === undefined || item.selectedSize === size)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { product, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const isInWishlist = (productId: string) =>
    wishlistItems.some((item) => item.product.id === productId);

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistProducts = useMemo(
    () => wishlistItems.map((item) => item.product),
    [wishlistItems],
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlistItems,
        wishlistProducts,
        orders,
        isCartOpen,
        isStorageReady,
        setIsCartOpen,
        addToCart,
        updateCartItemVariant,
        removeFromCart,
        updateQuantity,
        clearCart,
        addOrder,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        cartCount,
        wishlistCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
