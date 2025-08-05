import ContactForm from './components/ContactForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Wieczorny Szept
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Skontaktuj się z nami
          </p>
        </div>
        
        <ContactForm />
      </div>
    </div>
  );
}
