'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    numerTelefonu: '',
    email: '',
    imie: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

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
        setFormData({ numerTelefonu: '', email: '', imie: '' });
        
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Formularz kontaktowy
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imię *
          </label>
          <input
            type="text"
            id="imie"
            name="imie"
            value={formData.imie}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Wprowadź swoje imię"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Wprowadź swój email"
          />
        </div>

        <div>
          <label htmlFor="numerTelefonu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numer telefonu *
          </label>
          <input
            type="tel"
            id="numerTelefonu"
            name="numerTelefonu"
            value={formData.numerTelefonu}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Wprowadź numer telefonu"
          />
        </div>

              {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          {/* <span className="px-3 text-sm text-gray-500 dark:text-gray-400">lub</span> */}
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Wysyłanie...' : 'Wyślij i przejdź do kasy'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.includes('zapisane') 
            ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
            : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 