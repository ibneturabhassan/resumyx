import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      // Success - AuthContext will handle redirect
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
            R
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-600 mt-2">Start building your perfect resume</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-slate-500">
          By creating an account, you agree to our{' '}
          <span className="text-slate-700 font-medium">Terms of Service</span> and{' '}
          <span className="text-slate-700 font-medium">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
