"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConfirmationCodeForm from "./_components/ConfirmationCodeForm";
import ContactForm from "./_components/ContactForm";
import TestimonialsCarousel from "./_components/TestimonialsCarousel";
import ImageCarousel from "./_components/ImageCarousel";
import HowItWorks from "./_components/HowItWorks";
import PricingSection from "./_components/PricingSection";
import { ModalWrapper } from "./_components/ModalWrapper";
import TestingToolsWrapper from "./_components/TestingToolsWrapper";
import AccordionItem from "./_components/AccordionItem";
import { SubscriptionType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Footer } from "./_components/Footer";
import { navigateToCheckout } from "./_actions/navigateToCheckout";
import { userEmailFromCookie } from "./_actions/userEmailFromCookie";
import Spinner from "./_components/Spinner";
import { useCurrentLocale } from "./_hooks/useCurrentLocale";
import InformationModal from "./_components/InformationModal";
import { useGetCurrentSession } from "./_hooks/useGetCurrentSession";
import { useTriangulatedLocation } from "./_hooks/useTriangulatedLocation";
import { languageOptions } from "./_consts";
import { trackEvent, Event } from "@/lib/fbq";
import { generateEventId } from "@/lib/eventId";
import { getMetaCookies } from "@/lib/metaCookies";

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<SubscriptionType | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<{
    isEmailVerified: boolean;
    email: string;
  }>({
    isEmailVerified: false,
    email: "",
  });
  const pricingSectionRef = useRef<any>(null);
  const currentLocale = useCurrentLocale();
  const { triangulatedCountry } = useTriangulatedLocation();

  // Handle language selection
  const handleLanguageSelect = (locale: string) => {
    // Set the locale cookie
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    // Reload the page to apply the new locale
    window.location.reload();
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const videoRef4 = useRef<HTMLVideoElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Get translations
  const t = useTranslations("LandingPage");

  // Get modal from search params
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");

  // Click outside handler for language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setPrefersReducedMotion(prefersReducedMotion);
    };

    // Check on mount
    checkReducedMotion();

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const setDelay = () => {
      el.dataset["delay"] = window.innerWidth < 800 ? "0" : "1600";
    };

    setDelay();
    window.addEventListener("resize", setDelay);
    return () => window.removeEventListener("resize", setDelay);
  }, []);

  useEffect(() => {
    if (!CSS.supports("animation-timeline: scroll()")) {
      const bar = document.querySelector(
        ".reading-progress-bar",
      ) as HTMLElement;
      if (bar) {
        bar.style.setProperty("visibility", "visible", "important");
        let ticking = false;

        const handleScrollProgress = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              const progress =
                window.scrollY /
                (document.body.scrollHeight - window.innerHeight);
              bar.style.transform = `scaleX(${progress})`;
              ticking = false;
            });
            ticking = true;
          }
        };

        window.addEventListener("scroll", handleScrollProgress);

        handleScrollProgress(); // initial draw

        return () => window.removeEventListener("scroll", handleScrollProgress);
      }
    }
  }, []);

  // Intersection Observer for copy line and float-in animations
  useEffect(() => {
    const animatedElements = document.querySelectorAll(
      ".copy-line, .float-in, .float-in-right",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = parseInt(element.dataset.delay || "0");

            setTimeout(() => {
              element.classList.add("animate-in");
            }, delay);

            // Stop observing this element once it's animated
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px", // Start animation slightly before element is fully visible
      },
    );

    animatedElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      animatedElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  // Unified Intersection Observer for all videos
  useEffect(() => {
    const videos = [
      videoRef.current,
      videoRef2.current,
      videoRef3.current,
      videoRef4.current,
    ].filter(Boolean);

    if (videos.length === 0) return;

    // Track pending retry handlers so we can clean them up
    const pendingRetries = new Map<HTMLVideoElement, () => void>();

    /**
     * Attempt to play a video. If play() rejects (common on mobile when 
     * the video isn't buffered yet), set up a one-time retry listener on
     * "canplaythrough" so it plays as soon as it's truly ready.
     */
    const attemptPlay = (video: HTMLVideoElement) => {
      // Remove any stale retry handler before setting a new one
      const stale = pendingRetries.get(video);
      if (stale) {
        video.removeEventListener("canplaythrough", stale);
        pendingRetries.delete(video);
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // play() failed — video probably isn't ready yet.
          // Retry once the browser has buffered enough to play through.
          const retryPlay = () => {
            video.play().catch(() => { });
            video.removeEventListener("canplaythrough", retryPlay);
            pendingRetries.delete(video);
          };
          pendingRetries.set(video, retryPlay);
          video.addEventListener("canplaythrough", retryPlay);
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            // Lazy-load sources on first intersection
            if (!video.dataset.loaded) {
              video.querySelectorAll("source").forEach((source) => {
                const el = source as HTMLSourceElement;
                if (el.dataset.src) {
                  el.src = el.dataset.src;
                }
              });
              video.dataset.loaded = "true";
              video.load();
            }

            // Always attempt to play when the video enters the viewport.
            // attemptPlay handles the case where the video isn't ready yet.
            attemptPlay(video);
          } else {
            // Video left the viewport — pause and cancel any pending retry
            video.pause();
            const pending = pendingRetries.get(video);
            if (pending) {
              video.removeEventListener("canplaythrough", pending);
              pendingRetries.delete(video);
            }
          }
        });
      },
      {
        // Lower threshold so it triggers earlier on small mobile screens
        threshold: 0.15,
        // Positive bottom margin eagerly triggers the observer before the
        // video is fully scrolled into view, giving it time to buffer.
        rootMargin: "0px 0px 200px 0px",
      },
    );

    videos.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      // Full cleanup: unobserve AND remove any pending event listeners
      videos.forEach((video) => {
        if (video) {
          observer.unobserve(video);
          const pending = pendingRetries.get(video);
          if (pending) {
            video.removeEventListener("canplaythrough", pending);
          }
        }
      });
      pendingRetries.clear();
    };
  }, [currentLocale, prefersReducedMotion]);

  // Handle modal deep links - scroll to pricing section when modal is present (except login and contact)
  useEffect(() => {
    if (modal && modal !== "login" && modal !== "contact") {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        const pricingSection = document.querySelector("#pricing-section");
        if (pricingSection) {
          pricingSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [modal]);

  // Helper function to generate srcset for responsive images
  const getImageSrcset = (baseName: string, locale: string | null): string => {
    if (!locale) return "";

    const sizes = [480, 640, 1080];
    return sizes
      .map((size) => `/${locale}/${baseName}_${size}.jpg ${size}w`)
      .join(", ");
  };

  // Testimonial data
  const testimonials = [
    {
      quote: t("testimonials.testimonial-1.quote"),
      author: t("testimonials.testimonial-1.author"),
      status: t("testimonials.testimonial-1.status"),
      verified: true,
    },
    {
      quote: t("testimonials.testimonial-2.quote"),
      author: t("testimonials.testimonial-2.author"),
      status: t("testimonials.testimonial-2.status"),
      verified: true,
    },
    {
      quote: t("testimonials.testimonial-3.quote"),
      author: t("testimonials.testimonial-3.author"),
      status: t("testimonials.testimonial-3.status"),
      verified: false,
    },
    {
      quote: t("testimonials.testimonial-4.quote"),
      author: t("testimonials.testimonial-4.author"),
      status: t("testimonials.testimonial-4.status"),
      verified: false,
    },
    {
      quote: t("testimonials.testimonial-5.quote"),
      author: t("testimonials.testimonial-5.author"),
      status: t("testimonials.testimonial-5.status"),
      verified: true,
    },
    {
      quote: t("testimonials.testimonial-6.quote"),
      author: t("testimonials.testimonial-6.author"),
      status: t("testimonials.testimonial-6.status"),
      verified: false,
    },
    {
      quote: t("testimonials.testimonial-7.quote"),
      author: t("testimonials.testimonial-7.author"),
      status: t("testimonials.testimonial-7.status"),
      verified: true,
    },
    {
      quote: t("testimonials.testimonial-8.quote"),
      author: t("testimonials.testimonial-8.author"),
      status: t("testimonials.testimonial-8.status"),
      verified: false,
    },
  ];

  // Image carousel data
  const carouselImages = currentLocale
    ? [
      {
        src: `/${currentLocale}/szept_1_1080.jpg`,
        srcset: getImageSrcset("szept_1", currentLocale),
        alt: "Wieczorny Szept Image 1",
      },
      {
        src: `/${currentLocale}/szept_2_1080.jpg`,
        srcset: getImageSrcset("szept_2", currentLocale),
        alt: "Wieczorny Szept Image 2",
      },
      {
        src: `/${currentLocale}/szept_3_1080.jpg`,
        srcset: getImageSrcset("szept_3", currentLocale),
        alt: "Wieczorny Szept Image 3",
      },
      {
        src: `/${currentLocale}/szept_4_1080.jpg`,
        srcset: getImageSrcset("szept_4", currentLocale),
        alt: "Wieczorny Szept Image 4",
      },
    ]
    : [];

  // FAQ data
  const faqData = [
    {
      id: "faq-1",
      question: t("faq.faq-1.question"),
      answers: [
        t("faq.faq-1.answer-1"),
        t("faq.faq-1.answer-2"),
        t("faq.faq-1.answer-3"),
        t("faq.faq-1.answer-4"),
      ].filter((answer) => answer.trim() !== ""), // Remove empty answers
    },
    {
      id: "faq-2",
      question: t("faq.faq-2.question"),
      answers: [
        t("faq.faq-2.answer-1"),
        t("faq.faq-2.answer-2"),
        t("faq.faq-2.answer-3"),
        t("faq.faq-2.answer-4"),
      ].filter((answer) => answer.trim() !== ""),
    },
    {
      id: "faq-3",
      question: t("faq.faq-3.question"),
      answers: [
        t("faq.faq-3.answer-1"),
        t("faq.faq-3.answer-2"),
        t("faq.faq-3.answer-3"),
        t("faq.faq-3.answer-4"),
      ].filter((answer) => answer.trim() !== ""),
    },
    {
      id: "faq-4",
      question: t("faq.faq-4.question"),
      answers: [
        t("faq.faq-4.answer-1"),
        t("faq.faq-4.answer-2"),
        t("faq.faq-4.answer-3"),
        t("faq.faq-4.answer-4"),
      ].filter((answer) => answer.trim() !== ""),
    },
    {
      id: "faq-5",
      question: t("faq.faq-5.question"),
      answers: [
        t("faq.faq-5.answer-1"),
        t("faq.faq-5.answer-2"),
        t("faq.faq-5.answer-3"),
        t("faq.faq-5.answer-4"),
      ].filter((answer) => answer.trim() !== ""),
    },
    {
      id: "faq-6",
      question: t("faq.faq-6.question"),
      answers: [
        t("faq.faq-6.answer-1"),
        t("faq.faq-6.answer-2"),
        t("faq.faq-6.answer-3"),
        t("faq.faq-6.answer-4"),
      ].filter((answer) => answer.trim() !== ""),
    },
  ];

  const handleStartJourneyWithScroll =
    (product: SubscriptionType) => async () => {
      if (product === SubscriptionType.TRIAL) {
        trackEvent(
          Event.StartTrial,
          {},
          { eventID: generateEventId(Event.StartTrial) },
        );
      }
      // Set the selected product
      setSelectedProduct(product);

      // Does the user have a valid session?
      const userEmailFromSessionCookie = await userEmailFromCookie();

      if (userEmailFromSessionCookie) {
        const meta =
          product !== SubscriptionType.TRIAL && typeof window !== "undefined"
            ? {
              ...getMetaCookies(),
              eventId: generateEventId(Event.InitiateCheckout),
              eventSourceUrl: window.location.href,
            }
            : undefined;
        const result = await navigateToCheckout(
          product,
          userEmailFromSessionCookie,
          triangulatedCountry || undefined,
          meta,
        );
        if (result?.success) {
          if (result?.hasCurrentActiveSubscription) {
            // User already has an active subscription, inform them of it through
            router.push("/?modal=already-subscribed", { scroll: false });
            return;
          }
          if (result?.checkoutUrl) {
            window.location.href = result.checkoutUrl;
            return;
          }
          router.push("/trial-success");
          return;
        }
      }

      // Navigate to modal without scrolling to top
      router.push(`/?modal=phone`, { scroll: false });
    };

  const handleNavigateToPricing = () => {
    // Smooth scroll to the pricing section
    const pricingSection = document.querySelector("#pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleModalClose = () => {
    router.push("/", { scroll: false });
  };

  const handleModalOpen = () => {
    // Clear loading states in PricingSection when modal opens
    if (
      pricingSectionRef.current &&
      pricingSectionRef.current.clearAllLoadingStates
    ) {
      pricingSectionRef.current.clearAllLoadingStates();
    }
  };

  const handleShowContactForm = (phone: string) => {
    setVerifiedPhoneNumber(phone);
    // setShowContactForm(true);
    router.push(`/?modal=contact`, { scroll: false });
  };

  const handleLoginClick = async () => {
    try {
      // Check if user is already logged in via API
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (data.authenticated) {
        // User is already logged in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is not logged in, show login modal
        router.push("/?modal=login", { scroll: false });
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      // Fallback to showing login modal
      router.push("/?modal=login", { scroll: false });
    }
  };

  const { sessionId, loading: loadingSessionId } = useGetCurrentSession();

  // Handle modal opening to clear loading states
  useEffect(() => {
    if (modal === "phone" || modal === "already-subscribed") {
      // Modal is opening, clear loading states
      handleModalOpen();
    }
  }, [modal]);

  return (
    <div className="relative">
      {/* Reading Progress Bar */}
      <div className="reading-progress-bar"></div>

      <div className="bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E] relative">
        {/* Navigation Bar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-[10] transition-all duration-300 ${scrolled
            ? "bg-black/40 backdrop-blur-md shadow-lg [backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] will-change-[backdrop-filter]"
            : "bg-transparent"
            }`}
        >
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-8">
              <div className="text-white font-bold text-3xl">
                {t("hero.brand")} 🌙
              </div>
              <div className="hidden md:flex space-x-6"></div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={handleLoginClick}
                className="text-white hover:text-blue-200 transition-colors"
              >
                {loadingSessionId ? (
                  <Spinner size="sm" />
                ) : sessionId ? (
                  t("hero.dashboard-button")
                ) : (
                  t("hero.login-button")
                )}
              </button>
              <button
                onClick={handleNavigateToPricing}
                className="hidden sm:inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {t("hero.header-cta-button")}
              </button>
              {/* Language Switcher */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                  className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-lg border border-white/20 hover:border-white/40"
                  hidden={currentLocale === null}
                >
                  {
                    languageOptions.find(
                      (option) => option.locale === currentLocale,
                    )?.value
                  }
                </button>
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full mt-1 bg-gray-800 rounded-lg shadow-xl z-50 min-w-[80px]">
                    {languageOptions.map((option) => (
                      <button
                        key={option.locale}
                        onClick={() => handleLanguageSelect(option.locale)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - All sections with continuous background */}
        <div className="">
          {/* Hero Section */}
          <div className="relative">
            {/* Hero Background Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
              <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 pt-32 md:max-lg:pt-32 md:pt-16 lg:pt-16">
              <div className="grid lg:grid-cols-5 gap-8 lg:gap-2 items-center min-h-[80vh]">
                {/* Left Side - Content */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h1
                      className="copy-line text-6xl lg:text-6xl font-bold text-white leading-tight"
                      data-delay="0"
                    >
                      {t("hero.title-1")}{" "}
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("hero.title-2")}
                      </span>{" "}
                      {t("hero.title-3")}
                    </h1>
                  </div>

                  <div className="text-xl text-white leading-relaxed md:max-lg:text-2xl">
                    <div className="copy-line" data-delay="300">
                      {t("hero.copy.c-1")}
                    </div>
                    <div className="copy-line" data-delay="500">
                      {t("hero.copy.c-2")}
                    </div>
                    <div className="copy-line" data-delay="700">
                      {t("hero.copy.c-3")}
                    </div>
                    <div className="copy-line" data-delay="900">
                      {t("hero.copy.c-4")}
                    </div>
                  </div>

                  {/** Encapsulate button into its own component */}
                  <button
                    onClick={handleNavigateToPricing}
                    className="copy-line bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                    data-delay="1100"
                  >
                    {t("hero.button")}
                  </button>

                  {/* Price pill */}
                  {/* <div className="copy-line -mt-6" data-delay="1200">
                    <span className="inline-block bg-gray-800/50 text-gray-300 text-sm px-4 py-2 rounded-full border border-gray-700/50">
                      Od 19 zł/mies.
                    </span>
                  </div> */}

                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div
                        className="float-in w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                        data-delay="1800"
                      >
                        <img
                          src="/face_1.jpg"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div
                        className="float-in w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                        data-delay="1700"
                      >
                        <img
                          src="/face_2.jpg"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div
                        className="float-in w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                        data-delay="1600"
                      >
                        <img
                          src="/face_3.jpg"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="float-in text-white" data-delay="1500">
                      <p className="text-blue-200 text-xl">
                        {t("hero.CTA-copy-1")}
                      </p>
                      <p className="text-blue-200 text-xl">
                        {t("hero.CTA-copy-2")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image Carousel */}
                <div
                  className="float-in-right mt-24 md:mt-0 lg:col-span-3 relative"
                  ref={carouselRef}
                >
                  {currentLocale ? (
                    <ImageCarousel images={carouselImages} />
                  ) : (
                    <Spinner size="xl" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          {/* blow div - entire section wrapper */}
          <div className="relative mt-64  lg:mt-28">
            <div
              className="text-center mb-16 md:max-lg:mb-0"
              data-oid="-zj3z04"
            >
              <h2
                className="text-4xl lg:text-5xl font-bold text-white"
                data-oid="c3bt..l"
              >
                {t("how-it-feels.title")}
              </h2>
            </div>

            {/* It How it feels Section */}
            {/* Step 1 */}
            <div className="relative min-h-[60vh] md:min-h-[40vh] mb-40 flex items-center">
              <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">
                  {/* Content - Order 1 on mobile, Order 2 on desktop */}
                  <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col items-center lg:space-y-0 md:my-12 xl:my-2">
                    <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                      {t("how-it-feels.it-begins-1")}{" "}
                      <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("how-it-feels.it-begins-2")}
                      </span>
                      {t("how-it-feels.it-begins-3")}
                    </h2>
                    <p className="text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                      <br />
                      {t("how-it-feels.it-begins-copy-1")}
                    </p>
                  </div>

                  {/* Image - Order 2 on mobile, Order 1 on desktop */}
                  <div className="order-2 lg:order-1 relative flex justify-center items-center md:max-lg:h-[400px] h-[300px] lg:h-[550px] lg:col-span-3">
                    {prefersReducedMotion ? (
                      currentLocale ? (
                        <img
                          src={`/${currentLocale}/videos/posters/notification_received.jpg`}
                          alt="Podgląd Szeptu"
                          className="w-full max-h-full object-contain rounded-2xl"
                        />
                      ) : (
                        <Spinner size="xl" />
                      )
                    ) : currentLocale ? (
                      <video
                        ref={videoRef}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        loop={true}
                        muted
                        playsInline
                        controls={false}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        preload="metadata"
                        poster={`/${currentLocale}/videos/posters/notification_received.jpg`}
                      >
                        <source
                          data-src={`/${currentLocale}/videos/notification_received.mp4`}
                          type="video/mp4"
                        />
                      </video>
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative min-h-[60vh] flex items-center mb-40">
              <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">
                  {/* Content - Order 1 on mobile, Order 1 on desktop */}
                  <div className="order-1 lg:order-1 lg:col-span-2 flex flex-col justify-center lg:space-y-0 md:my-12 xl:my-2">
                    <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                      {t("how-it-feels.open-the-whisper-1")}{" "}
                      <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("how-it-feels.open-the-whisper-2")}
                      </span>
                      {t("how-it-feels.open-the-whisper-3")}
                    </h2>
                    <p className="text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                      <br />
                      {t("how-it-feels.open-the-whisper-copy-1")}
                    </p>
                  </div>
                  {/* Image - Order 2 on mobile, Order 2 on desktop */}
                  <div className="order-2 lg:order-2 relative flex justify-center items-center md:max-lg:h-[400px] h-[300px] lg:h-[550px] lg:col-span-3">
                    {prefersReducedMotion ? (
                      currentLocale ? (
                        <img
                          src={`/${currentLocale}/videos/posters/message_reveal.jpg`}
                          alt="Podgląd Szeptu"
                          className="w-full max-h-full object-contain rounded-2xl"
                        />
                      ) : (
                        <Spinner size="xl" />
                      )
                    ) : currentLocale ? (
                      <video
                        ref={videoRef3}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        loop={true}
                        muted
                        playsInline
                        controls={false}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        preload="metadata"
                        poster={`/${currentLocale}/videos/posters/message_reveal.jpg`}
                      >
                        <source
                          data-src={`/${currentLocale}/videos/message_reveal.mp4`}
                          type="video/mp4"
                        />
                      </video>
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative min-h-[60vh] flex items-center mb-40">
              <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">
                  {/* Content - Order 1 on mobile, Order 2 on desktop */}
                  <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col justify-center lg:space-y-0 md:my-12 xl:my-2">
                    <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                      {t("how-it-feels.the-habit-1")}{" "}
                      <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("how-it-feels.the-habit-2")}
                      </span>
                      {t("how-it-feels.the-habit-3")}
                    </h2>
                    <p className="text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                      <br />
                      {t("how-it-feels.the-habit-copy-1")}
                    </p>
                  </div>
                  {/* Image - Order 2 on mobile, Order 1 on desktop */}
                  <div className="order-2 lg:order-1 relative flex justify-center items-center md:max-lg:h-[400px] h-[300px] lg:h-[550px] lg:col-span-3">
                    {currentLocale ? (
                      <video
                        ref={videoRef2}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        loop={true}
                        muted
                        playsInline
                        controls={false}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        preload="metadata"
                        poster={`/${currentLocale}/videos/posters/scroll.jpg`}
                      >
                        <source
                          data-src={`/${currentLocale}/videos/scroll.mp4`}
                          type="video/mp4"
                        />
                      </video>
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative min-h-[60vh] flex items-center mb-40">
              <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                  {/* Content - Order 1 on mobile, Order 1 on desktop */}
                  <div className="order-1 lg:order-1 lg:col-span-2 flex flex-col justify-center lg:space-y-0 md:my-12 xl:my-2">
                    <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                      {t("how-it-feels.the-feeling-1")}{" "}
                      <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("how-it-feels.the-feeling-2")}
                      </span>
                      {t("how-it-feels.the-feeling-3")}
                    </h2>
                    <p className="text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                      <br />
                      {t("how-it-feels.the-feeling-copy-1")}
                    </p>
                  </div>
                  {/* Image - Order 2 on mobile, Order 2 on desktop */}
                  <div className="order-2 lg:order-2 flex justify-center items-center md:max-lg:h-[400px] h-[300px] lg:h-[550px] lg:col-span-3">
                    {currentLocale ? (
                      <img
                        src={`/${currentLocale}/single_whisper_1080.jpg`}
                        srcSet={getImageSrcset("single_whisper", currentLocale)}
                        alt="Smartphone showing Wieczorny Szept notification"
                        className="max-w-full max-h-full object-contain rounded-2xl"
                      />
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative min-h-[60vh] flex items-center mb-40">
              <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">
                  {/* Content - Order 1 on mobile, Order 2 on desktop */}
                  <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col justify-center lg:space-y-0 md:my-12 xl:my-2">
                    <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                      {t("how-it-feels.you-in-the-story-1")}{" "}
                      <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t("how-it-feels.you-in-the-story-2")}
                      </span>
                      {t("how-it-feels.you-in-the-story-3")}
                    </h2>
                    <p className="text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                      <br />
                      {t("how-it-feels.you-in-the-story-copy-1")}
                    </p>
                    <br />
                    <div className="leading-loose text-2xl text-blue-200 text-center">
                      <ul className="list-inside">
                        <li>{t("how-it-feels.you-in-the-story-copy-2")}</li>
                        <li>{t("how-it-feels.you-in-the-story-copy-3")}</li>
                        <li>{t("how-it-feels.you-in-the-story-copy-4")}</li>
                        <li>{t("how-it-feels.you-in-the-story-copy-5")}</li>
                      </ul>
                    </div>
                  </div>
                  {/* Image - Order 2 on mobile, Order 1 on desktop */}
                  <div className="order-2 lg:order-1 relative flex justify-center items-center md:max-lg:h-[400px] h-[300px] lg:h-[550px] lg:col-span-3">
                    <video
                      ref={videoRef4}
                      className="max-w-full max-h-full object-contain rounded-2xl"
                      loop={true}
                      muted
                      playsInline
                      controls={false}
                      controlsList="nodownload nofullscreen noremoteplayback"
                      preload="metadata"
                      poster="/VIDEOS/POSTERS/heartfelt_message.jpg"
                    >
                      <source
                        data-src="/VIDEOS/heartfelt_message.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <HowItWorks onGetStarted={handleNavigateToPricing} />

          {/* Smartphone Notification Section */}
          <div className="relative min-h-[80vh] flex items-center my-32">
            <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                {/* Image */}
                <div className="order-2 lg:order-1 md:max-lg:my-12 relative flex justify-center items-center h-[400px] lg:h-[550px] lg:col-span-3 lg:row-span-3 self-center">
                  {currentLocale ? (
                    <img
                      src={`/${currentLocale}/szept_4_1080.jpg`}
                      srcSet={getImageSrcset("szept_4", currentLocale)}
                      alt="Smartphone showing Wieczorny Szept notification"
                      className="max-w-full max-h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <Spinner size="xl" />
                  )}
                </div>

                <div className="order-1 lg:order-2 lg:col-start-4 lg:col-span-2 self-start">
                  <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                    {t("smartphone-notification-section.title-1")}{" "}
                    <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {t("smartphone-notification-section.title-2")}
                    </span>
                    {t("smartphone-notification-section.title-3")}
                  </h2>
                </div>

                {/* Content */}
                <div className="order-3 lg:col-start-4 lg:col-span-2">
                  <p className="text-2xl lg:text-xl text-blue-200 text-justify leading-relaxed">
                    {t("smartphone-notification-section.copy-1")}
                    <br />
                    <br />
                    {t("smartphone-notification-section.copy-2")}
                  </p>
                </div>

                <div className="order-4 lg:col-start-4 lg:col-span-2 flex flex-col md:max-lg:flex-row md:max-lg:space-x-8 md:max-lg:justify-center items-center self-start">
                  <button
                    onClick={handleNavigateToPricing}
                    className="max-md:my-8 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-2xl lg:text-xl transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform cursor-pointer"
                  >
                    {t("smartphone-notification-section.button")}
                  </button>
                  <div className="text-white text-2xl lg:text-xl mt-4">
                    <p className="font-medium">
                      {t("smartphone-notification-section.CTA-copy-1")}
                    </p>
                    <p className="text-blue-200">
                      {t("smartphone-notification-section.CTA-copy-2")}
                    </p>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </div>
          {/* Testimonials Section */}
          <div className="relative py-16">
            <div className="max-w-7xl mx-auto px-6">
              {/* Main Headline */}
              <div className="text-center">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  {t("testimonials.title")}
                </h2>
                <p className="max-w-4xl mx-auto text-2xl lg:text-xl text-blue-200 text-center leading-relaxed">
                  {t("testimonials.copy")}
                </p>
              </div>

              {/* Testimonials Carousel */}
              <TestimonialsCarousel testimonials={testimonials} />
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing-section">
            <PricingSection
              ref={pricingSectionRef}
              onGetStarted={handleStartJourneyWithScroll}
              showTrial={true}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="relative py-24">
          <div className="max-w-4xl mx-auto px-6">
            {/* FAQ Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                {t("faq.title")}
              </h2>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {faqData.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answers={faq.answers}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className=" text-white relative overflow-hidden">
          <div className="relative py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-center">
                <div className="text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                    {t("bottom-cta.title")}
                  </h2>
                  <p className="text-xl text-blue-200 mb-8">
                    {t("bottom-cta.subtitle")}
                  </p>
                  <button
                    onClick={handleNavigateToPricing}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t("bottom-cta.button")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Modal Overlays */}
      {modal === "phone" && (
        <ModalWrapper
          isOpen={true}
          onClose={handleModalClose}
          modalId="phone"
          description={t("modal-wrapper.phone.description")}
          title={t("modal-wrapper.phone.title")}
        >
          <ConfirmationCodeForm onShowContactForm={handleShowContactForm} />
        </ModalWrapper>
      )}

      {modal === "login" && (
        <ModalWrapper
          description={t("modal-wrapper.login.description")}
          title={t("modal-wrapper.login.title")}
          isOpen={true}
          onClose={handleModalClose}
          modalId="login"
        >
          <ConfirmationCodeForm
            isLoginMode={true}
            isEmailMode={true}
            setIsEmailVerified={setIsEmailVerified}
          />
        </ModalWrapper>
      )}

      {modal === "contact" && (
        <ModalWrapper
          isOpen={true}
          onClose={handleModalClose}
          modalId="contact"
          description={t("modal-wrapper.contact.description")}
          title={t("modal-wrapper.contact.title")}
        >
          <ContactForm
            isEmailVerified={isEmailVerified}
            verifiedPhoneNumber={verifiedPhoneNumber}
            selectedProduct={selectedProduct}
          />
        </ModalWrapper>
      )}

      {modal === "already-subscribed" && (
        <ModalWrapper
          isOpen={true}
          onClose={handleModalClose}
          modalId="contact"
          description={t("modal-wrapper.contact.description")}
          title={t("modal-wrapper.contact.title")}
        >
          <InformationModal
            message={t("modal-wrapper.already-subscribed.description")}
            acknowledgeText={t(
              "modal-wrapper.already-subscribed.acknowledgeText",
            )}
            handleModalClose={handleModalClose}
          />
        </ModalWrapper>
      )}

      {/* Testing Tools Widget */}
      <TestingToolsWrapper />
    </div>
  );
}
