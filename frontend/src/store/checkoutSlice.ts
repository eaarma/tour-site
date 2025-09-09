import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
  email: string;
  name: string;
  phone: string;
  nationality: string;
}

const initialState: CheckoutState = {
  email: "",
  name: "",
  phone: "",
  nationality: "",
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutInfo: (state, action: PayloadAction<CheckoutState>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.nationality = action.payload.nationality;
    },

    updateCheckoutInfo: (
      state,
      action: PayloadAction<Partial<CheckoutState>>
    ) => {
      Object.assign(state, action.payload);
    },

    clearCheckoutInfo: (state) => {
      state.email = "";
      state.name = "";
      state.phone = "";
      state.nationality = "";
    },
  },
});

export const { setCheckoutInfo, updateCheckoutInfo, clearCheckoutInfo } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
