import React from "react";

interface CartTotalSectionProps {
  totalPrice: number;
  onCheckout: () => void;
}

const CartTotalSection: React.FC<CartTotalSectionProps> = ({
  totalPrice,
  onCheckout,
}) => {
  return (
    <div className="w-full md:w-1/3 p-4 bg-base-200 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
      <div className="flex justify-between text-lg mb-4">
        <span>Total</span>
        <span>€{totalPrice.toFixed(2)}</span>
      </div>
      <button
        className="btn btn-primary w-full"
        onClick={onCheckout}
        disabled={totalPrice === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartTotalSection;
