import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  roles: string[];
  onNavigate?: (page: string) => void;
}

export function RoleRoute({ children, roles, onNavigate }: RoleRouteProps) {
  const { user } = useAuth();

  if (user && roles.includes(user.role)) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <p className="mb-4 text-gray-700">You do not have the required permissions to view this page.</p>
      <div className="flex justify-center gap-2">
        {user ? (
          <button
            onClick={() => (onNavigate ? onNavigate('home') : window.location.reload())}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Back to Home
          </button>
        ) : (
          <button
            onClick={() => (onNavigate ? onNavigate('auth') : window.location.reload())}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}

export default RoleRoute;
