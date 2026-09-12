"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AddressForm } from "@/components/address/AddressForm";
import {
  addUserAddressApi,
  deleteUserAddressApi,
  getUserAddressesApi,
  updateUserAddressApi,
} from "@/lib/addressApi";
import {
  EMPTY_ADDRESS_FORM,
  getAddressFullName,
  getAddressSummary,
  userAddressToFormValues,
  type AddressFormValues,
  type UserAddress,
} from "@/types/address";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

function buildEmptyForm(authUser: ReturnType<typeof useAuth>["user"], isFirst: boolean): AddressFormValues {
  return {
    ...EMPTY_ADDRESS_FORM,
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    phone: authUser?.phone || authUser?.phoneNumber || "",
    isDefault: isFirst,
  };
}

export function ProfileAddressesPanel({
  onAddressesChange,
}: {
  onAddressesChange?: (addresses: UserAddress[]) => void;
}) {
  const { user: authUser, token } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formValues, setFormValues] = useState<AddressFormValues>(buildEmptyForm(authUser, true));

  const loadAddresses = async () => {
    if (!token) {
      setAddresses([]);
      setLoading(false);
      onAddressesChange?.([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserAddressesApi(token);
      setAddresses(data);
      onAddressesChange?.(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const editingAddress = useMemo(
    () => addresses.find((item) => item.id === editingId) || null,
    [addresses, editingId],
  );

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setFormValues(buildEmptyForm(authUser, addresses.length === 0));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormValues(buildEmptyForm(authUser, addresses.length === 0));
    setIsFormVisible(true);
    requestAnimationFrame(() => {
      document.getElementById("profile-address-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startEdit = (address: UserAddress) => {
    setEditingId(address.id);
    setFormValues(userAddressToFormValues(address, authUser?.email || ""));
    setIsFormVisible(true);
    requestAnimationFrame(() => {
      document.getElementById("profile-address-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to save addresses.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateUserAddressApi(token, editingId, formValues);
        toast.success("Address updated.");
      } else {
        await addUserAddressApi(token, {
          ...formValues,
          isDefault: addresses.length === 0 || formValues.isDefault,
        });
        toast.success("Address saved.");
      }
      closeForm();
      await loadAddresses();
    } catch (error: any) {
      toast.error(error.message || "Could not save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUserAddressApi(token, deleteTarget.id);
      toast.success("Address removed.");
      if (editingId === deleteTarget.id) closeForm();
      setDeleteTarget(null);
      await loadAddresses();
    } catch (error: any) {
      toast.error(error.message || "Could not delete address.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black uppercase text-black">
            Saved Addresses
          </h2>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            All addresses are saved to your account. Tap Edit to update or use Add Address for a new one.
          </p>
        </div>

        {!isFormVisible && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] transition-all hover:bg-black"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Address
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-neutral-100 bg-white py-14 text-neutral-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wide">Loading</span>
        </div>
      ) : addresses.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-2xs divide-y divide-neutral-100">
          {addresses.map((address) => {
            const isEditing = isFormVisible && editingId === address.id;
            return (
              <div
                key={address.id}
                className={cn(
                  "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 transition-colors",
                  isEditing && "bg-neutral-50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                      {address.label || "Home"}
                    </span>
                    {address.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                        Default
                      </span>
                    )}
                    {isEditing && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-950">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-black">{getAddressFullName(address)}</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-neutral-600">
                    {getAddressSummary(address)}
                  </p>
                  {address.phone && (
                    <p className="mt-1 text-xs font-semibold text-neutral-700">{address.phone}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:border-neutral-950 hover:text-black"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(address)}
                    className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-red-500 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isFormVisible && (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-5 py-8 text-center">
            <MapPin className="mx-auto h-5 w-5 text-neutral-400" />
            <p className="mt-2 text-sm font-bold text-black">No saved address yet</p>
            <p className="mt-1 text-xs text-neutral-500">
              Your first address will automatically become your default delivery address.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-black transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>
        )
      )}

      {isFormVisible && (
        <div
          id="profile-address-form"
          className="rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-2xs sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-400">
                {editingAddress ? "Update address" : "New address"}
              </p>
              <h3 className="mt-1 font-be-vietnam-pro-black text-base font-black uppercase text-black">
                {editingAddress
                  ? `Edit ${editingAddress.label || "Home"}`
                  : addresses.length === 0
                    ? "Add your address"
                    : "Add another address"}
              </h3>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AddressForm
              values={formValues}
              onChange={setFormValues}
              showDefaultToggle={!!editingId}
              variant="premium"
              idPrefix="profile-address"
            />

            {!editingId && addresses.length === 0 && (
              <p className="text-[11px] font-medium leading-relaxed text-neutral-500">
                This will be saved as your default delivery address.
              </p>
            )}

            <div className="flex flex-col-reverse gap-2.5 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-neutral-200 px-6 py-3 text-xs font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save changes" : "Save address"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this address?"
        description={
          deleteTarget
            ? `Are you sure you want to remove your ${deleteTarget.label || "Home"} address? This action cannot be undone.`
            : ""
        }
        confirmLabel="Yes, delete"
        cancelLabel="Keep address"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
