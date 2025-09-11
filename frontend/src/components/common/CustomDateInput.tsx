import { forwardRef } from "react";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  onClear?: () => void;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, onClear }, ref) => {
    const handleClick = () => {
      onClick?.();

      // If the input has a value, blur it so the X button shows immediately
      const inputEl = ref && "current" in ref ? ref.current : null;
      if (inputEl) {
        inputEl.blur();
      }
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="text"
          readOnly
          value={value}
          onClick={handleClick}
          placeholder="Pick a date"
          className="input input-bordered w-full pr-10 cursor-pointer"
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // prevent opening calendar
              onClear?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

CustomDateInput.displayName = "CustomDateInput";
export default CustomDateInput;
