"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConfirmationCodeForm from "./_components/ConfirmationCodeForm";
import ContactForm from "./_components/ContactForm";
import TestimonialsCarousel from "./_components/TestimonialsCarousel";
import ImageCarousel from "./_components/ImageCarousel";
import HowItWorks from "./_components/HowItWorks";
import PricingSection from "./_components/PricingSection";
import { ModalWrapper } from "./_components/ModalWrapper";
import TestingToolsWrapper from "./_components/TestingToolsWrapper";

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  // const [showContactForm, setShowContactForm] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<
    "trial" | "one-time" | "subscription" | null
  >(null);

  // Get modal from search params
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle modal deep links - scroll to pricing section when modal is present (except login)
  useEffect(() => {
    if (modal && modal !== "login") {
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

  // Testimonial data
  const testimonials = [
    {
      quote:
        "Te wiadomości to małe klejnoty dnia. Czasem jedno zdanie wystarczy, by poczuć się potrzebną",
      author: "Zosia",
      status: "emerytka",
    },
    {
      quote:
        "Otwieram SMS i nagle w pokoju robi się jaśniej, choć lampy się nie zmieniają",
      author: "Gocha",
      status: "matka",
    },
    {
      quote:
        "Wieczorny Szept” to codzienny list od życia — czuły, lekki, potrzebny",
      author: "Maryla",
      status: "miłośniczka poezji",
    },
    {
      quote:
        "Każdy wieczór z „Wieczornym Szeptem” staje się cieplejszy. Te krótkie wersy przypominają mi, że serce nadal potrafi drżeć",
      author: "Amelia",
      status: "nauczycielka",
    },
    {
      quote:
        "Dzięki nim znów czuję się jak młoda dziewczyna czekająca na list od ukochanego",
      author: "Kasia",
      status: "matka",
    },
    {
      quote:
        "Wasze szepty są jak filiżanka herbaty wypita przy kominku — krótko, ale w sam raz dla duszy",
      author: "Dorota",
      status: "opiekunka",
    },
    {
      quote:
        "Te krótkie smsiki w kilku słowach potrafią obudzić wspomnienia, których dawno już nie odwiedzałam",
      author: "Ania",
      status: "podróżniczka",
    },
    {
      quote:
        "Nie wiedziałam, że SMS może być jak dotyk — delikatny, ciepły, kojący",
      author: "Domi",
      status: "fanka",
    },
  ];

  // Image carousel data
  const carouselImages = [
    { src: "/szept_1.png", alt: "Wieczorny Szept Image 1" },
    { src: "/szept_2.png", alt: "Wieczorny Szept Image 2" },
    { src: "/szept_3.png", alt: "Wieczorny Szept Image 3" },
    { src: "/szept_4.png", alt: "Wieczorny Szept Image 4" },
  ];

  const handleStartJourneyWithScroll = (
    productType?: "trial" | "one-time" | "subscription"
  ) => {
    console.log("Start Journey with scroll clicked!", productType); // Debug log

    // Set the selected product
    setSelectedProduct(productType || "trial");

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

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E] relative">
        {/* Navigation Bar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${
            scrolled
              ? "bg-black/20 backdrop-blur-md shadow-lg"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-8">
              <div className="text-white font-bold text-xl">
                ▲ WIECZORNY SZEPT
              </div>
              <div className="hidden md:flex space-x-6"></div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={handleLoginClick}
                className="text-white hover:text-blue-200 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={handleNavigateToPricing}
                className="hidden sm:inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Zacznij teraz
              </button>
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
                    <h1 className="text-5xl lg:text-4xl font-bold text-white leading-tight">
                      Otrzymuj codzienny szept, który{" "}
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ogrzeje
                      </span>{" "}
                      Twoje serce — prosto na Twój telefon.
                    </h1>
                  </div>

                  <p className="text-xl text-white leading-relaxed md:max-lg:text-2xl">
                    Krótka wiadomość, pełna ciepła i magii słów.
                    <br />
                    Każdego wieczoru, o tej samej porze.
                    <br />
                    Darmowy dostęp przez 7 dni.
                    <br />
                    Możesz anulować w każdej chwili.
                  </p>

                  <button
                    onClick={handleNavigateToPricing}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  >
                    Wyślij mi pierwszy szept &gt;
                  </button>

                  <div className="flex items-center space-x-4 pt-8">
                    <div className="flex -space-x-2">
                      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src="/face_1.png"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src="/face_2.png"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src="/face_3.png"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="text-white">
                      {/* <p className="font-medium">
                        Join over 25,000 poetry lovers worldwide.
                      </p> */}
                      <p className="text-blue-200">
                        Pierwszy szept dziś wieczorem o 20:59
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image Carousel */}
                <div className="mt-12 lg:mt-0 lg:col-span-3 relative">
                  <ImageCarousel images={carouselImages} />
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <HowItWorks onGetStarted={handleNavigateToPricing} />

          {/* Smartphone Notification Section */}
          <div className="relative min-h-[80vh] flex items-center">
            <div className="max-w-7xl md:max-lg:max-w-4xl mx-auto px-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-stretch">
                {/* Image */}
                <div className="relative flex justify-center items-center h-[400px] lg:h-[550px] lg:col-span-3">
                  <img
                    src="/szept_4.png"
                    alt="Smartphone showing Wieczorny Szept notification"
                    className="w-full max-h-full object-contain drop-shadow-3xl rounded-2xl"
                    style={{
                      filter:
                        "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="lg:col-span-2 flex flex-col justify-between space-y-12 lg:space-y-0 md:my-12 xl:my-2">
                  <h2 className="text-4xl lg:text-4xl text-center font-bold text-white leading-tight">
                    Słowa, które zostają z Tobą na{" "}
                    <span className=" bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      długo
                    </span>
                  </h2>

                  <p className="text-2xl lg:text-xl text-blue-200 text-justify leading-relaxed">
                    To nie są przypadkowe cytaty. Każdy szept jest pisany
                    ręcznie przez poetę, który od lat tworzy krótkie formy pełne
                    emocji.
                    <br />
                    <br />
                    Są jak małe listy miłosne — tylko że mieszczą się w jednym
                    SMS-ie. Idealne, by zakończyć dzień z uśmiechem.
                  </p>

                  <div className="flex flex-col md:max-lg:flex-row md:max-lg:space-x-8 md:max-lg:justify-center items-center">
                    <button
                      onClick={handleNavigateToPricing}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-2xl lg:text-xl transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform cursor-pointer"
                    >
                      Rozpocznij Okres Próbny
                    </button>
                    <div className="text-white text-2xl lg:text-xl mt-4">
                      <p className="font-medium">✓ Darmowy przez 7 dni</p>
                      <p className="text-blue-200">✓ Anuluj w każdej chwili</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <TestimonialsCarousel testimonials={testimonials} />

          {/* Pricing Section */}
          <div id="pricing-section">
            <PricingSection onGetStarted={handleStartJourneyWithScroll} />
          </div>
        </div>
      </div>
      {/* Contact Form Section */}
      <div className="bg-[#2A031E] text-white relative overflow-hidden">
        <div className="relative py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center">
              <div className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Gotowa/y na swój pierwszy szept?
                </h2>
                <p className="text-xl text-blue-200 mb-8">
                  Dołącz do tysięcy czytelników, którzy każdego wieczoru
                  otrzymują ciepłe słowa
                </p>
                <button
                  onClick={handleNavigateToPricing}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rozpocznij darmowy okres próbny
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        {/* Footer Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl"></div>
        </div>

        {/* Main Footer Content */}
        <div className="relative pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-12 mb-12 px-12">
              {/* Middle Column - Links */}
              <div className="col-span-2">
                <h3 className="text-2xl font-bold mb-8 elegant-text">
                  Dowiedz się więcej
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Regulamin
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Polityka Prywatności
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Zwroty i Refundacje
                    </a>
                  </li>
                </ul>
              </div>

              {/* Right Column - Newsletter */}
              <div className="col-span-3">
                <h3 className="text-2xl font-bold mb-8 elegant-text">
                  Newsletter
                </h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Zapisz się, aby otrzymywać ekskluzywne oferty, oryginalne
                  historie, wydarzenia i więcej.
                </p>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Wprowadź swój adres email"
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors"
                  />

                  <button className="bg-[#F5F5DC] text-[#2A031E] px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="relative border-t border-white/20 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-white/60 text-sm">
                © 2025 Wieczorny Szept. Wszelkie prawa zastrzeżone.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlays */}
      {modal === "phone" && (
        <ModalWrapper isOpen={true} onClose={handleModalClose} modalId="phone">
          <ConfirmationCodeForm onShowContactForm={handleShowContactForm} />
        </ModalWrapper>
      )}

      {modal === "login" && (
        <ModalWrapper isOpen={true} onClose={handleModalClose} modalId="login">
          <ConfirmationCodeForm isLoginMode={true} isEmailMode={true} />
        </ModalWrapper>
      )}

      {modal === "contact" && (
        <ModalWrapper
          isOpen={true}
          onClose={handleModalClose}
          modalId="contact"
        >
          <ContactForm
            verifiedPhoneNumber={verifiedPhoneNumber}
            selectedProduct={selectedProduct}
          />
        </ModalWrapper>
      )}

      {/* Testing Tools Widget */}
      <TestingToolsWrapper />
    </div>
  );
}
