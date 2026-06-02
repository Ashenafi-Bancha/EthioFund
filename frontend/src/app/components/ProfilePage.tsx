import { useState } from 'react';
import { User, Phone, Mail, Shield, Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { PageBackButton } from './PageBackButton';

interface ProfilePageProps {
  onBack: () => void;
  backLabel?: string;
}

export function ProfilePage({ onBack, backLabel = 'Back' }: ProfilePageProps) {
  const { user, token, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Please sign in to view your profile.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }

    if (phoneNumber && !/^\+?[0-9\s-]{10,13}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast.error('Enter a valid Ethiopian phone number');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await apiRequest<{
        success: boolean;
        data?: {
          full_name: string;
          phone_number: string;
        };
        user?: {
          full_name: string;
          phone_number: string;
        };
      }>('/users/me', {
        method: 'PUT',
        authToken: token,
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim() || undefined,
        }),
      });

      const updated = response.data ?? response.user;
      if (response.success && updated) {
        updateUser({
          name: updated.full_name,
          phoneNumber: updated.phone_number,
        });
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating profile';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <PageBackButton onBack={onBack} label={backLabel} />
      </div>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {user.role}
          </div>
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full mx-auto flex items-center justify-center border-2 border-white/30 shadow-inner mb-4 transition-transform hover:scale-105">
            <span className="text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-green-100 text-sm mt-1">{user.email}</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 sm:text-sm"
                  placeholder="Abebe Kebede"
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Phone Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 sm:text-sm"
                  placeholder="+251911234567"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address (Read-only)
              </label>
              <div className="relative rounded-xl shadow-sm bg-gray-50">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="block w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed outline-none sm:text-sm"
                />
              </div>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Account Type (Read-only)
              </label>
              <div className="relative rounded-xl shadow-sm bg-gray-50">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={user.role.toUpperCase()}
                  disabled
                  className="block w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
