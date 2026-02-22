import { forwardRef } from "react";
import { CalendarDays, X } from "lucide-react";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  onClear?: () => void;
}

const CustomDateInput = forwardRef<HTMLButtonElement, CustomDateInputProps>(
  ({ value, onClick, onClear }, ref) => {
    return (
      <div className="relative group">
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          className="group w-full h-11 pl-10 pr-9 bg-base-200 hover:bg-base-100 focus:bg-base-100 text-sm rounded-xl border border-transparent 
          focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary 
          hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/20 hover:ring-primary/20 transition-all text-left cursor-pointer flex items-center"
        >
          <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none group-hover:text-primary group-focus:text-primary" />
          <span
            className={
              value
                ? "text-foreground group-hover:text-primary group-focus:text-primary"
                : "text-muted-foreground group-hover:text-primary group-focus:text-primary"
            }
          >
            {value || "Pick a date"}
          </span>
        </button>
        {value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear date"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    );
  },
);

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
