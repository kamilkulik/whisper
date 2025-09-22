"use client";

import { useState } from "react";

interface AccordionItemProps {
  question: string;
  answers: string[];
  id: string;
}

export default function AccordionItem({
  question,
  answers,
  id,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/20 transition-colors"
        onClick={toggleAccordion}
      >
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        <svg
          className={`w-5 h-5 text-blue-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className={`${isOpen ? "block" : "hidden"} px-6 pb-4`}>
        <div className="text-blue-200 leading-relaxed space-y-2">
          {answers.map((answer, index) => (
            <p key={index}>{answer}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
