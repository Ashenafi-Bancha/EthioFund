import { useState, useMemo } from 'react';
import { Mail, Lock, UserCircle, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types/auth';
import { PageBackButton } from './PageBackButton';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
  backLabel?: string;
}

export function AuthPage({ onLogin, onNavigate, onBack, backLabel = 'Back' }: AuthPageProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor' as UserRole
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setErrorMessage('Password must be at least 8 characters');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const authenticatedUser: User = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register({
            full_name: formData.name,
            phone_number: formData.phoneNumber,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          });

      onLogin(authenticatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full mx-4 sm:mx-auto">
        {/* Logo */}
        <div className="text-center mb-8 px-2">
          <div className="mb-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">EthioFund</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-600">{isLogin ? 'Sign in to your account' : 'Join the EthioFund community'}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <PageBackButton onBack={onBack} label={backLabel} className="mb-4" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  aria-label="Password"
                  aria-invalid={errorMessage ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    I want to
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="donor">Donate to campaigns</option>
                    <option value="organizer">Start a campaign</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all shadow-md font-semibold"
            >
              {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 p-3 rounded-lg bg-green-50 text-sm text-green-800">
            Use your EthioFund account to sign in, or create a new account to get started.
          </div>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const info = useMemo(() => {
    if (!password) return { score: 0, label: 'Too short', color: 'bg-red-300' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
    if (score === 2) return { score, label: 'Okay', color: 'bg-yellow-400' };
    if (score === 3) return { score, label: 'Good', color: 'bg-green-400' };
    return { score, label: 'Strong', color: 'bg-green-600' };
  }, [password]);

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`${info.color} h-2 rounded-full`} style={{ width: `${(info.score / 4) * 100}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
        <div>{password ? info.label : 'Enter a password'}</div>
        <div className="font-medium">{password ? `${info.score}/4` : ''}</div>
      </div>
    </div>
  );
}
