"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface Testimonial {
  quote: string;
  author: string;
  status: string;
  verified: boolean;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const t = useTranslations("LandingPage.testimonials");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [resetTimer, setResetTimer] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const handleManualNavigation = (navigationFn: () => void) => {
    navigationFn();
    setResetTimer((prev) => prev + 1); // Trigger timer reset
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 9000); // 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, resetTimer]);

  return (
    <div className="relative py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative group">
          {/* Floating Navigation Arrows */}
          <button
            onClick={() => handleManualNavigation(prevTestimonial)}
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
            onClick={() => handleManualNavigation(nextTestimonial)}
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

          {/* Testimonial Content with Slide Transition */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform ease-out"
              style={{
                transform: `translateX(-${currentTestimonial * 100}%)`,
                transitionDuration: "2s",
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 text-center text-white"
                >
                  {/* Star Rating */}
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-8 h-8 text-yellow-400 mx-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Testimonial Quote */}
                  <div className="relative mb-8">
                    <div className="text-2xl leading-relaxed italic font-serif">
                      "{testimonial.quote}"
                    </div>
                  </div>

                  {/* Customer Attribution */}
                  <div className="mb-8">
                    <p className="text-white/80 font-medium">
                      - {testimonial.author}, {testimonial.status}
                    </p>
                  </div>

                  {testimonial.verified && (
                    <div className="mb-8">
                      <span className="inline-block bg-green-400 text-gray-300 text-sm px-4 py-2 rounded-full">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-white/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                            />
                          </svg>
                          <p className="text-white/80 font-semibold text-xl">
                            {t("verified")}
                          </p>
                        </div>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:bg-white ${
                  i === currentTestimonial ? "bg-white" : "bg-white/30"
                }`}
                onClick={() => handleManualNavigation(() => goToTestimonial(i))}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
