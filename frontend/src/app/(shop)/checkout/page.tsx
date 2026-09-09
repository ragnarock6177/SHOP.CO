"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  ShoppingBag,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckoutOrderItem } from "@/components/shop/CheckoutOrderItem";
import {
  AddressCheckoutSection,
  buildCheckoutOrderAddressPayload,
  getCheckoutSummaryLocation,
  type CheckoutAddressState,
} from "@/components/address/AddressCheckoutSection";
import { EMPTY_ADDRESS_FORM } from "@/types/address";
import type { UserAddress } from "@/types/address";
import { getCartItemsMissingSelection } from "@/lib/productVariants";
import { toast } from "sonner";
import {
  getCheckoutSummaryApi,
  placeOrderApi,
  CheckoutSummaryData,
  CreateOrderPayload,
} from "@/lib/orderApi";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "applepay" | "cod"
  >("card");
  const [shippingSpeed, setShippingSpeed] = useState<"STANDARD" | "EXPRESS">(
    "STANDARD"
  );

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");

  // Payment form state
  const [formData, setFormData] = useState({
    cardNumber: "4242 8819 9021 4242",
    expDate: "08/28",
    cvv: "921",
  });

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

  // Server calculation states
  const [summary, setSummary] = useState<CheckoutSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const summaryLocation = React.useMemo(
    () => getCheckoutSummaryLocation(addressState, savedAddresses),
    [addressState, savedAddresses],
  );

  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
    }
  }, [cart.length, router]);

  // Fetch backend calculation summary whenever cart, speed, applied promo, or address changes
  useEffect(() => {
    if (!cart || cart.length === 0) {
      setSummary(null);
      return;
    }

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
      couponCode: appliedPromo.trim() || undefined,
      shippingSpeed,
      shippingAddress: summaryLocation,
    })
      .then((res) => {
        setSummary(res);
      })
      .catch((err: any) => {
        setSummaryError(err.message || "Failed to calculate order totals.");
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, [cart, shippingSpeed, appliedPromo, summaryLocation]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setAppliedPromo(promoCode.trim());
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

      // Clear local cart and redirect to live Order Details page
      clearCart();
      router.push(`/orders/${encodeURIComponent(createdOrder.orderNumber)}`);
    } catch (err: any) {
      setSubmitError(err.message || "Could not place order. Please try again.");
      setSubmitting(false);
    }
  };

  const subtotal = summary?.subtotal ?? cart.reduce((tot, i) => tot + i.product.price * i.quantity, 0);
  const discountAmount = summary?.coupon?.applied ? summary.coupon.discountAmount : 0;
  const shippingAmount = summary?.shipping ? summary.shipping.amount : (subtotal > 1999 ? 0 : 99);
  const taxAmount = summary?.taxAmount ?? Math.round((subtotal - discountAmount) * 0.18 * 100) / 100;
  const totalAmount = summary?.totalAmount ?? Math.round((subtotal - discountAmount + shippingAmount + taxAmount) * 100) / 100;

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
        <div className="bg-[#F4F4F4] rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
          <h2 className="font-be-vietnam-pro-black text-lg font-bold text-black uppercase">
            Your Cart is Empty
          </h2>
          <Link
            href="/product"
            className="inline-block px-7 py-3 bg-black text-white font-extrabold text-xs uppercase rounded-full"
          >
            Browse Collections
          </Link>
        </div>
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
            <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-4 shadow-2xs">
              <h3 className="font-be-vietnam-pro-black text-base sm:text-lg font-black text-black uppercase border-b border-gray-100 pb-3">
                2. Shipping Option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShippingSpeed("STANDARD")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    shippingSpeed === "STANDARD"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <span className="font-bold text-xs block">
                    Standard Delivery
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5 font-medium">
                    3-5 Business Days
                  </span>
                  <span className="font-black text-xs block mt-1.5">
                    {subtotal >= 1999 ? "FREE" : "₹99"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingSpeed("EXPRESS")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    shippingSpeed === "EXPRESS"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <span className="font-bold text-xs block">
                    Express Priority
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5 font-medium">
                    1-2 Business Days
                  </span>
                  <span className="font-black text-xs block mt-1.5">
                    {subtotal >= 1999 ? "₹150" : "₹249"}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-4 shadow-2xs">
              <h3 className="font-be-vietnam-pro-black text-base sm:text-lg font-black text-black uppercase border-b border-gray-100 pb-3">
                3. Payment Method
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "paypal"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <span className="font-black text-xs block">PayPal</span>
                  <span className="text-[10px] opacity-80 block">Express</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "applepay"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <span className="font-black text-xs block"> Pay</span>
                  <span className="text-[10px] opacity-80 block">1-Tap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
                  }`}
                >
                  <Truck className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-bold block">
                    Pay on Delivery
                  </span>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      required
                      className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs text-black font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={formData.expDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expDate: e.target.value })
                        }
                        required
                        className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs text-black font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        required
                        className="w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs text-black font-mono focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Columns: Order Review & Submission */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <h3 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black text-black uppercase tracking-tight">
                  Order Review ({cart.length})
                </h3>
                {summaryLoading && (
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                )}
              </div>

              {/* Items Preview List */}
              <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <CheckoutOrderItem
                    key={`${item.product.id}-${item.selectedColor || ""}-${item.selectedSize || ""}-${idx}`}
                    item={item}
                  />
                ))}
              </div>

              {/* Promo Code Box */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (SUMMER2026)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-[#F4F4F4] rounded-full pl-9 pr-3 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none uppercase font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleApplyPromo(e)}
                    className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {summary?.coupon && (
                  <p
                    className={`text-[11px] font-semibold pt-1 ${
                      summary.coupon.applied ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {summary.coupon.message}
                  </p>
                )}
              </div>

              {/* Server Calculated Breakdown */}
              <div className="space-y-2 text-xs text-gray-500 font-medium border-t border-gray-100 pt-3.5">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-black">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-black">
                    {shippingAmount === 0 ? (
                      <span className="text-emerald-700 font-extrabold">FREE</span>
                    ) : (
                      `₹${shippingAmount.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST Tax (18%)</span>
                  <span className="font-bold text-black">
                    ₹{taxAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-black pt-2.5 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || summaryLoading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order (₹{totalAmount.toLocaleString()})</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Verified 256-bit SSL Security</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
