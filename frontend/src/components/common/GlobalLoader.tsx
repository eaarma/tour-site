"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader() {
  const isLoading = useSelector(
    (state: RootState) => state.loading.activeRequests > 0
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-base-200/70 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="font-semibold text-primary">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
