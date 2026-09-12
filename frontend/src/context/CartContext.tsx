'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { Product, CartItem } from '../types/ecommerce';
import { useAuth } from './AuthContext';
import {
  getWishlistApi,
  addWishlistItemApi,
  removeWishlistItemApi,
  syncLocalWishlistToServer,
  BackendWishlistItem,
} from '@/lib/wishlistApi';
import {
  getCartApi,
  addCartItemApi,
  updateCartItemApi,
  removeCartItemApi,
  mergeCartApi,
  BackendCartItem,
} from '@/lib/cartApi';

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
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, variantId?: string) => void;
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
  cart: 'ecommerce_cart',
  wishlistItems: 'ecommerce_wishlist_items',
  orders: 'ecommerce_orders',
  guestToken: 'ecommerce_guest_token',
} as const;

const DEFAULT_ORDERS: OrderRecord[] = [];

const CartContext = createContext<CartContextType | undefined>(undefined);

function getOrCreateGuestToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(STORAGE_KEYS.guestToken);
  if (!token) {
    token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEYS.guestToken, token);
  }
  return token;
}

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

function mapBackendCartItemToCartItem(item: BackendCartItem): CartItem {
  return {
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    selectedColor: item.variantName?.includes(' / ') ? item.variantName.split(' / ')[0] : undefined,
    selectedSize: item.variantName?.includes(' / ') ? item.variantName.split(' / ')[1] : item.variantName,
    product: {
      id: item.productId,
      title: item.productName,
      slug: item.productSlug,
      price: item.unitPrice,
      image: item.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      images: item.imageUrl ? [item.imageUrl] : [],
      rating: 4.8,
      reviewsCount: 12,
      category: 'Clothing',
      inStock: true,
      description: '',
    },
  };
}

function mapBackendWishlistItemToWishlistItem(item: BackendWishlistItem): WishlistItem {
  return {
    addedAt: item.addedAt,
    product: {
      id: item.productId,
      title: item.name,
      slug: item.slug,
      price: item.basePrice || 0,
      image: item.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      images: item.imageUrl ? [item.imageUrl] : [],
      rating: 4.8,
      reviewsCount: 12,
      category: 'Clothing',
      inStock: true,
      description: '',
    },
  };
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, isHydrated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const hasSyncedAuthRef = useRef(false);

  // 1. Initial Local Storage Hydration
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

  // 2. Persist to Local Storage
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

  // 3. Real-Time DB Sync on User Login
  useEffect(() => {
    if (!isStorageReady || !isHydrated || !isAuthenticated || !token) return;
    if (hasSyncedAuthRef.current) return;
    hasSyncedAuthRef.current = true;

    const guestToken = getOrCreateGuestToken();

    // A. Sync Wishlist from & to DB
    const syncWishlist = async () => {
      try {
        const localProductIds = wishlistItems.map((item) => item.product.id);
        if (localProductIds.length > 0) {
          await syncLocalWishlistToServer(token, localProductIds);
        }

        const serverWishlist = await getWishlistApi(token);
        if (serverWishlist && serverWishlist.items) {
          const serverItems = serverWishlist.items.map(mapBackendWishlistItemToWishlistItem);
          // Merge server items with local items (preserving uniqueness by productId)
          setWishlistItems((prev) => {
            const combined = [...serverItems];
            for (const localItem of prev) {
              if (!combined.some((item) => item.product.id === localItem.product.id)) {
                combined.push(localItem);
              }
            }
            return combined;
          });
        }
      } catch (err: unknown) {
        console.warn('Wishlist server sync failed on login:', err);
      }
    };

    // B. Merge & Sync Cart from & to DB
    const syncCart = async () => {
      try {
        if (guestToken) {
          await mergeCartApi(guestToken, token);
        }
        const serverCart = await getCartApi(token);
        if (serverCart && serverCart.items && serverCart.items.length > 0) {
          const serverItems = serverCart.items.map(mapBackendCartItemToCartItem);
          setCart(serverItems);
        }
      } catch (err: unknown) {
        console.warn('Cart server sync failed on login:', err);
      }
    };

    syncWishlist();
    syncCart();
  }, [isStorageReady, isHydrated, isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedAuthRef.current = false;
    }
  }, [isAuthenticated]);

  // Real-Time Add to Cart (Optimistic + DB Sync)
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string, variantId?: string) => {
    const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    let resolvedVariantId = variantId;
    if (!resolvedVariantId && product.variants && product.variants.length > 0) {
      const match = product.variants.find((v) => {
        const hasColor = selectedColor ? v.attributes.some((a) => a.value === selectedColor || a.attributeName.toLowerCase() === 'color') : true;
        const hasSize = selectedSize ? v.attributes.some((a) => a.value === selectedSize || a.attributeName.toLowerCase() === 'size') : true;
        return hasColor && hasSize;
      });
      resolvedVariantId = match?.id || product.variants[0].id;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (resolvedVariantId && !updated[existingIndex].variantId) {
          updated[existingIndex].variantId = resolvedVariantId;
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
          variantId: resolvedVariantId,
        },
      ];
    });

    setIsCartOpen(true);

    // Sync with DB in real-time if variantId is available
    if (resolvedVariantId) {
      const guestToken = getOrCreateGuestToken();
      addCartItemApi({ variantId: resolvedVariantId, quantity }, token, guestToken)
        .then((updatedCart) => {
          if (updatedCart && updatedCart.items) {
            const serverItems = updatedCart.items.map(mapBackendCartItemToCartItem);
            setCart(serverItems);
          }
        })
        .catch((err) => {
          console.warn('Real-time add to cart DB sync failed:', err);
        });
    }
  };

  // Real-Time Remove from Cart (Optimistic + DB Sync)
  const removeFromCart = (productId: string, color?: string, size?: string) => {
    const itemToRemove = cart.find(
      (item) =>
        item.product.id === productId &&
        (color === undefined || item.selectedColor === color) &&
        (size === undefined || item.selectedSize === size)
    );

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

    if (itemToRemove?.id) {
      const guestToken = getOrCreateGuestToken();
      removeCartItemApi(itemToRemove.id, token, guestToken).catch((err) => {
        console.warn('Real-time remove from cart DB sync failed:', err);
      });
    }
  };

  // Real-Time Update Quantity (Optimistic + DB Sync)
  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }

    const itemToUpdate = cart.find(
      (item) =>
        item.product.id === productId &&
        (color === undefined || item.selectedColor === color) &&
        (size === undefined || item.selectedSize === size)
    );

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

    if (itemToUpdate?.id) {
      const guestToken = getOrCreateGuestToken();
      updateCartItemApi(itemToUpdate.id, quantity, token, guestToken).catch((err) => {
        console.warn('Real-time update quantity DB sync failed:', err);
      });
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Real-Time Toggle Wishlist (Optimistic + DB Sync)
  const toggleWishlist = (product: Product) => {
    const exists = wishlistItems.some((item) => item.product.id === product.id);

    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.product.id !== product.id));
      if (isAuthenticated && token) {
        removeWishlistItemApi(token, product.id).catch((err) => {
          console.warn('Real-time remove wishlist item DB sync failed:', err);
        });
      }
    } else {
      setWishlistItems((prev) => [...prev, { product, addedAt: new Date().toISOString() }]);
      if (isAuthenticated && token) {
        addWishlistItemApi(token, product.id).catch((err) => {
          console.warn('Real-time add wishlist item DB sync failed:', err);
        });
      }
    }
  };

  // Real-Time Remove from Wishlist (Optimistic + DB Sync)
  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));
    if (isAuthenticated && token) {
      removeWishlistItemApi(token, productId).catch((err) => {
        console.warn('Real-time remove wishlist item DB sync failed:', err);
      });
    }
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
