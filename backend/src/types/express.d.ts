import { SanitizedUser } from "./auth.types.js";
import { UserStatus } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string | null;
  firebaseUid?: string | null;
  status: UserStatus;
  roles: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser | AuthUser;
      guestToken?: string;
    }
  }
}
