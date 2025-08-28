export function SuccessMessage({
  isLoginMode = false,
}: {
  isLoginMode?: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {isLoginMode ? "Logowanie udane!" : "Numer potwierdzony!"}
        </h3>
        <p className="text-white/80 text-lg">
          {isLoginMode
            ? "Zostałeś pomyślnie zalogowany do swojego konta."
            : "Twój numer telefonu został pomyślnie zweryfikowany."}
        </p>
      </div>
    </div>
  );
}
