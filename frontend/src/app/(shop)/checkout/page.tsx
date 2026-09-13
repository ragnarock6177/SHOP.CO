"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  AddressCheckoutSection,
  buildCheckoutOrderAddressPayload,
  getCheckoutSummaryLocation,
  type CheckoutAddressState,
} from "@/components/address/AddressCheckoutSection";
import { EMPTY_ADDRESS_FORM, type UserAddress } from "@/types/address";
import { getCartItemsMissingSelection } from "@/lib/productVariants";
import { toast } from "sonner";
import {
  getCheckoutSummaryApi,
  placeOrderApi,
  type CheckoutSummaryData,
  type CreateOrderPayload,
} from "@/lib/orderApi";
import { verifyPaymentApi } from "@/lib/paymentApi";
import { useRazorpay } from "react-razorpay";
import { CheckoutShippingSpeed } from "@/components/shop/checkout/CheckoutShippingSpeed";
import { CheckoutPaymentMethod } from "@/components/shop/checkout/CheckoutPaymentMethod";
import { CheckoutOrderSummary } from "@/components/shop/checkout/CheckoutOrderSummary";
import { CheckoutEmptyCart } from "@/components/shop/checkout/CheckoutEmptyCart";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const { Razorpay, error: razorpayLoadError } = useRazorpay();

  // Form selections
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [shippingSpeed, setShippingSpeed] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");

  // Address state
  const [addressState, setAddressState] = useState<CheckoutAddressState>({
    mode: "saved",
    selectedAddressId: null,
    editingAddressId: null,
    newAddress: {
      ...EMPTY_ADDRESS_FORM,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || user?.phoneNumber || "",
      isDefault: true,
    },
  });
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);

  // Order & summary calculations
  const [summary, setSummary] = useState<CheckoutSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lastFetchKeyRef = useRef<string>("");
  const fetchRequestIdRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;
    setAddressState((prev) => ({
      ...prev,
      newAddress: {
        ...prev.newAddress,
        firstName: prev.newAddress.firstName || user.firstName || "",
        lastName: prev.newAddress.lastName || user.lastName || "",
        email: prev.newAddress.email || user.email || "",
        phone: prev.newAddress.phone || user.phone || user.phoneNumber || "",
      },
    }));
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
    }
  }, [cart.length, router]);

  const summaryLocation = useMemo(
    () => getCheckoutSummaryLocation(addressState, savedAddresses),
    [addressState, savedAddresses],
  );

  const cartKey = useMemo(
    () => cart.map((i) => `${i.product.id}:${i.quantity}:${i.selectedSize || ""}:${i.selectedColor || ""}`).join("|"),
    [cart],
  );

  // Synchronous, deterministic client calculations
  const subtotal = summary?.subtotal ?? cart.reduce((tot, i) => tot + i.product.price * i.quantity, 0);
  const discountAmount = summary?.coupon?.applied ? summary.coupon.discountAmount : 0;
  const shippingAmount = summary?.shipping
    ? summary.shipping.amount
    : shippingSpeed === "EXPRESS"
    ? subtotal >= 1999 ? 150 : 249
    : subtotal >= 1999 ? 0 : 99;
  const taxAmount = summary?.taxAmount ?? Math.round((subtotal - discountAmount) * 0.18 * 100) / 100;
  const totalAmount = summary?.totalAmount ?? Math.round((subtotal - discountAmount + shippingAmount + taxAmount) * 100) / 100;

  // Single deterministic backend summary fetch (without setTimeout)
  useEffect(() => {
    if (cart.length === 0) {
      setSummary(null);
      setSummaryLoading(false);
      return;
    }

    const currentKey = `${cartKey}__${shippingSpeed}__${appliedPromo}`;
    if (lastFetchKeyRef.current === currentKey) return;
    lastFetchKeyRef.current = currentKey;

    const currentRequestId = ++fetchRequestIdRef.current;
    setSummaryLoading(true);
    setSummaryError(null);

    const itemsPayload = cart.map((i) => ({
      id: i.variantId || i.product.id,
      variantId: i.variantId,
      productId: i.product.id,
      quantity: i.quantity,
      selectedColor: i.selectedColor || undefined,
      selectedSize: i.selectedSize || undefined,
    }));

    getCheckoutSummaryApi({
      items: itemsPayload,
      couponCode: appliedPromo || undefined,
      shippingSpeed,
      shippingAddress: summaryLocation,
    })
      .then((res) => {
        if (fetchRequestIdRef.current === currentRequestId) {
          setSummary(res);
        }
      })
      .catch((err: any) => {
        if (fetchRequestIdRef.current === currentRequestId) {
          setSummaryError(err.message || "Failed to calculate order totals.");
        }
      })
      .finally(() => {
        if (fetchRequestIdRef.current === currentRequestId) {
          setSummaryLoading(false);
        }
      });
  }, [cartKey, shippingSpeed, appliedPromo, summaryLocation, cart]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setAppliedPromo(promoCode.trim().toUpperCase());
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || submitting) return;

    if (getCartItemsMissingSelection(cart).length > 0) {
      toast.error("Please select a size for all items before placing your order.");
      return;
    }

    if (summary?.items?.some((item) => !item.inStock)) {
      toast.error("Some items exceed available stock. Please update quantities in your cart.");
      return;
    }

    if (addressState.mode === "saved" && !addressState.selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (addressState.mode === "edit") {
      toast.error("Please save your address changes before placing the order.");
      return;
    }

    if (addressState.mode === "new") {
      const required = [
        addressState.newAddress.firstName,
        addressState.newAddress.addressLine1,
        addressState.newAddress.city,
        addressState.newAddress.state,
        addressState.newAddress.postalCode,
        addressState.newAddress.email,
        addressState.newAddress.phone,
      ];
      if (required.some((field) => !field?.trim())) {
        toast.error("Please complete all required delivery details.");
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (paymentMethod === "razorpay" && (razorpayLoadError || !Razorpay)) {
        toast.error("Unable to load Razorpay payment gateway. Please check your connection or refresh the page.");
        setSubmitting(false);
        return;
      }

      const itemsPayload = cart.map((i) => ({
        id: i.product.id,
        quantity: i.quantity,
        selectedColor: i.selectedColor || undefined,
        selectedSize: i.selectedSize || undefined,
      }));

      const orderPayload: CreateOrderPayload = {
        items: itemsPayload,
        ...buildCheckoutOrderAddressPayload(addressState),
        couponCode: appliedPromo.trim() || undefined,
        shippingSpeed,
        paymentMethod: paymentMethod.toUpperCase(),
      };

      const createdOrder = await placeOrderApi(orderPayload, token || undefined);

      if (paymentMethod === "razorpay" && createdOrder.razorpay) {
        const cleanPrefill: Record<string, string> = {};
        if (createdOrder.razorpay.prefill?.name?.trim()) cleanPrefill.name = createdOrder.razorpay.prefill.name.trim();
        if (createdOrder.razorpay.prefill?.email?.trim()) cleanPrefill.email = createdOrder.razorpay.prefill.email.trim();
        if (createdOrder.razorpay.prefill?.contact?.trim()) {
          const digits = createdOrder.razorpay.prefill.contact.replace(/\D/g, "");
          if (digits.length >= 10) cleanPrefill.contact = digits.slice(-10);
        }

        const origin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "https://frontend-beta-murex-33.vercel.app";

        const options = {
          key: createdOrder.razorpay.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: createdOrder.razorpay.amount,
          currency: (createdOrder.razorpay.currency || "INR") as any,
          name: createdOrder.razorpay.name || "AIRAVE",
          description: createdOrder.razorpay.description || `Order #${createdOrder.orderNumber}`,
          image: `${origin}/favicon/android-chrome-192x192.png`,
          order_id: createdOrder.razorpay.orderId,
          prefill: Object.keys(cleanPrefill).length > 0 ? cleanPrefill : undefined,
          theme: { color: "#000000" },
          handler: async function (response: any) {
            try {
              setSubmitting(true);
              await verifyPaymentApi(
                {
                  orderNumber: createdOrder.orderNumber,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                token || undefined
              );

              clearCart();
              toast.success("Payment verified! Your order is confirmed.");
              router.push(`/orders/${encodeURIComponent(createdOrder.orderNumber)}`);
            } catch (err: any) {
              toast.error(err.message || "Payment verification failed.");
              setSubmitError(
                err.message ||
                  "Verification failed. If your amount was debited, your order will confirm automatically shortly."
              );
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              toast.error("Payment window closed. You can retry payment anytime.");
            },
          },
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          toast.error(response?.error?.description || "Payment failed at gateway.");
          setSubmitError(
            response?.error?.description || "Payment failed. Please try again or use another payment method."
          );
          setSubmitting(false);
        });
        rzp.open();
      } else {
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/orders/${encodeURIComponent(createdOrder.orderNumber)}`);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Could not place order. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 py-4 sm:py-6 pb-16 text-black font-be-vietnam-pro gpu-layer">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4 sm:pb-6">
        <div>
          <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black uppercase text-black tracking-tight">
            CHECKOUT
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            256-bit SSL backend calculated checkout.
          </p>
        </div>

        <Link
          href="/cart"
          className="text-xs text-black hover:text-gray-600 flex items-center gap-1 font-bold shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Cart</span>
          <span className="sm:hidden">Cart</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <CheckoutEmptyCart />
      ) : (
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          {/* Left Columns: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {submitError && (
              <div className="flex items-center gap-2 p-3.5 text-xs font-semibold rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-4 shadow-2xs">
              <h3 className="font-be-vietnam-pro-black text-base sm:text-lg font-black text-black uppercase border-b border-gray-100 pb-3">
                1. Delivery Details
              </h3>

              <AddressCheckoutSection
                value={addressState}
                onChange={setAddressState}
                onAddressesLoaded={setSavedAddresses}
              />
            </div>

            {/* Step 2: Shipping Speed Option */}
            <CheckoutShippingSpeed
              shippingSpeed={shippingSpeed}
              onChange={setShippingSpeed}
              subtotal={subtotal}
            />

            {/* Step 3: Payment Method */}
            <CheckoutPaymentMethod
              paymentMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Right Columns: Order Review & Submission */}
          <div className="lg:col-span-5 space-y-6">
            <CheckoutOrderSummary
              cart={cart}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={handleApplyPromo}
              summary={summary}
              summaryLoading={summaryLoading}
              submitting={submitting}
              subtotal={subtotal}
              discountAmount={discountAmount}
              shippingAmount={shippingAmount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
            />
          </div>
        </form>
      )}
    </div>
  );
}
