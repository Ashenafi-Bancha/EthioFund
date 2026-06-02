import { ArrowLeft } from 'lucide-react';

interface PageBackButtonProps {
  onBack: () => void;
  label?: string;
  className?: string;
}

export function PageBackButton({ onBack, label = 'Back', className = 'mb-6' }: PageBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className={`flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 ${className}`}
    >
      <ArrowLeft className="h-5 w-5" />
      {label}
    </button>
  );
}
