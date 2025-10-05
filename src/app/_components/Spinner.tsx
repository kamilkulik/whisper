interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-[6px]",
  };

  return (
    <span
      className={`inline-block ${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
