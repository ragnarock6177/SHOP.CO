export const LOW_STOCK_THRESHOLD = 5;

const ACTIVE_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "PARTIALLY_CANCELLED",
]);

const COMPLETED_STATUSES = new Set(["DELIVERED", "CANCELLED", "REFUNDED", "FAILED"]);

export function isActiveOrderStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status.toUpperCase());
}

export function isCompletedOrderStatus(status: string): boolean {
  return COMPLETED_STATUSES.has(status.toUpperCase());
}

export function formatOrderStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getOrderStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "CANCELLED":
    case "FAILED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "REFUNDED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-neutral-100 text-black border-neutral-200";
  }
}

export function getOrderItemImage(item: {
  image?: string;
  variant?: { product?: { images?: { imageUrl?: string }[] } };
}): string {
  return (
    item.image ||
    item.variant?.product?.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"
  );
}

export function parseVariantParts(variantName?: string | null): { color?: string; size?: string } {
  if (!variantName) return {};
  const parts = variantName.split("/").map((part) => part.trim());
  if (parts.length >= 2) {
    return { color: parts[0], size: parts[1] };
  }
  return { size: parts[0] };
}
