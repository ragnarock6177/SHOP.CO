import { AdminOrdersService } from "../../services/admin/orders.service.js";

export function verifyOrdersContract() {
  if (typeof AdminOrdersService.getOrders !== "function") {
    throw new Error("AdminOrdersService.getOrders is not defined");
  }
}
