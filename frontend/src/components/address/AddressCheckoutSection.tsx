"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getUserAddressesApi,
  updateUserAddressApi,
} from "@/lib/addressApi";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressForm } from "@/components/address/AddressForm";
import {
  EMPTY_ADDRESS_FORM,
  formValuesToAddressPayload,
  userAddressToFormValues,
  type AddressFormValues,
  type UserAddress,
} from "@/types/address";

export type CheckoutAddressMode = "saved" | "new" | "edit";

export interface CheckoutAddressState {
  mode: CheckoutAddressMode;
  selectedAddressId: string | null;
  editingAddressId: string | null;
  newAddress: AddressFormValues;
}

interface AddressCheckoutSectionProps {
  value: CheckoutAddressState;
  onChange: (value: CheckoutAddressState) => void;
  onAddressesLoaded?: (addresses: UserAddress[]) => void;
}

function buildNewAddressForm(
  user: ReturnType<typeof useAuth>["user"],
  isFirst: boolean,
): AddressFormValues {
  return {
    ...EMPTY_ADDRESS_FORM,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || "",
    isDefault: isFirst,
  };
}

export function AddressCheckoutSection({ value, onChange, onAddressesLoaded }: AddressCheckoutSectionProps) {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const reloadAddresses = async () => {
    if (!token) {
      setAddresses([]);
      return [];
    }
    const data = await getUserAddressesApi(token);
    setAddresses(data);
    onAddressesLoaded?.(data);
    return data;
  };

  useEffect(() => {
    if (!token) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    reloadAddresses()
      .then((data) => {
        const defaultAddress = data.find((item) => item.isDefault) || data[0];

        if (defaultAddress && value.mode === "saved" && !value.selectedAddressId) {
          onChange({
            ...value,
            mode: "saved",
            selectedAddressId: defaultAddress.id,
            editingAddressId: null,
          });
        } else if (data.length === 0) {
          onChange({
            ...value,
            mode: "new",
            selectedAddressId: null,
            editingAddressId: null,
            newAddress: buildNewAddressForm(user, true),
          });
        }
      })
      .catch((err: Error) => {
        toast.error(err.message || "Could not load saved addresses.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === value.selectedAddressId) || null,
    [addresses, value.selectedAddressId],
  );

  const editingAddress = useMemo(
    () => addresses.find((item) => item.id === value.editingAddressId) || null,
    [addresses, value.editingAddressId],
  );

  const patch = (partial: Partial<CheckoutAddressState>) => onChange({ ...value, ...partial });

  const scrollToAddressForm = () => {
    requestAnimationFrame(() => {
      document.getElementById("checkout-address-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    if (loading) return;
    if (value.mode === "new" || value.mode === "edit") {
      scrollToAddressForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, value.mode, value.editingAddressId]);

  const closePanel = () => {
    const fallback = addresses.find((item) => item.isDefault) || addresses[0];
    patch({
      mode: "saved",
      editingAddressId: null,
      selectedAddressId: fallback?.id || null,
      newAddress: buildNewAddressForm(user, addresses.length === 0),
    });
  };

  const openNewAddress = () => {
    patch({
      mode: "new",
      selectedAddressId: null,
      editingAddressId: null,
      newAddress: buildNewAddressForm(user, addresses.length === 0),
    });
  };

  const openEditAddress = (address: UserAddress) => {
    patch({
      mode: "edit",
      editingAddressId: address.id,
      selectedAddressId: address.id,
      newAddress: userAddressToFormValues(address, user?.email || ""),
    });
  };

  const handleSaveEdit = async () => {
    if (!token || !value.editingAddressId) return;

    setSavingEdit(true);
    try {
      await updateUserAddressApi(token, value.editingAddressId, value.newAddress);
      toast.success("Address updated.");
      await reloadAddresses();
      patch({
        mode: "saved",
        editingAddressId: null,
        selectedAddressId: value.editingAddressId,
      });
    } catch (error: any) {
      toast.error(error.message || "Could not update address.");
    } finally {
      setSavingEdit(false);
    }
  };

  const showFormPanel = value.mode === "new" || value.mode === "edit" || addresses.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wide">Loading your addresses</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
              Saved Addresses
            </p>
            {value.mode === "saved" && (
              <button
                type="button"
                onClick={openNewAddress}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-neutral-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                selectable
                selected={value.mode !== "new" && value.selectedAddressId === address.id}
                onSelect={() =>
                  patch({
                    mode: "saved",
                    selectedAddressId: address.id,
                    editingAddressId: null,
                  })
                }
                onEdit={() => openEditAddress(address)}
              />
            ))}
          </div>
        </div>
      )}

      {showFormPanel && (
        <div
          id="checkout-address-form"
          className="scroll-mt-24 space-y-4 rounded-[24px] border border-neutral-200 bg-white p-4 shadow-2xs sm:p-5"
        >
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
            <div className="flex items-start gap-2.5 min-w-0">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-400">
                  {value.mode === "edit" ? "Update delivery" : "New delivery"}
                </p>
                <p className="mt-0.5 text-sm font-bold text-black">
                  {value.mode === "edit"
                    ? `Edit ${editingAddress?.label || "address"}`
                    : addresses.length === 0
                      ? "Add your delivery address"
                      : "Deliver to a new address"}
                </p>
              </div>
            </div>

            {addresses.length > 0 && value.mode !== "saved" && (
              <button
                type="button"
                onClick={closePanel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <AddressForm
            values={value.newAddress}
            onChange={(newAddress) => patch({ newAddress })}
            showEmail
            showDefaultToggle={value.mode === "edit"}
            idPrefix="checkout-address"
            variant="premium"
          />

          {value.mode === "edit" ? (
            <div className="flex flex-col-reverse gap-2.5 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePanel}
                className="rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-black transition-colors disabled:opacity-60"
              >
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
            </div>
          ) : (
            <p className="text-[11px] font-medium leading-relaxed text-neutral-500">
              {addresses.length === 0
                ? "Your first address will be saved as default for future orders."
                : "This address will be saved to your account when you place the order."}
            </p>
          )}
        </div>
      )}

      {value.mode === "saved" && selectedAddress && !showFormPanel && (
        <p className="text-[11px] font-medium text-neutral-500">
          Delivering to your saved {selectedAddress.label?.toLowerCase() || "home"} address.
        </p>
      )}
    </div>
  );
}

export function buildCheckoutOrderAddressPayload(state: CheckoutAddressState) {
  if (state.mode === "saved" && state.selectedAddressId) {
    return { shippingAddressId: state.selectedAddressId };
  }

  if (state.mode === "edit" && state.editingAddressId) {
    return { shippingAddressId: state.editingAddressId };
  }

  const payload = formValuesToAddressPayload({
    ...state.newAddress,
    isDefault: state.newAddress.isDefault,
  });

  return {
    shippingAddress: {
      ...payload,
      email: state.newAddress.email.trim() || undefined,
    },
    saveShippingAddress: true,
  };
}

export function getCheckoutSummaryLocation(state: CheckoutAddressState, addresses: UserAddress[]) {
  if ((state.mode === "saved" || state.mode === "edit") && state.selectedAddressId) {
    const selected = addresses.find((item) => item.id === state.selectedAddressId);
    if (selected) {
      return {
        postalCode: selected.postalCode,
        state: selected.state,
        city: selected.city,
        countryCode: selected.countryCode || "IN",
      };
    }
  }

  return {
    postalCode: state.newAddress.postalCode,
    state: state.newAddress.state,
    city: state.newAddress.city,
    countryCode: state.newAddress.countryCode || "IN",
  };
}
