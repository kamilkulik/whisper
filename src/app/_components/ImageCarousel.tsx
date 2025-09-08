"use client";

import { useState, useEffect } from "react";

interface ImageSlide {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: ImageSlide[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);

  const nextImage = () => {
    if (!isTransitioning) {
      setDirection("next");
      setIsTransitioning(true);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (!isTransitioning) {
      setDirection("previous");
      setIsTransitioning(true);
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    if (!isTransitioning && index !== currentImage) {
      setDirection(index > currentImage ? "next" : "previous");
      setIsTransitioning(true);
      setCurrentImage(index);
    }
  };

  const handleManualNavigation = (navigationFn: () => void) => {
    navigationFn();
    setResetTimer((prev) => prev + 1); // Trigger timer reset
  };

  // Reset transition state after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1500); // Match the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    if (isTransitioning) return; // Don't auto-advance while transitioning

    const interval = setInterval(() => {
      nextImage();
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [images.length, resetTimer, isTransitioning]);

  return (
    <div className="relative h-full flex items-center justify-center p-0 md:p-12 min-[1200px]:p-24">
      {/** required for dots to be at the bottom */}
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
        {/* Image Content with Directional Slide Transition */}
        <div className="overflow-hidden rounded-2xl w-full max-w-2xl mx-auto">
          <div className={`carousel-inner-container ${direction}`}>
            <div
              className="carousel-slide"
              style={{
                transform: `translateX(-${currentImage * 100}%)`,
              }}
            >
              {images.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0 h-full">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
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
  );
}
