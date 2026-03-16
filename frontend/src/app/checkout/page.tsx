"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCheckoutInfo, updateCheckoutInfo } from "@/store/checkoutSlice";
import { RootState, store } from "@/store/store";
import { UserService } from "@/lib/userService";
import toast from "react-hot-toast";
import { ReservationService } from "@/lib/reservationService";
import { OrderCreateRequestDto } from "@/types/order";
import PhoneInput from "@/components/common/PhoneInput";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);

  const [phone, setPhone] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ 1. Pre-fill checkout info from logged-in user
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
      } catch (err: unknown) {
        console.warn("User not logged in or failed to fetch profile:", err);

        // ✅ Reset checkout state for logged-out users
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

  //  Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullPhone = phone;

    if (!checkout.name || !checkout.email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!emailRegex.test(checkout.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const cartItems = store.getState().cart.items.filter((i) => i.selected);

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      toast.loading("Reserving your order…");

      const request: OrderCreateRequestDto = {
        paymentMethod: "CARD",
        name: checkout.name.trim(),
        email: checkout.email.trim(),
        phone: fullPhone,
        nationality: checkout.nationality,
        items: cartItems.map((item) => ({
          tourId: Number(item.id),
          scheduleId: item.scheduleId,
          participants: item.participants,
          scheduledAt: `${item.selectedDate}T${item.selectedTime}`,
          preferredLanguage: item.preferredLanguage,
          comment: item.comment,
        })),
      };

      const res = await ReservationService.reserve(request);

      toast.dismiss();

      // 👇 Navigate WITH orderId in URL
      router.push(
        `/payment/${res.orderId}?token=${encodeURIComponent(
          res.reservationToken,
        )}`,
      );
    } catch {
      toast.dismiss();
      toast.error("Failed to reserve order");
    }
  };

  return (
    <div className="bg-base-100 min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 shadow-lg rounded-xl border border-base-300 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          {/* Name */}
          <div>
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full rounded-lg"
              value={checkout.name}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ name: e.target.value }))
              }
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full rounded-lg"
              value={checkout.email}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ email: e.target.value }))
              }
              onBlur={(e) =>
                dispatch(updateCheckoutInfo({ email: e.target.value.trim() }))
              }
              required
            />
          </div>

          {/* Phone and country code */}
          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <PhoneInput
              value={phone}
              onChange={(p) => {
                setPhone(p);
                dispatch(updateCheckoutInfo({ phone: p }));
              }}
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="label">
              <span className="label-text">Nationality</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full rounded-lg"
              value={checkout.nationality}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ nationality: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4 rounded-lg"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
}
