'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';

export default function ContactForm() {
  const { language, countryCode, isLoaded } = useLocale();

  const [formData, setFormData] = useState({
    numerTelefonu: '',
    email: '',
    imie: '',
    countryCode: '+48', // Default fallback
    jezykWiadomosci: 'Polski', // Default fallback
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Update form data when locale context is loaded
  useEffect(() => {
    if (isLoaded) {
      setFormData(prev => ({
        ...prev,
        countryCode: countryCode,
        jezykWiadomosci: language
      }));
    }
  }, [isLoaded, countryCode, language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate terms and conditions acceptance
    if (!formData.acceptTerms) {
      setMessage('Musisz zaakceptować regulamin usługi, aby kontynuować.');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, save the contact information
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Informacje zapisane! Przekierowywanie do kasy...');
        
        // Clear the form
        setFormData({ numerTelefonu: '', email: '', imie: '', countryCode: countryCode, jezykWiadomosci: language, acceptTerms: false });
        
        // Redirect to Stripe checkout after a short delay
        setTimeout(() => {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = '/api/checkout_sessions';
          document.body.appendChild(form);
          form.submit();
        }, 1500);
        
      } else {
        setMessage(data.error || 'Wystąpił błąd podczas wysyłania wiadomości.');
      }
    } catch (error) {
      setMessage('Wystąpił błąd podczas wysyłania wiadomości.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Zacznij otrzymywać wiadomości!
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imie" className="block text-white font-medium mb-2 text-sm">
            Imię *
          </label>
          <input
            type="text"
            id="imie"
            name="imie"
            value={formData.imie}
            onChange={handleChange}
            required
            className="w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            placeholder="Wpisz swoje imię"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-white font-medium mb-2 text-sm">
            Adres email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            placeholder="np. jan.kowalski@email.com"
          />
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-2">
          <div className="h-full">
            <label htmlFor="countryCode" className="block text-white font-medium mb-2 text-sm">
              Kod kraju *
            </label>
            <div className="relative">
              <select
                id="countryCode"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-32 h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm appearance-none pr-10"
              >
                <option value="+48" className="bg-gray-800 text-white">+48 Polska</option>
                <option value="+44" className="bg-gray-800 text-white">+44 Wielka Brytania</option>
                <option value="+1" className="bg-gray-800 text-white">+1 Stany Zjednoczone</option>
                <option value="+34" className="bg-gray-800 text-white">+34 Hiszpania</option>
                <option value="+52" className="bg-gray-800 text-white">+52 Meksyk</option>
                <option value="+56" className="bg-gray-800 text-white">+56 Chile</option>
                <option value="+39" className="bg-gray-800 text-white">+39 Włochy</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="h-full">
            <label htmlFor="numerTelefonu" className="block text-white font-medium mb-2 text-sm">
              Numer telefonu *
            </label>
            <input
              type="tel"
              id="numerTelefonu"
              name="numerTelefonu"
              value={formData.numerTelefonu}
              onChange={handleChange}
              required
              className="h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
              placeholder="np. 123 456 789"
            />
          </div>
        </div>

        <div>
          <label htmlFor="jezykWiadomosci" className="block text-white font-medium mb-2 text-sm">
            Język wiadomości *
          </label>
          <div className="relative">
            <select
              id="jezykWiadomosci"
              name="jezykWiadomosci"
              value={formData.jezykWiadomosci}
              onChange={handleChange}
              required
              className="w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm appearance-none pr-10"
          >
              <option value="Polski" className="bg-gray-800 text-white">Polski</option>
              <option value="Angielski" className="bg-gray-800 text-white">Angielski</option>
              <option value="Hiszpański" className="bg-gray-800 text-white">Hiszpański</option>
              <option value="Włoski" className="bg-gray-800 text-white">Włoski</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

              {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          {/* <span className="px-3 text-sm text-gray-500 dark:text-gray-400">lub</span> */}
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className={`flex items-center space-x-3 ${
          !formData.acceptTerms && message.includes('regulamin') 
            ? 'p-3 border border-red-300 rounded-2xl bg-red-500/20' 
            : ''
        }`}>
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            required
            className={`h-5 w-5 text-white focus:ring-white/30 rounded ${
              !formData.acceptTerms && message.includes('regulamin')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-white/30 bg-white/20'
            }`}
          />
          <label htmlFor="acceptTerms" className="text-sm text-white/90">
            Akceptuję{' '}
            <a 
              href="/regulamin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline hover:text-white/80"
            >
              regulamin usługi
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg shadow-lg"
        >
          {isSubmitting ? 'WYSYŁANIE...' : 'WYŚLIJ'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-2xl text-sm backdrop-blur-sm ${
          message.includes('zapisane') 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-red-500/20 text-red-100 border border-red-400/30'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 