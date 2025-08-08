'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
            <a href="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors inline-block">
              Subscribe Now
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content - All sections with continuous background */}
      <div className="">
        {/* Hero Section */}
        <div className="relative min-h-screen">
          {/* Hero Background Gradients */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-12 pt-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              {/* Left Side - Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Discover the world's most{' '}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">beautiful</span>{' '}
                    lyrical expressions.
                  </h1>
                </div>
                
                <p className="text-xl text-white leading-relaxed">
                  Immerse yourself in carefully curated poems and lyrical messages delivered to your inbox. Experience the power of words that touch your soul, inspire your mind, and awaken your emotions.
                </p>
                
                <a href="/signup" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105">
                  Start Your Journey &gt;
                </a>
                
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

              {/* Right Side - Poetry Preview */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                  {/* Poetry Frame */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-xl overflow-hidden">
                    {/* Top Section - Poem preview */}
                    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6">
                      <div className="text-white">
                        <p className="font-semibold text-lg mb-2">"Evening Whispers"</p>
                        <p className="text-blue-100 italic">by Maria Nowak</p>
                      </div>
                    </div>
                    
                    {/* Bottom Section - Poem content */}
                    <div className="p-6 bg-gradient-to-br from-gray-800/90 to-gray-700/90 relative">
                      <div className="text-white space-y-3">
                        <p className="text-sm leading-relaxed">
                          "In the quiet of twilight's embrace,<br/>
                          Where shadows dance with gentle grace,<br/>
                          The evening whispers secrets sweet,<br/>
                          As day and night in harmony meet."
                        </p>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                        <div className="absolute top-4 right-6 w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                        <div className="absolute bottom-4 left-8 w-1 h-1 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"></div>
                        <div className="absolute bottom-2 right-4 w-1 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                      </div>
                      
                      {/* Read more button */}
                      <button className="absolute bottom-4 right-4 bg-gradient-to-r from-white to-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-gray-100 hover:to-white transition-all duration-300 shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Read more</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smartphone Notification Section */}
        <div className="relative min-h-[80vh] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Smartphone Video */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50">
                  {/* Smartphone Frame */}
                  <div className="w-64 h-96 mx-auto bg-black rounded-3xl p-2 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl relative overflow-hidden">
                      {/* Notification Animation */}
                      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 2.007a1 1 0 00-.471 1.897l.707.703L14.414 15H16a1 1 0 001-1V4a1 1 0 00-1-1H2.003zM18 4v10a3 3 0 01-3 3H4.414l-1.703 1.704a1 1 0 01-1.414-1.414L2.586 16H3a1 1 0 001-1V4a1 1 0 00-1-1H2.003z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Wieczorny Szept</p>
                            <p className="text-xs text-gray-600">Nowy wiersz czeka na Ciebie</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* App Interface */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <div className="text-white text-center">
                            <p className="text-sm font-medium mb-2">"Wieczorne Szepty"</p>
                            <p className="text-xs opacity-80">Kliknij, aby przeczytać</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Polish Copy */}
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Codzienny SMS którego nie będziesz mogła się doczekać
                </h2>
                <p className="text-xl text-blue-200 leading-relaxed">
                  Otrzymuj piękne wiersze prosto na swój telefon każdego dnia. Każdy SMS to nowa historia, nowe emocje i nowa perspektywa na życie. Dołącz do tysięcy miłośników poezji, którzy rozpoczynają każdy dzień od słów, które poruszają duszę.
                </p>
                <div className="flex items-center space-x-4">
                  <a href="/signup" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105">
                    Rozpocznij Darmowy Trial
                  </a>
                  <div className="text-white text-sm">
                    <p className="font-medium">✓ Darmowy przez 7 dni</p>
                    <p className="text-blue-200">✓ Anuluj w każdej chwili</p>
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
              <a href="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors inline-block">
                Start Your Free Trial &gt;
              </a>
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
