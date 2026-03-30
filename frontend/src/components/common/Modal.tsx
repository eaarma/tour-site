"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  dismissable = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={dismissable ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 my-auto w-full max-w-3xl overflow-y-auto rounded-xl bg-base-100 px-4 py-4 shadow-xl max-h-[calc(100dvh-1.5rem)] sm:px-5 sm:max-h-[calc(100dvh-2rem)]"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Close button */}
            {dismissable && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 btn btn-sm btn-ghost btn-circle"
                aria-label="Close"
              >
                ✕
              </button>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
