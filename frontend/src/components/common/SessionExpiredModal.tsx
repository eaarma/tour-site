"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { clearExpired } from "@/store/sessionSlice";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/dist/client/components/navigation";

export default function SessionExpiredModal() {
  const dispatch = useDispatch();
  const expired = useSelector((state: RootState) => state.session.expired);

  const pathname = usePathname();

  // 🚫 Never show on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  const handleLogin = () => {
    dispatch(clearExpired());
    window.location.href = "/auth/login?sessionExpired=1";
  };

  const handleCloseDialog = () => {
    dispatch(clearExpired());
  };

  return (
    <AnimatePresence>
      {expired && (
        <motion.div
          key="session-expired"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-base-100 p-8 rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              Session Expired
            </h2>
            <p className="text-center text-base-content/70 mb-6">
              Your login session has expired. Please sign in again to continue.
            </p>

            <button className="btn btn-primary btn-block" onClick={handleLogin}>
              Go to Login
            </button>

            <button
              className="btn btn mt-2 btn-block"
              onClick={handleCloseDialog}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
