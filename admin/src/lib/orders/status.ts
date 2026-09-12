import { OrderStatus } from "@/hooks/queries/useOrders";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
  FAILED: "Failed",
};

export const ORDER_STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirm order",
  PROCESSING: "Start processing",
  SHIPPED: "Mark as shipped",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel order",
  REFUNDED: "Mark as refunded",
  PARTIALLY_REFUNDED: "Partial refund",
};

export function getAllowedOrderTransitions(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PROCESSING", "CANCELLED"];
    case "PROCESSING":
      return ["SHIPPED", "CANCELLED"];
    case "SHIPPED":
      return ["DELIVERED"];
    case "DELIVERED":
    case "CANCELLED":
    case "REFUNDED":
    default:
      return [];
  }
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status.replace(/_/g, " ");
}

export function getOrderStatusActionLabel(status: OrderStatus): string {
  return (
    ORDER_STATUS_ACTION_LABELS[status] || `Mark as ${getOrderStatusLabel(status)}`
  );
}

export function getOrderStatusStepIndex(status: OrderStatus): number {
  if (status === "CANCELLED" || status === "REFUNDED" || status === "FAILED") {
    return -1;
  }
  const idx = ORDER_STATUS_FLOW.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function getPrimaryOrderTransition(current: OrderStatus): OrderStatus | null {
  const allowed = getAllowedOrderTransitions(current);
  return allowed.find((status) => status !== "CANCELLED") ?? null;
}

export function getOrderStatusUpdateHint(current: OrderStatus): string {
  switch (current) {
    case "PENDING":
      return "New orders start as Pending. Confirm the order before processing.";
    case "CONFIRMED":
      return "Order is confirmed. Start processing when you begin fulfillment.";
    case "PROCESSING":
      return "Order is being prepared. Mark as shipped once dispatched.";
    case "SHIPPED":
      return "Order is on the way. Mark as delivered after customer receipt.";
    case "DELIVERED":
      return "Order fulfilled. No further fulfillment updates are required.";
    case "CANCELLED":
      return "This order was cancelled and cannot move forward.";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "Refund recorded. Fulfillment updates are closed for this order.";
    case "FAILED":
      return "Payment or placement failed. This order cannot be fulfilled.";
    default:
      return "Choose the next fulfillment step below.";
  }
}
