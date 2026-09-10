export function formatINR(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatOrderDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatOrderDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatOrderDate(value);
}

export function getCustomerInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
  }
  return (email?.[0] || "?").toUpperCase();
}

export interface OrderAddressView {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string | null;
}

export function formatAddressLines(address?: OrderAddressView | null): string[] {
  if (!address) return [];
  const lines: string[] = [];
  if (address.fullName) lines.push(address.fullName);
  if (address.addressLine1) lines.push(address.addressLine1);
  if (address.addressLine2) lines.push(address.addressLine2);
  if (address.landmark) lines.push(`Landmark: ${address.landmark}`);
  if (address.city || address.state || address.postalCode) {
    lines.push(
      [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    );
  }
  if (address.countryCode) lines.push(address.countryCode);
  if (address.phone) lines.push(`Phone: ${address.phone}`);
  return lines;
}
