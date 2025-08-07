'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overscroll-none">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overscroll-none ${
        scrolled 
          ? 'bg-blue-900/80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="text-white font-bold text-xl">▲ WIESZCZORNY SZEPT</div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Poems</a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Collections</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-white hover:text-blue-200 transition-colors hidden md:block">For Writers</a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors hidden md:block">Gift Subscription</a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors">Log in</a>
            <a href="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors inline-block">
              Subscribe Now
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {/* Hero Section - Gradient Background */}
        <div className="relative overflow-hidden">
          {/* Background gradient with gentle shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Discover the world's most{' '}
                    <span className="bg-purple-400 bg-opacity-20 px-2 rounded">beautiful</span>{' '}
                    lyrical expressions.
                  </h1>
                </div>
                
                <p className="text-xl text-white leading-relaxed">
                  Immerse yourself in carefully curated poems and lyrical messages delivered to your inbox. Experience the power of words that touch your soul, inspire your mind, and awaken your emotions.
                </p>
                
                <a href="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors inline-block">
                  Start Your Journey &gt;
                </a>
                
                <div className="flex items-center space-x-4 pt-8">
                  <div className="flex -space-x-2">
                    <div className="w-12 h-12 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="w-12 h-12 bg-gray-400 rounded-full border-2 border-white"></div>
                    <div className="w-12 h-12 bg-gray-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Join over 25,000 poetry lovers worldwide.</p>
                    <p className="text-blue-200">Daily inspiration delivered to your inbox.</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Poetry Preview */}
              <div className="relative">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                  {/* Poetry Frame */}
                  <div className="bg-gray-900/90 rounded-xl overflow-hidden">
                    {/* Top Section - Poem preview */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                      <div className="text-white">
                        <p className="font-semibold text-lg mb-2">"Evening Whispers"</p>
                        <p className="text-blue-100 italic">by Maria Nowak</p>
                      </div>
                    </div>
                    
                    {/* Bottom Section - Poem content */}
                    <div className="p-6 bg-gray-800/90 relative">
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
                        <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400 rounded-full"></div>
                        <div className="absolute top-4 right-6 w-1 h-1 bg-pink-400 rounded-full"></div>
                        <div className="absolute bottom-4 left-8 w-1 h-1 bg-green-400 rounded-full"></div>
                        <div className="absolute bottom-2 right-4 w-1 h-1 bg-purple-400 rounded-full"></div>
                      </div>
                      
                      {/* Read more button */}
                      <button className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors">
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

        {/* Features Section - Mesh Gradient Background */}
        <div className="relative overflow-hidden">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.3),transparent_50%)]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Why Choose Wieczorny Szept?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-semibold mb-3">Curated Excellence</h3>
                  <p className="text-blue-200">Every poem is carefully selected to inspire and move you.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-semibold mb-3">Daily Inspiration</h3>
                  <p className="text-blue-200">Start each day with beautiful words that touch your soul.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-semibold mb-3">Global Community</h3>
                  <p className="text-blue-200">Join thousands of poetry lovers from around the world.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collections Section - Geometric Shapes Background */}
        <div className="relative overflow-hidden">
          {/* Geometric background with shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-800">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rotate-45"></div>
              <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/20 rounded-full"></div>
              <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-indigo-500/20 transform rotate-12"></div>
              <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-500/20 rounded-full"></div>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Featured Collections</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
                  <h3 className="text-2xl font-semibold mb-4">Love & Romance</h3>
                  <p className="text-blue-200 mb-4">Timeless verses that capture the essence of love in all its forms.</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Explore Collection
                  </button>
                </div>
                <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-lg p-8 border border-green-500/30">
                  <h3 className="text-2xl font-semibold mb-4">Nature & Seasons</h3>
                  <p className="text-blue-200 mb-4">Poems that celebrate the beauty and rhythm of the natural world.</p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Explore Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section - Wave Pattern Background */}
        <div className="relative overflow-hidden">
          {/* Wave pattern background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <svg className="absolute bottom-0 left-0 w-full h-32 text-purple-800/30" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor"></path>
            </svg>
            <svg className="absolute top-0 right-0 w-full h-32 text-blue-800/30" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M1200,120V0H0V120Z" fill="currentColor"></path>
            </svg>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-6">What Our Readers Say</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <p className="text-blue-200 mb-4 italic">"The poems have become my daily meditation. Each morning brings a new perspective."</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">Anna K.</p>
                      <p className="text-sm text-blue-300">Poetry Lover</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <p className="text-blue-200 mb-4 italic">"Wieczorny Szept has rekindled my love for poetry. The curation is exceptional."</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">Marek W.</p>
                      <p className="text-sm text-blue-300">Writer</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <p className="text-blue-200 mb-4 italic">"Perfect for my evening routine. The poems speak directly to my soul."</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">Ewa M.</p>
                      <p className="text-sm text-blue-300">Teacher</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - Radial Gradient Background */}
        <div className="relative overflow-hidden">
          {/* Radial gradient background */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900 via-blue-900 to-indigo-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.2),transparent_70%)]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-16">
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
      </div>

      {/* Bottom Banner */}
      <div className="bg-gradient-to-r from-green-400 to-yellow-400 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <a href="/signup" className="flex items-center justify-center space-x-4 text-white font-medium hover:text-gray-100 transition-colors">
            <span>Limited-time offer! Get 3 months of poetry for just $2.99/mo. Start your free trial today.</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
