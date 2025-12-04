import toast from "react-hot-toast";

export function Success(message: string) {
  toast.success(message, {
    duration: 2500,
    style: {
      borderRadius: "6px",
    },
  });
}
