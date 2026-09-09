"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/context/CartContext";
import { SizeSelectionModal } from "@/components/product/SizeSelectionModal";
import {
  getCartItemsMissingSelection,
  productRequiresSize,
  resolveProductColor,
} from "@/lib/productVariants";

type SizeFlowMode = "buy-now" | "checkout" | "cart-item" | "add-to-cart";

interface ActiveSizeRequest {
  mode: SizeFlowMode;
  product: Product;
  initialColor?: string;
  quantity: number;
  cartItemIndex?: number;
}

interface AddToCartOptions {
  size?: string;
  variantId?: string;
  onSuccess?: () => void;
}

interface PendingAddRequest {
  product: Product;
  color?: string;
  quantity: number;
  options?: AddToCartOptions;
}

interface SizeSelectionContextType {
  requestBuyNow: (product: Product, color?: string, quantity?: number) => void;
  requestAddToCart: (
    product: Product,
    color?: string,
    quantity?: number,
    options?: AddToCartOptions,
  ) => void;
  requestCheckout: () => void;
  requestCartItemSelection: (cartItemIndex: number) => void;
}

const SizeSelectionContext = createContext<SizeSelectionContextType | undefined>(undefined);

function buildCheckoutRequest(cart: ReturnType<typeof useCart>["cart"], index: number): ActiveSizeRequest | null {
  const item = cart[index];
  if (!item) return null;

  return {
    mode: "checkout",
    product: item.product,
    initialColor: resolveProductColor(item.product, item.selectedColor),
    quantity: item.quantity,
    cartItemIndex: index,
  };
}

export function SizeSelectionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { cart, addToCart, updateCartItemVariant, setIsCartOpen } = useCart();
  const [activeRequest, setActiveRequest] = useState<ActiveSizeRequest | null>(null);
  const [awaitingCheckoutAdvance, setAwaitingCheckoutAdvance] = useState(false);
  const [checkoutItemsRemaining, setCheckoutItemsRemaining] = useState(0);
  const pendingAddQueueRef = useRef<PendingAddRequest[]>([]);
  const pendingAddCallbackRef = useRef<(() => void) | undefined>(undefined);

  const proceedToCheckout = useCallback(() => {
    setIsCartOpen(false);
    router.push("/checkout");
  }, [router, setIsCartOpen]);

  const closeModal = useCallback(() => {
    setActiveRequest(null);
    setAwaitingCheckoutAdvance(false);
    setCheckoutItemsRemaining(0);
    pendingAddQueueRef.current = [];
    pendingAddCallbackRef.current = undefined;
  }, []);

  const openCheckoutRequestForIndex = useCallback(
    (index: number, remainingCount: number) => {
      const request = buildCheckoutRequest(cart, index);
      if (!request) {
        proceedToCheckout();
        return;
      }

      setCheckoutItemsRemaining(remainingCount);
      setActiveRequest(request);
    },
    [cart, proceedToCheckout],
  );

  const requestCheckout = useCallback(() => {
    const missingIndexes = getCartItemsMissingSelection(cart);
    if (missingIndexes.length === 0) {
      proceedToCheckout();
      return;
    }

    openCheckoutRequestForIndex(missingIndexes[0], missingIndexes.length);
  }, [cart, openCheckoutRequestForIndex, proceedToCheckout]);

  const completeAddToCart = useCallback(
    (
      product: Product,
      quantity: number,
      color: string | undefined,
      size: string | undefined,
      variantId: string | undefined,
      onSuccess?: () => void,
    ) => {
      addToCart(product, quantity, color, size, variantId);
      toast.success(`Added "${product.title}" to cart`);
      onSuccess?.();
    },
    [addToCart],
  );

  const openAddToCartModal = useCallback((pending: PendingAddRequest) => {
    pendingAddCallbackRef.current = pending.options?.onSuccess;
    setActiveRequest({
      mode: "add-to-cart",
      product: pending.product,
      initialColor: resolveProductColor(pending.product, pending.color),
      quantity: pending.quantity,
    });
  }, []);

  const processNextPendingAdd = useCallback(() => {
    const next = pendingAddQueueRef.current.shift();
    if (!next) return;

    const resolvedColor = resolveProductColor(next.product, next.color);

    if (next.options?.size) {
      completeAddToCart(
        next.product,
        next.quantity,
        resolvedColor,
        next.options.size,
        next.options.variantId,
        next.options.onSuccess,
      );
      processNextPendingAdd();
      return;
    }

    if (!productRequiresSize(next.product)) {
      completeAddToCart(next.product, next.quantity, resolvedColor, undefined, undefined, next.options?.onSuccess);
      processNextPendingAdd();
      return;
    }

    openAddToCartModal(next);
  }, [completeAddToCart, openAddToCartModal]);

  const requestAddToCart = useCallback(
    (product: Product, color?: string, quantity = 1, options?: AddToCartOptions) => {
      const resolvedColor = resolveProductColor(product, color);

      if (options?.size) {
        completeAddToCart(product, quantity, resolvedColor, options.size, options.variantId, options.onSuccess);
        return;
      }

      if (!productRequiresSize(product)) {
        completeAddToCart(product, quantity, resolvedColor, undefined, undefined, options?.onSuccess);
        return;
      }

      const pending: PendingAddRequest = { product, color, quantity, options };

      if (activeRequest) {
        pendingAddQueueRef.current.push(pending);
        return;
      }

      openAddToCartModal(pending);
    },
    [activeRequest, completeAddToCart, openAddToCartModal],
  );

  const requestBuyNow = useCallback(
    (product: Product, color?: string, quantity = 1) => {
      const resolvedColor = resolveProductColor(product, color);

      if (!productRequiresSize(product)) {
        addToCart(product, quantity, resolvedColor, undefined, undefined, { openDrawer: false });
        proceedToCheckout();
        return;
      }

      setActiveRequest({
        mode: "buy-now",
        product,
        initialColor: resolvedColor,
        quantity,
      });
    },
    [addToCart, proceedToCheckout],
  );

  const requestCartItemSelection = useCallback(
    (cartItemIndex: number) => {
      const request = buildCheckoutRequest(cart, cartItemIndex);
      if (!request) return;

      setActiveRequest({
        ...request,
        mode: "cart-item",
      });
    },
    [cart],
  );

  const handleConfirm = useCallback(
    (selection: { color?: string; size?: string; variantId?: string }) => {
      if (!activeRequest) return;

      const resolvedColor = resolveProductColor(activeRequest.product, selection.color);

      if (activeRequest.mode === "buy-now") {
        addToCart(
          activeRequest.product,
          activeRequest.quantity,
          resolvedColor,
          selection.size,
          selection.variantId,
          { openDrawer: false },
        );
        setActiveRequest(null);
        proceedToCheckout();
        return;
      }

      if (activeRequest.mode === "add-to-cart") {
        completeAddToCart(
          activeRequest.product,
          activeRequest.quantity,
          resolvedColor,
          selection.size,
          selection.variantId,
          pendingAddCallbackRef.current,
        );
        pendingAddCallbackRef.current = undefined;
        setActiveRequest(null);

        if (pendingAddQueueRef.current.length > 0) {
          processNextPendingAdd();
        }
        return;
      }

      if (activeRequest.cartItemIndex !== undefined) {
        updateCartItemVariant(activeRequest.cartItemIndex, {
          color: resolvedColor,
          size: selection.size,
          variantId: selection.variantId,
        });
        setActiveRequest(null);

        if (activeRequest.mode === "checkout") {
          setAwaitingCheckoutAdvance(true);
        }
      }
    },
    [activeRequest, addToCart, completeAddToCart, proceedToCheckout, processNextPendingAdd, updateCartItemVariant],
  );

  useEffect(() => {
    if (!awaitingCheckoutAdvance) return;

    setAwaitingCheckoutAdvance(false);
    const missingIndexes = getCartItemsMissingSelection(cart);

    if (missingIndexes.length === 0) {
      proceedToCheckout();
      return;
    }

    openCheckoutRequestForIndex(missingIndexes[0], missingIndexes.length);
  }, [awaitingCheckoutAdvance, cart, openCheckoutRequestForIndex, proceedToCheckout]);

  const modalCopy = useMemo(() => {
    if (!activeRequest) {
      return {
        title: "Select your size",
        subtitle: "Your color is already selected. Pick a size to continue.",
        confirmLabel: "Continue",
      };
    }

    if (activeRequest.mode === "buy-now") {
      return {
        title: "Select size before checkout",
        subtitle: "Color is set. Choose your size and we'll take you to checkout.",
        confirmLabel: "Continue to Checkout",
      };
    }

    if (activeRequest.mode === "add-to-cart") {
      return {
        title: "Select size to add to cart",
        subtitle: "Choose your size first. We'll add this item to your cart.",
        confirmLabel: "Add to Cart",
      };
    }

    if (activeRequest.mode === "cart-item") {
      return {
        title: "Select size",
        subtitle: "Choose the size for this item in your cart.",
        confirmLabel: "Save Size",
      };
    }

    return {
      title:
        checkoutItemsRemaining > 1
          ? `Select size (${checkoutItemsRemaining} items left)`
          : "Select size to checkout",
      subtitle: "This item needs a size before you can complete checkout.",
      confirmLabel: checkoutItemsRemaining > 1 ? "Save & Next" : "Continue to Checkout",
    };
  }, [activeRequest, checkoutItemsRemaining]);

  return (
    <SizeSelectionContext.Provider
      value={{ requestBuyNow, requestAddToCart, requestCheckout, requestCartItemSelection }}
    >
      {children}
      <SizeSelectionModal
        open={Boolean(activeRequest)}
        product={activeRequest?.product ?? null}
        initialColor={activeRequest?.initialColor}
        quantity={activeRequest?.quantity ?? 1}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        confirmLabel={modalCopy.confirmLabel}
        onClose={closeModal}
        onConfirm={handleConfirm}
      />
    </SizeSelectionContext.Provider>
  );
}

export function useSizeSelection() {
  const context = useContext(SizeSelectionContext);
  if (!context) {
    throw new Error("useSizeSelection must be used within SizeSelectionProvider");
  }
  return context;
}
