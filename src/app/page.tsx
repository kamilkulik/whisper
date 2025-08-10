'use client';

import { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isFormShaking, setIsFormShaking] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      quote: "Oh my goodness...these letters make me feel the experience of living out WW2... I get so excited when my letters arrive, and make a cup of coffee and enjoy traveling with Audrey Rose & Charlie. Love story set in 1944 with facts & fiction. Keep 'em coming!",
      author: "Ann Cooper",
      status: "Verified Customer"
    },
    {
      quote: "The poems have become my daily meditation. Each morning brings a new perspective and a fresh start to my day. The curation is absolutely exceptional.",
      author: "Maria Nowak",
      status: "Poetry Lover"
    },
    {
      quote: "Wieczorny Szept has rekindled my love for poetry. The quality and selection of poems is outstanding. I look forward to each new piece.",
      author: "Piotr Kowalski",
      status: "Writer"
    },
    {
      quote: "Perfect for my evening routine. The poems speak directly to my soul and help me unwind after a long day. Highly recommended!",
      author: "Ewa Michalska",
      status: "Teacher"
    },
    {
      quote: "These letters transport me to different worlds and times. The historical accuracy combined with beautiful storytelling is simply magical.",
      author: "Tomasz Wiśniewski",
      status: "History Enthusiast"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const handleStartJourney = () => {
    console.log('Start Journey clicked!'); // Debug log
    
    // Focus the first input field in the contact form
    const firstInput = document.querySelector('#imie') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
      console.log('Input focused'); // Debug log
    }
    
    // Trigger shake animation
    console.log('Setting shake to true'); // Debug log
    setIsFormShaking(true);
    setTimeout(() => {
      console.log('Setting shake to false'); // Debug log
      setIsFormShaking(false);
    }, 600); // Animation duration
  };

  const handleStartJourneyWithScroll = () => {
    console.log('Start Journey with scroll clicked!'); // Debug log
    
    // Smooth scroll to the contact form
    const formContainer = document.querySelector('#contact-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
    
    // Add a delay before focusing and shaking to allow scroll to complete
    setTimeout(() => {
      // Focus the first input field in the contact form
      const firstInput = document.querySelector('#imie') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        console.log('Input focused after scroll'); // Debug log
      }
      
      // Trigger shake animation
      console.log('Setting shake to true after scroll'); // Debug log
      setIsFormShaking(true);
      setTimeout(() => {
        console.log('Setting shake to false'); // Debug log
        setIsFormShaking(false);
      }, 600); // Animation duration
    }, 800); // Wait for scroll to complete
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E]">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/20 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="text-white font-bold text-xl">▲ WIECZORNY SZEPT</div>
            <div className="hidden md:flex space-x-6">
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-white hover:text-blue-200 transition-colors">Log in</a>
            <button onClick={handleStartJourney} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors inline-block cursor-pointer">
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
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              {/* Left Side - Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-4xl font-bold text-white leading-tight">
                  Otrzymuj codzienny szept, który{' '}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ogrzeje</span>{' '}
                    Twoje serce — prosto na Twój telefon.
                  </h1>
                </div>
                
                <p className="text-xl text-white leading-relaxed">
                  Krótka wiadomość, pełna ciepła i magii słów. Każdego wieczoru, o tej samej porze.
                  <br />
                  Darmowy dostęp przez 7 dni.
                  <br />
                  Możesz anulować w każdej chwili.
                </p>
                
                <button onClick={handleStartJourney} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
                  Wyślij mi pierwszy szept &gt;
                </button>
                
                <div className="flex items-center space-x-4 pt-8">
                  <div className="flex -space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Join over 25,000 poetry lovers worldwide.</p>
                    <p className="text-blue-200">Daily inspiration delivered to your inbox.</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Form */}
              <div id="contact-form-container" className={`relative -mt-12 ${isFormShaking ? 'shake-form' : ''}`}>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>

        {/* Smartphone Notification Section */}
        <div className="relative min-h-[80vh] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              {/* Left Side - Smartphone Image */}
              <div className="relative flex justify-center items-center h-[550px] lg:col-span-3">
                <img 
                  src="/phone.png" 
                  alt="Smartphone showing Wieczorny Szept notification" 
                  className="w-full max-h-full object-contain drop-shadow-3xl rounded-2xl"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))'
                  }}
                />
              </div>

              {/* Right Side - Polish Copy */}
              <div className="h-[550px] overflow-hidden flex flex-col justify-center lg:col-span-2">
                <div className="space-y-4 max-h-full">
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Codzienna wiadomość, której nie możesz się doczekać
                </h2>
                <p className="text-lg text-blue-200 leading-relaxed">
                  Otrzymuj piękne wiersze prosto na swój telefon każdego dnia. Każdy SMS to nowa historia, nowe emocje i nowa perspektywa na życie. Dołącz do tysięcy miłośników poezji, którzy rozpoczynają każdy dzień od słów, które poruszają duszę. 
                </p>
                <div className="flex items-center space-x-4">
                  <button onClick={handleStartJourneyWithScroll} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform cursor-pointer">
                    Rozpocznij Darmowy Trial
                  </button>
                  <div className="text-white text-sm">
                    <p className="font-medium">✓ Darmowy przez 7 dni</p>
                    <p className="text-blue-200">✓ Anuluj w każdej chwili</p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="relative py-32">
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative group">
              {/* Floating Navigation Arrows */}
              <button 
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 z-10"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 z-10"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Testimonial Content with Slide Transition */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 text-center text-white">
                      {/* Star Rating */}
                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-8 h-8 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
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
                        <p className="text-white/80 font-medium">- {testimonial.author}, {testimonial.status}</p>
                      </div>
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
                      i === currentTestimonial ? 'bg-white' : 'bg-white/30'
                    }`}
                    onClick={() => goToTestimonial(i)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* CTA Section */}
      <div className="bg-[#2A031E] text-white relative overflow-hidden">
        <div className="relative py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
              <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                Join thousands of poetry enthusiasts who have discovered the transformative power of carefully curated lyrical expressions.
              </p>
              <button onClick={handleStartJourneyWithScroll} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg inline-block transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer relative z-10">
                Start Your Free Trial &gt;
              </button>
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
                <h3 className="text-2xl font-bold mb-8 elegant-text">Więcej Informacji</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Logowanie</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Daty Wysyłki</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Druk Prezentowy</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Tapety do Pobrania</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Rozszerzone Materiały</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Kontakt</a></li>
                </ul>
              </div>

              {/* Middle Column - Links */}
              <div>
                <h3 className="text-2xl font-bold mb-8 elegant-text">Doświadczenie</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Regulamin</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Polityka Prywatności</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Zwroty i Refundacje</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Zastrzeżenia</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white transition-colors">Polityka Wysyłki</a></li>
                </ul>
              </div>

              {/* Right Column - Newsletter */}
              <div>
                <h3 className="text-2xl font-bold mb-8 elegant-text">Newsletter</h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Zapisz się, aby otrzymywać ekskluzywne oferty, oryginalne historie, wydarzenia i więcej.
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
                <a href="#" className="text-white/60 hover:text-white transition-colors">Regulamin</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">Polityka Prywatności</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">Bezpieczeństwo</a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
