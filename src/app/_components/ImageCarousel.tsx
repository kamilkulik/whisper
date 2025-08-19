"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSlide {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: ImageSlide[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [resetTimer, setResetTimer] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  const handleManualNavigation = (navigationFn: () => void) => {
    navigationFn();
    setResetTimer((prev) => prev + 1); // Trigger timer reset
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [images.length, resetTimer]);

  return (
    <div
      className="relative h-full flex items-center justify-center"
      style={{
        filter:
          "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))",
      }}
    >
      <div className="relative w-full max-w-2xl">
        <div className="relative group">
          {/* Floating Navigation Arrows */}
          <button
            onClick={() => handleManualNavigation(prevImage)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 z-10"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={() => handleManualNavigation(nextImage)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 z-10"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Image Content with Framer Motion Slide Transition */}
          <div className="overflow-hidden rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
            <motion.div
              className="flex"
              animate={{ x: `-${currentImage * 100}%` }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              {images.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={800}
                    height={1000}
                    className="w-full h-auto object-contain object-center"
                    priority={index === 0}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-3 mt-6">
            {images.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:bg-white ${
                  i === currentImage ? "bg-white" : "bg-white/30"
                }`}
                onClick={() => handleManualNavigation(() => goToImage(i))}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
