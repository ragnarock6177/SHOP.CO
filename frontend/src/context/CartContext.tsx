'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types/ecommerce';

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
  wishlist: string[];
  orders: OrderRecord[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, variantId?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  addOrder: (order: OrderRecord) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
}

const DEFAULT_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-98214',
    date: 'August 10, 2026',
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-700',
    total: 390.00,
    trackingNum: 'TRK90281471',
    items: [
      {
        title: 'ONE LIFE GRAPHIC T-SHIRT',
        price: 260,
        color: 'Olive Green',
        size: 'Large',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=200',
      },
      {
        title: 'Sleeve Striped T-shirt',
        price: 130,
        color: 'Orange Black',
        size: 'Large',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200',
      }
    ],
    shippingAddress: '742 Evergreen Terrace, Springfield, IL',
    paymentMethod: 'Credit Card (Visa •••• 4242)'
  },
  {
    id: 'ORD-97642',
    date: 'July 28, 2026',
    status: 'In Transit',
    statusColor: 'bg-blue-100 text-blue-700',
    total: 212.00,
    trackingNum: 'TRK84729103',
    items: [
      {
        title: 'Vertical Striped Shirt',
        price: 212,
        color: 'Sage Green',
        size: 'Medium',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=200',
      }
    ],
    shippingAddress: '742 Evergreen Terrace, Springfield, IL',
    paymentMethod: 'Apple Pay'
  }
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart, wishlist, and orders from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('ecommerce_cart');
      const savedWishlist = localStorage.getItem('ecommerce_wishlist');
      const savedOrders = localStorage.getItem('ecommerce_orders');
      
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders(DEFAULT_ORDERS);
      }
    } catch (e) {
      console.error('Failed to load state', e);
      setOrders(DEFAULT_ORDERS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
      localStorage.setItem('ecommerce_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [cart, wishlist, orders, isInitialized]);

  const addToCart = (product: Product, quantity = 1, color?: string, size?: string, variantId?: string) => {
    setCart((prevCart) => {
      const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
      const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
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
        }
      ];
    });
    setIsCartOpen(true);
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

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const clearWishlist = () => {
    setWishlist([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addOrder,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        cartCount,
        wishlistCount,
        cartSubtotal
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
