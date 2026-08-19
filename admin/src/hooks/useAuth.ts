import { useAuthContext } from "../providers/AuthProvider";

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
