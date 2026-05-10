"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, CreditCard, Globe2, ShoppingBag, Users } from "lucide-react";
import toast from "react-hot-toast";

import PhoneInput from "@/components/common/PhoneInput";
import { ReservationService } from "@/lib/orders/reservationService";
import { UserService } from "@/lib/users/userService";
import { setCheckoutInfo, updateCheckoutInfo } from "@/store/checkoutSlice";
import { RootState } from "@/store/store";
import { OrderCreateRequestDto } from "@/types/order";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const formatPrice = (value: number) => currencyFormatter.format(value);

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);
  const selectedItems = useSelector((state: RootState) =>
    state.cart.items.filter((item) => item.selected),
  );

  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await UserService.getProfile();

        if (user) {
          setPhone(user.phone || "");

          dispatch(
            setCheckoutInfo({
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              nationality: user.nationality || "",
            }),
          );
        }
      } catch (error: unknown) {
        console.warn("User not logged in or failed to fetch profile:", error);

        dispatch(
          setCheckoutInfo({
            name: "",
            email: "",
            phone: "",
            nationality: "",
          }),
        );
      }
    };

    loadUserProfile();
  }, [dispatch]);

  const participantCount = useMemo(
    () =>
      selectedItems.reduce((total, item) => total + item.participants, 0),
    [selectedItems],
  );

  const totalPrice = useMemo(
    () =>
      selectedItems.reduce((total, item) => {
        const isPublic = item.type === "PUBLIC";
        return total + (isPublic ? item.price * item.participants : item.price);
      }, 0),
    [selectedItems],
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setPhone(value);
      dispatch(updateCheckoutInfo({ phone: value }));
    },
    [dispatch],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const fullPhone = phone.trim();

    if (!checkout.name || !checkout.email || !fullPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!emailRegex.test(checkout.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      toast.loading("Reserving your order...");

      const request: OrderCreateRequestDto = {
        paymentMethod: "CARD",
        name: checkout.name.trim(),
        email: checkout.email.trim(),
        phone: fullPhone,
        nationality: checkout.nationality,
        items: selectedItems.map((item) => ({
          tourId: Number(item.id),
          scheduleId: item.scheduleId,
          participants: item.participants,
          scheduledAt: `${item.selectedDate}T${item.selectedTime}`,
          preferredLanguage: item.preferredLanguage,
          comment: item.comment,
        })),
      };

      const response = await ReservationService.reserve(request);

      toast.dismiss();

      router.push(
        `/payment/${response.orderId}?token=${encodeURIComponent(
          response.reservationToken,
        )}`,
      );
    } catch {
      toast.dismiss();
      toast.error("Failed to reserve order");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-base-300 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
              Checkout
            </p>
            <h1 className="mt-3 text-3xl font-bold text-base-content">
              Traveler Details
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
              One quick step before payment: confirm the contact details we
              should use for your booking and reservation updates.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
                    1
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Contact Information
                    </h2>
                    <p className="text-sm text-base-content/60">
                      These details will be attached to the reservation and
                      payment flow.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text font-medium text-base-content/80">
                      Full Name
                    </span>
                    <input
                      type="text"
                      className="input input-bordered mt-2 h-12 w-full bg-base-100"
                      value={checkout.name}
                      onChange={(event) =>
                        dispatch(updateCheckoutInfo({ name: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text font-medium text-base-content/80">
                      Email
                    </span>
                    <input
                      type="email"
                      className="input input-bordered mt-2 h-12 w-full bg-base-100"
                      value={checkout.email}
                      onChange={(event) =>
                        dispatch(updateCheckoutInfo({ email: event.target.value }))
                      }
                      onBlur={(event) =>
                        dispatch(
                          updateCheckoutInfo({
                            email: event.target.value.trim(),
                          }),
                        )
                      }
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <span className="label-text font-medium text-base-content/80">
                      Phone Number
                    </span>
                    <div className="mt-2">
                      <PhoneInput
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </div>

                  <label className="form-control">
                    <span className="label-text font-medium text-base-content/80">
                      Nationality
                    </span>
                    <input
                      type="text"
                      className="input input-bordered mt-2 h-12 w-full bg-base-100"
                      value={checkout.nationality}
                      onChange={(event) =>
                        dispatch(
                          updateCheckoutInfo({
                            nationality: event.target.value,
                          }),
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-base-300 bg-base-200/35 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-content">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      What Happens Next
                    </h2>
                    <p className="text-sm text-base-content/60">
                      After this step, we reserve the selected tours and send
                      you to payment.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-base-content">
                      Reserve selected tours
                    </p>
                    <p className="mt-1 text-sm leading-6 text-base-content/60">
                      We first hold the selected tour spots for your order.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-base-content">
                      Continue to payment
                    </p>
                    <p className="mt-1 text-sm leading-6 text-base-content/60">
                      You will land on the payment step right after reserving.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-base-content">
                      Contact details attached
                    </p>
                    <p className="mt-1 text-sm leading-6 text-base-content/60">
                      We use these details for confirmations and follow-up.
                    </p>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                className="btn btn-primary h-12 w-full text-base"
                disabled={selectedItems.length === 0}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-8">
          <section className="space-y-6 rounded-[24px] border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-content">
                3
              </span>
              <div>
                <h2 className="text-lg font-semibold text-base-content">
                  Booking Summary
                </h2>
                <p className="text-sm text-base-content/60">
                  A quick look at what will be reserved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                  Tours
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {selectedItems.length}
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                  Participants
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {participantCount}
                </p>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-4 text-sm text-base-content/60">
                No selected tours found. Go back to the cart and choose at
                least one item before continuing.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => {
                  const lineTotal =
                    item.type === "PUBLIC"
                      ? item.price * item.participants
                      : item.price;

                  return (
                    <div
                      key={item.cartItemId}
                      className="rounded-2xl border border-base-300 bg-base-100 p-4"
                    >
                      <p className="font-semibold text-base-content">
                        {item.title}
                      </p>

                      <div className="mt-3 space-y-2 text-sm text-base-content/70">
                        <div className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {item.selectedDate} at {item.selectedTime}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {item.participants} participant
                            {item.participants === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-base-300 pt-3 text-sm">
                        <span className="text-base-content/60">Line total</span>
                        <span className="font-semibold text-base-content">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-4">
              <div className="flex items-center justify-between text-sm text-base-content/70">
                <span>Estimated total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-base-300 pt-3 text-lg font-semibold text-base-content">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

