"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Truck,
  ShoppingBag,
  Tag,
  Download,
  Package,
} from "lucide-react";
import { useCart, OrderRecord } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, addOrder } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "applepay" | "cod"
  >("card");
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "express">(
    "standard",
  );
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] =
    useState<OrderRecord | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Shipping form state
  const [formData, setFormData] = useState({
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    cardNumber: "4242 8819 9021 4242",
    expDate: "08/28",
    cvv: "921",
  });

  const baseShippingCost = cartSubtotal > 150 || cart.length === 0 ? 0 : 15;
  const shippingCost =
    shippingSpeed === "express" ? baseShippingCost + 25 : baseShippingCost;
  const discountAmount = Math.round(cartSubtotal * promoDiscount * 100) / 100;
  const estimatedTax =
    Math.round((cartSubtotal - discountAmount) * 0.08 * 100) / 100;
  const grandTotal =
    Math.round(
      (cartSubtotal - discountAmount + shippingCost + estimatedTax) * 100,
    ) / 100;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      promoCode.trim().toUpperCase() === "SUMMER2026" ||
      promoCode.trim().toUpperCase() === "LUMINA30"
    ) {
      setPromoDiscount(0.15); // 15% discount
      setPromoMessage("15% discount applied successfully!");
    } else {
      setPromoMessage("Invalid promo code. Use SUMMER2026");
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNum = `TRK${Math.floor(10000000 + Math.random() * 90000000)}`;
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const newOrderRecord: OrderRecord = {
      id: orderRef,
      date: currentDate,
      status: "Processing",
      statusColor: "bg-[#FFC633]/20 text-yellow-800",
      total: grandTotal,
      trackingNum,
      items: cart.map((i) => ({
        title: i.product.title,
        price: i.product.price,
        color: i.selectedColor || "Standard",
        size: i.selectedSize || "Medium",
        quantity: i.quantity,
        image: i.product.image,
      })),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
      paymentMethod:
        paymentMethod === "card"
          ? `Credit Card (•••• ${formData.cardNumber.slice(-4)})`
          : paymentMethod === "paypal"
            ? "PayPal Express"
            : paymentMethod === "applepay"
              ? "Apple Pay 1-Tap"
              : "Pay on Delivery (COD)",
    };

    addOrder(newOrderRecord);
    setPlacedOrderDetails(newOrderRecord);
    setIsOrderPlaced(true);
    clearCart();
  };

  // Order Confirmation Screen
  if (isOrderPlaced && placedOrderDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center space-y-8 text-black">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="font-be-vietnam-pro-black text-3xl sm:text-4xl font-black uppercase text-black">
            ORDER CONFIRMED!
          </h1>
          <p className="text-sm text-gray-600">
            Thank you for shopping with AIRAVÉ! We've received your order and
            sent a confirmation to{" "}
            <strong className="text-black">{formData.email}</strong>.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs text-gray-400 block uppercase">
                Order Reference
              </span>
              <span className="font-extrabold text-base text-black">
                {placedOrderDetails.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block uppercase">
                Tracking Number
              </span>
              <span className="font-mono font-bold text-xs text-black">
                {placedOrderDetails.trackingNum}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-xs text-gray-500 uppercase">
              Items Ordered
            </h4>
            {placedOrderDetails.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <div className="w-12 h-12 bg-[#F0EEED] rounded-xl overflow-hidden relative shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-black line-clamp-1">
                    {item.title}
                  </h5>
                  <p className="text-gray-400 text-[11px]">
                    Qty: {item.quantity} &bull; Size: {item.size} &bull; Color:{" "}
                    {item.color}
                  </p>
                </div>
                <span className="font-bold text-black">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* Summary Breakdown */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-bold text-black text-right">
                {placedOrderDetails.shippingAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold text-black">
                {placedOrderDetails.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-100">
              <span>Total Paid Amount:</span>
              <span>${placedOrderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/profile"
            className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order in Profile</span>
          </Link>
          <button
            onClick={() =>
              alert(`Invoice generated for ${placedOrderDetails.id}`)
            }
            className="w-full sm:w-auto px-8 py-3.5 bg-[#F0F0F0] hover:bg-gray-200 text-black font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Invoice</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 pb-16 text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black uppercase text-black">
            CHECKOUT
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete your order with secure SSL checkout.
          </p>
        </div>

        <Link
          href="/cart"
          className="text-xs text-black hover:text-gray-600 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-[#F0F0F0] rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
          <h2 className="font-be-vietnam-pro-black text-lg font-bold text-black">
            Your Cart is Empty
          </h2>
          <Link
            href="/product"
            className="inline-block px-8 py-3.5 bg-black text-white font-bold text-xs rounded-full"
          >
            Browse Clothes
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left 7 Columns: Form Fields (Shipping & Payment) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-be-vietnam-pro-black text-lg font-black text-black uppercase border-b border-gray-200 pb-3">
                1. Delivery Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                    required
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method Selection */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-be-vietnam-pro-black text-lg font-black text-black uppercase border-b border-gray-200 pb-3">
                2. Shipping Option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingSpeed("standard")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    shippingSpeed === "standard"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <span className="font-bold text-xs block">
                    Standard Delivery
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    3-5 Business Days
                  </span>
                  <span className="font-extrabold text-xs block mt-2">
                    {baseShippingCost === 0
                      ? "FREE"
                      : `$${baseShippingCost.toFixed(2)}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingSpeed("express")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    shippingSpeed === "express"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <span className="font-bold text-xs block">
                    Express Priority Courier
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    1-2 Business Days
                  </span>
                  <span className="font-extrabold text-xs block mt-2">
                    ${(baseShippingCost + 25).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-be-vietnam-pro-black text-lg font-black text-black uppercase border-b border-gray-200 pb-3">
                3. Payment Method
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === "card"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === "paypal"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <span className="font-extrabold text-sm block">PayPal</span>
                  <span className="text-[10px] opacity-80 block">Express</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === "applepay"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <span className="font-extrabold text-sm block"> Pay</span>
                  <span className="text-[10px] opacity-80 block">1-Tap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === "cod"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-[#F0F0F0] text-black"
                  }`}
                >
                  <Truck className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">
                    Pay on Delivery
                  </span>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      required
                      className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={formData.expDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expDate: e.target.value })
                        }
                        required
                        className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        required
                        className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs text-black font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Order Summary Breakdown & Dynamic Submission */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-be-vietnam-pro-black text-xl font-black text-black border-b border-gray-200 pb-4 uppercase">
                Order Review ({cart.length})
              </h3>

              {/* Items Preview List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center text-xs">
                    <div className="w-12 h-12 bg-[#F0EEED] rounded-xl overflow-hidden relative shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-black line-clamp-1">
                        {item.product.title}
                      </h5>
                      <p className="text-gray-500 text-[11px]">
                        Qty: {item.quantity} &bull; {item.selectedSize || "M"}{" "}
                        &bull; {item.selectedColor || "Standard"}
                      </p>
                    </div>
                    <span className="font-extrabold text-black">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (SUMMER2026)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-[#F0F0F0] rounded-full pl-10 pr-4 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleApplyPromo(e)}
                    className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-xs font-semibold pt-1 ${promoDiscount > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-black">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount (15%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-black">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-black">
                    ${estimatedTax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-black pt-3 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-xs uppercase transition-all shadow-md active:scale-95"
              >
                Place Order (${grandTotal.toFixed(2)})
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>256-bit SSL Encrypted Guarantee</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
