'use client';

import { useState } from 'react';

interface StripeCheckoutProps {
  buttonText?: string;
  title?: string;
  className?: string;
}

export default function StripeCheckout({ 
  buttonText = "Przejdź do kasy", 
  title = "Kup teraz",
  className = ""
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    setIsLoading(true);
    // The form will automatically submit to the API route
    // and redirect to Stripe checkout
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {title}
      </h2>
      <form action="/api/checkout_sessions" method="POST" onSubmit={handleSubmit}>
        <section>
          <button 
            type="submit" 
            role="link"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isLoading ? 'Przekierowywanie...' : buttonText}
          </button>
        </section>
      </form>
    </div>
  );
} 