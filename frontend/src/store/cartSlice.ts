import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  participants: number;
  scheduleId: number;
  selectedDate: string;
  selectedTime: string;
  selected: boolean;
}

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
      state.items.push({ ...action.payload, selected: true });
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
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
        id: string;
        scheduleId: number;
        date: string;
        time: string;
        participants?: number;
      }>
    ) => {
      const it = state.items.find((i) => i.id === action.payload.id);
      if (it) {
        it.scheduleId = action.payload.scheduleId;
        it.selectedDate = action.payload.date;
        it.selectedTime = action.payload.time;
        if (typeof action.payload.participants === "number") {
          it.participants = action.payload.participants;
        }
      }
    },

    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const item = state.items.find((it) => it.id === action.payload);
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
