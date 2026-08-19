"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link.js";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useCustomerDetails, useUpdateCustomerStatus } from "../../../../hooks/queries/useCustomers";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../../components/rbac/PermissionGate";

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
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center text-xs text-red-300">
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
            className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{getDisplayName()}</h1>
            <p className="text-xs text-zinc-400">Customer Account Details & Saved Address Book</p>
          </div>
        </div>

        <PermissionGate permission="customers:update">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-zinc-400">Set Account Status:</span>
            <select
              value={customer.status}
              onChange={(e) => handleStatusShift(e.target.value as any)}
              disabled={statusMutation.isPending}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none disabled:opacity-50"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </PermissionGate>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-zinc-100">{getDisplayName()}</span>
              <StatusBadge status={customer.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center">
                <Mail className="mr-1.5 h-3.5 w-3.5 text-zinc-500" /> {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center">
                  <Phone className="mr-1.5 h-3.5 w-3.5 text-zinc-500" /> {customer.phone}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase text-zinc-500 font-semibold">Registered Since</span>
            <span className="text-xs font-medium text-zinc-300">{new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Saved Address Book */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Saved Address Book</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {customer.addresses?.length ? (
            customer.addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs space-y-1 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 uppercase tracking-wide">{addr.type}</span>
                  {addr.isDefaultShipping && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">DEFAULT</span>
                  )}
                </div>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-zinc-500">{addr.country}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500 col-span-2 py-4 text-center">No saved addresses on profile.</p>
          )}
        </div>
      </div>

      {/* Recent Customer Orders */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShoppingBag className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Order History</h2>
        </div>
        <div className="divide-y divide-zinc-800/60 text-xs">
          {customer.recentOrders?.length ? (
            customer.recentOrders.map((ord) => (
              <div key={ord.id} className="flex items-center justify-between py-3">
                <Link href={`/orders/${ord.id}`} className="font-semibold text-zinc-200 hover:underline">
                  #{ord.orderNumber}
                </Link>
                <span className="font-semibold text-zinc-100">₹{ord.totalAmount}</span>
                <StatusBadge status={ord.status} />
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500 py-4 text-center">No order history recorded for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
}
