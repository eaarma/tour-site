import React from "react";

interface CartEntry {
  id: string;
  title: string;
  price: number;
  participants: number;
  selectedDate: string;
  selectedTime: string;
}

interface CartItemSectionProps {
  cart: CartEntry[];
  onRemove: (id: string) => void;
}

const CartItemSection: React.FC<CartItemSectionProps> = ({
  cart,
  onRemove,
}) => {
  const totalPrice = cart.reduce(
    (acc, entry) => acc + entry.price * entry.participants,
    0
  );

  return (
    <div className="w-full md:w-2/3 space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center border rounded-xl p-4 shadow-sm bg-base-100 hover:shadow-md transition-shadow"
            >
              {/* Left info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                  <span className="bg-gray-100 rounded-full px-2 py-1">
                    {entry.participants} participant
                    {entry.participants > 1 ? "s" : ""}
                  </span>
                  <span className="bg-gray-100 rounded-full px-2 py-1">
                    €{entry.price} each
                  </span>
                  <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                    {entry.selectedDate} @ {entry.selectedTime}
                  </span>
                </div>
              </div>

              {/* Right remove button */}
              <button
                className="btn btn-sm btn-error mt-2 md:mt-0"
                onClick={() => onRemove(entry.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="text-right font-bold text-xl mt-6">
            Total: €{totalPrice.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
};

export default CartItemSection;
