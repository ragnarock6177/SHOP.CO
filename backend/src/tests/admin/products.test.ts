import { AdminProductsService } from "../../services/admin/products.service.js";

export function verifyProductsContract() {
  if (typeof AdminProductsService.getProducts !== "function") {
    throw new Error("AdminProductsService.getProducts is not defined");
  }
}
