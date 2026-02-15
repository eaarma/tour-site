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
          className="fixed inset-0 z-50 flex items-center justify-center"
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
            className="relative z-10 bg-base-100 rounded-xl shadow-xl w-[min(92vw,48rem)] px-5 py-4 mx-4"
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
