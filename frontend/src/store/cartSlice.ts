import { CartItem } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      // Ensure newly added item is selected by default
      state.items.push({
        ...action.payload,
        cartItemId: crypto.randomUUID(),
        selected: true,
      });
    },
    updateItemInCart: (
      state,
      action: PayloadAction<{ id: string; updatedItem: Partial<CartItem> }>
    ) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.updatedItem,
        };
      }
    },

    updateItemSchedule: (
      state,
      action: PayloadAction<{
        cartItemId: string;
        scheduleId: number;
        date: string;
        time: string;
        participants?: number;
      }>
    ) => {
      const it = state.items.find(
        (i) => i.cartItemId === action.payload.cartItemId
      );
      if (it) {
        it.scheduleId = action.payload.scheduleId;
        it.selectedDate = action.payload.date;
        it.selectedTime = action.payload.time;
        if (typeof action.payload.participants === "number") {
          it.participants = action.payload.participants;
        }
      }
    },

    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.cartItemId !== action.payload
      );
    },

    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const item = state.items.find((it) => it.cartItemId === action.payload);
      if (item) item.selected = !item.selected;
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateItemInCart,
  updateItemSchedule,
  toggleItemSelection,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
