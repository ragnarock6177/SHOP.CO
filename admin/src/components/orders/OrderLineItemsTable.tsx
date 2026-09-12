"use client";

import React from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { OrderDetail } from "@/hooks/queries/useOrders";
import { formatINR } from "@/lib/orders/format";

interface OrderLineItemsTableProps {
  items: OrderDetail["items"];
}

export function OrderLineItemsTable({ items }: OrderLineItemsTableProps) {
  if (!items?.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center text-xs text-slate-500">
        No line items found for this order.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3.5">Product</th>
            <th className="hidden px-5 py-3.5 sm:table-cell">Variant</th>
            <th className="px-5 py-3.5 text-center">Qty</th>
            <th className="hidden px-5 py-3.5 text-right md:table-cell">Unit Price</th>
            <th className="px-5 py-3.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{item.productName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-500">SKU: {item.sku}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">
                {item.variantName || "—"}
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                  {item.quantity}
                </span>
              </td>
              <td className="hidden px-5 py-4 text-right text-slate-700 md:table-cell">
                {formatINR(item.unitPrice)}
              </td>
              <td className="px-5 py-4 text-right font-bold text-slate-900">
                {formatINR(item.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
