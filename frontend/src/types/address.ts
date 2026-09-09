export type AddressLabel = "Home" | "Work" | "Other";

export interface UserAddress {
  id: string;
  userId: string;
  type: "SHIPPING" | "BILLING";
  label: AddressLabel | string;
  firstName: string;
  lastName?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phone?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormValues {
  label: AddressLabel;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
}

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  label: "Home",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "IN",
  isDefault: false,
};

export function getAddressFullName(address: Pick<UserAddress, "firstName" | "lastName">): string {
  return [address.firstName, address.lastName].filter(Boolean).join(" ");
}

export function getAddressSummary(address: UserAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ].filter(Boolean);
  return parts.join(", ");
}

export function userAddressToFormValues(
  address: UserAddress,
  email = "",
): AddressFormValues {
  return {
    label: (address.label as AddressLabel) || "Home",
    firstName: address.firstName,
    lastName: address.lastName || "",
    phone: address.phone || "",
    email,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    landmark: address.landmark || "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    countryCode: address.countryCode || "IN",
    isDefault: address.isDefault,
  };
}

export function formValuesToAddressPayload(values: AddressFormValues) {
  return {
    label: values.label,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim() || undefined,
    phone: values.phone.trim() || undefined,
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2.trim() || undefined,
    landmark: values.landmark.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    countryCode: values.countryCode || "IN",
    isDefault: values.isDefault,
  };
}
