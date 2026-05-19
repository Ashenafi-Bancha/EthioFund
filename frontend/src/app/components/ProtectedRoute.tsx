import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate?: (page: string) => void;
}

export function ProtectedRoute({ children, onNavigate }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (user) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <p className="mb-4 text-gray-700">You must be logged in to access this area.</p>
      <div className="flex justify-center">
        <button
          onClick={() => (onNavigate ? onNavigate('auth') : window.location.reload())}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default ProtectedRoute;
