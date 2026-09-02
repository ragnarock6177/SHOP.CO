"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link.js";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useCustomerDetails, useUpdateCustomerStatus } from "../../../../hooks/queries/useCustomers";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const { data: customer, isLoading, error } = useCustomerDetails(customerId);
  const statusMutation = useUpdateCustomerStatus();

  const handleStatusShift = (newStatus: "ACTIVE" | "SUSPENDED" | "BLOCKED") => {
    statusMutation.mutate({ id: customerId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 rounded-md animate-shimmer bg-slate-100" />
              <div className="h-3 w-36 rounded-md animate-shimmer bg-slate-100" />
            </div>
          </div>
          <div className="h-6 w-24 rounded-md animate-shimmer bg-slate-100" />
        </div>

        {/* Profile Card & Details Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md animate-shimmer bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100" />
                <div className="h-3 w-40 rounded-md animate-shimmer bg-slate-100" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="h-3.5 w-full rounded-md animate-shimmer bg-slate-100" />
              <div className="h-3.5 w-3/4 rounded-md animate-shimmer bg-slate-100" />
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 lg:col-span-2">
            <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100 border-b border-slate-100 pb-3" />
            <div className="space-y-3 pt-1">
              <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
              <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
              <div className="h-10 w-full rounded-md animate-shimmer bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs">
        Customer profile not found or error loading account.
      </div>
    );
  }

  const getDisplayName = () => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    }
    return "Registered Customer";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/customers")}
            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{getDisplayName()}</h1>
            <p className="text-xs text-slate-500">Customer Account Details & Saved Address Book</p>
          </div>
        </div>

        <PermissionGate permission="customers:update">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Set Account Status:</span>
            <CustomSelect
              value={customer.status}
              onChange={(val) => handleStatusShift(val as any)}
              disabled={statusMutation.isPending}
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "SUSPENDED", label: "SUSPENDED" },
                { value: "BLOCKED", label: "BLOCKED" },
              ]}
              triggerClassName="w-36"
            />
          </div>
        </PermissionGate>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-slate-900">{getDisplayName()}</span>
              <StatusBadge status={customer.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center">
                <Mail className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center">
                  <Phone className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> {customer.phone}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase text-slate-500 font-semibold">Registered Since</span>
            <span className="text-xs font-medium text-slate-700">{new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Saved Address Book */}
      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <MapPin className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Saved Address Book</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {customer.addresses?.length ? (
            customer.addresses.map((addr) => (
              <div key={addr.id} className="rounded-md border border-slate-200 bg-white p-4 text-xs space-y-1 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 uppercase tracking-wide">{addr.type}</span>
                  {addr.isDefaultShipping && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">DEFAULT</span>
                  )}
                </div>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-slate-500">{addr.country}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-2 py-4 text-center">No saved addresses on profile.</p>
          )}
        </div>
      </div>

      {/* Recent Customer Orders */}
      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ShoppingBag className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Order History</h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {customer.recentOrders?.length ? (
            customer.recentOrders.map((ord) => (
              <div key={ord.id} className="flex items-center justify-between py-3">
                <Link href={`/orders/${ord.id}`} className="font-semibold text-slate-800 hover:underline">
                  #{ord.orderNumber}
                </Link>
                <span className="font-semibold text-slate-900">₹{ord.totalAmount}</span>
                <StatusBadge status={ord.status} />
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No order history recorded for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
}
