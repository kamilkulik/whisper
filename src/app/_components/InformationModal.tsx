"use client";

import { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";

interface InformationModalProps {
  message: string;
  acknowledgeText?: string;
  handleModalClose: () => void;
}

export default function InformationModal({
  message,
  acknowledgeText,
  handleModalClose,
}: InformationModalProps) {
  return (
    <>
      <div className="bg-gray-800/80 rounded-2xl shadow-xl p-12 backdrop-blur-sm max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-white/70 text-center leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleModalClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300"
          >
            {acknowledgeText}
          </button>
        </div>
      </div>
    </>
  );
}
