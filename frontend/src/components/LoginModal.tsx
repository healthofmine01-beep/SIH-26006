import React, { useState } from 'react';
import { Anchor, Lock, User, AlertCircle, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../api/freightApi';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: { username: string; role: string; full_name: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await loginUser(username.trim(), password.trim());
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const setCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#052439]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0072E9] text-white shadow-md shadow-[#0072E9]/30 mb-2">
            <Anchor className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black font-['Hanken_Grotesk'] text-[#052439] tracking-tight">
            Cargo<span className="text-[#0072E9]">Predict</span>
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Enterprise Maritime Freight Forecasting & Decision-Support System
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-[#0072E9] focus:ring-2 focus:ring-[#0072E9]/20 text-sm font-medium text-[#052439] outline-none transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-[#0072E9] focus:ring-2 focus:ring-[#0072E9]/20 text-sm font-medium text-[#052439] outline-none transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0072E9] hover:bg-[#005bbd] text-white text-sm font-bold shadow-md shadow-[#0072E9]/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to CargoPredict</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sign-In Buttons */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-wider">
            Quick Select Account
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="btn-quick-dhruvil"
              type="button"
              onClick={() => setCredentials('dhruvil', 'dhruvil123')}
              className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-[#0072E9]/10 hover:border-[#0072E9]/30 border border-gray-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-[#052439]">dhruvil</div>
              <div className="text-[9px] text-gray-500 font-mono">Customer</div>
            </button>

            <button
              id="btn-quick-dwip"
              type="button"
              onClick={() => setCredentials('dwip', 'dwip123')}
              className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-[#0072E9]/10 hover:border-[#0072E9]/30 border border-gray-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-[#052439]">dwip</div>
              <div className="text-[9px] text-gray-500 font-mono">Customer</div>
            </button>

            <button
              id="btn-quick-admin"
              type="button"
              onClick={() => setCredentials('admin', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-amber-900">admin</div>
              <div className="text-[9px] text-amber-700 font-mono">Admin</div>
            </button>
          </div>
        </div>

        {/* Security and Database Status Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Supabase PostgreSQL • 25 Tables Loaded & Verified</span>
        </div>
      </div>
    </div>
  );
};
