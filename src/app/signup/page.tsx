import ContactForm from '../components/ContactForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Join Wieczorny Szept
          </h1>
          <p className="text-lg text-blue-200">
            Start your journey with our AI tutor
          </p>
        </div>
        
        <ContactForm />
      </div>
    </div>
  );
} 