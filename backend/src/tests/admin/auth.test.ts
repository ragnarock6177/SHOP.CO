import { AdminUsersService } from "../../services/admin/adminUsers.service.js";

export function verifyAdminAuthContract() {
  if (typeof AdminUsersService.getAdminUsers !== "function") {
    throw new Error("AdminUsersService.getAdminUsers is not defined");
  }
}
