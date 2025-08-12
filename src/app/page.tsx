"use client";

import { useState, useEffect } from "react";
import ConfirmationCodeForm from "./components/ConfirmationCodeForm";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import ImageCarousel from "./components/ImageCarousel";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isFormShaking, setIsFormShaking] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  ];

  const handleStartJourneyWithScroll = () => {
    console.log("Start Journey with scroll clicked!"); // Debug log

    // Smooth scroll to the contact form
    const formContainer = document.querySelector("#contact-form-container");
    if (formContainer) {
      formContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Add a delay before focusing and shaking to allow scroll to complete
    setTimeout(() => {
      // Focus the first input field in the contact form
      const firstInput = document.querySelector("#imie") as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        console.log("Input focused after scroll"); // Debug log
      }

      // Trigger shake animation
      console.log("Setting shake to true after scroll"); // Debug log
      setIsFormShaking(true);
      setTimeout(() => {
        console.log("Setting shake to false"); // Debug log
        setIsFormShaking(false);
      }, 600); // Animation duration
    }, 800); // Wait for scroll to complete
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E]">
        {/* Navigation Bar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
              <a
                href="#"
                className="text-white hover:text-blue-200 transition-colors"
              >
                Log in
              </a>
              <button
                onClick={handleStartJourneyWithScroll}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors inline-block cursor-pointer"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content - All sections with continuous background */}
        <div className="">
          {/* Hero Section */}
          <div className="relative min-h-screen">
            {/* Hero Background Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
              <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-12 pt-32">
              <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[80vh]">
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

                  <p className="text-xl text-white leading-relaxed">
                    Krótka wiadomość, pełna ciepła i magii słów. Każdego
                    wieczoru, o tej samej porze.
                    <br />
                    Darmowy dostęp przez 7 dni.
                    <br />
                    Możesz anulować w każdej chwili.
                  </p>

                  <button
                    onClick={handleStartJourneyWithScroll}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  >
                    Wyślij mi pierwszy szept &gt;
                  </button>

                  <div className="flex items-center space-x-4 pt-8">
                    <div className="flex -space-x-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full border-2 border-white"></div>
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
                <div className="lg:col-span-3 relative">
                  <ImageCarousel images={carouselImages} />
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <HowItWorks onGetStarted={handleStartJourneyWithScroll} />

          {/* Smartphone Notification Section */}
          <div className="relative min-h-[80vh] flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid lg:grid-cols-5 gap-12 items-center">
                {/* Left Side - Smartphone Image */}
                <div className="relative flex justify-center items-center h-[550px] lg:col-span-3">
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

                {/* Right Side - Polish Copy */}
                <div className="h-[550px] overflow-hidden flex flex-col justify-center lg:col-span-2">
                  <div className="space-y-4 max-h-full">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                      Słowa, które zostają z Tobą na{" "}
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        długo
                      </span>
                    </h2>
                    <p className="text-lg text-blue-200 leading-relaxed">
                      To nie są przypadkowe cytaty. Każdy szept jest pisany
                      ręcznie przez poetę, który od lat tworzy krótkie formy
                      pełne emocji.
                      <br />
                      Są jak małe listy miłosne — tylko że mieszczą się w jednym
                      SMS-ie. Idealne, by zakończyć dzień z uśmiechem.
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleStartJourneyWithScroll}
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform cursor-pointer"
                      >
                        Rozpocznij Okres Próbny
                      </button>
                      <div className="text-white text-sm">
                        <p className="font-medium">✓ Darmowy przez 7 dni</p>
                        <p className="text-blue-200">
                          ✓ Anuluj w każdej chwili
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <TestimonialsCarousel testimonials={testimonials} />

          {/* Pricing Section */}
          <PricingSection onGetStarted={handleStartJourneyWithScroll} />
        </div>
      </div>
      {/* Contact Form Section */}
      <div className="bg-[#2A031E] text-white relative overflow-hidden z-50">
        <div className="relative py-16 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center">
              <div
                id="contact-form-container"
                className={`relative z-50 ${isFormShaking ? "shake-form" : ""}`}
              >
                <ConfirmationCodeForm />
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        {/* Footer Background Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl"></div>
        </div>

        {/* Main Footer Content */}
        <div className="relative pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              {/* Left Column - More Info */}
              <div>
                <h3 className="text-2xl font-bold mb-8 elegant-text">
                  Więcej Informacji
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Logowanie
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Daty Wysyłki
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Druk Prezentowy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Tapety do Pobrania
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Rozszerzone Materiały
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Kontakt
                    </a>
                  </li>
                </ul>
              </div>

              {/* Middle Column - Links */}
              <div>
                <h3 className="text-2xl font-bold mb-8 elegant-text">
                  Doświadczenie
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
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Zastrzeżenia
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      Polityka Wysyłki
                    </a>
                  </li>
                </ul>
              </div>

              {/* Right Column - Newsletter */}
              <div>
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
                © 2024 Wieczorny Szept. Wszelkie prawa zastrzeżone.
              </div>
              <div className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Regulamin
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Polityka Prywatności
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Bezpieczeństwo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
