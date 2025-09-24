"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalId: string;
  title?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  modalId,
  title,
}: ModalWrapperProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    onClose();
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, onClose]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        {isVisible && (
          <>
            <Dialog.Overlay asChild>
              <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 transition-opacity duration-300" />
            </Dialog.Overlay>
            <Dialog.Title asChild />
            <Dialog.Content asChild className="top-10">
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
                <div className="relative">
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Dialog.Close>

                  {/* Modal content */}
                  <div className="relative">{children}</div>
                </div>
              </div>
            </Dialog.Content>
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
