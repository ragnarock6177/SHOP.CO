import { AdminInventoryService } from "../../services/admin/inventory.service.js";

export function verifyInventoryContract() {
  if (typeof AdminInventoryService.getInventory !== "function") {
    throw new Error("AdminInventoryService.getInventory is not defined");
  }
}
