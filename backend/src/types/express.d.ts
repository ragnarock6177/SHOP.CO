import { SanitizedUser } from "./auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser;
    }
  }
}
