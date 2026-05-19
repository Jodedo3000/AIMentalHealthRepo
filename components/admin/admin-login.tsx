'use client';

import { useState } from 'react';
import { Brain, Eye, EyeOff, LogIn, UserPlus, CircleCheck as CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'jdommnich@gmail.com';

interface AdminLoginProps {
  onLogin: () => void;
}

type Mode = 'signin' | 'signup' | 'success';

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('signin');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (
          signInError.message.includes('Invalid login credentials') &&
          email === ADMIN_EMAIL
        ) {
          setError('No account found for this email. Set up your admin account below.');
          setMode('signup');
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setError('Access restricted. This account does not have admin privileges.');
        return;
      }

      onLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      setError('Account creation is restricted to the designated admin email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          onLogin();
          return;
        }
      }

      setMode('success');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#3A5A40]/20 focus:border-[#3A5A40] transition-all placeholder:text-[#9CA3AF]";

  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={22} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-[#1F2937] mb-2">Account created</h2>
          <p className="text-sm text-[#6B7280]">
            Check your email to confirm your address, then return here to sign in.
          </p>
          <button
            onClick={() => { setMode('signin'); setError(''); }}
            className="mt-6 text-sm font-medium text-[#3A5A40] hover:text-[#2d4731] transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#3A5A40] flex items-center justify-center mx-auto mb-4">
            <Brain size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">
            {isSignUp ? 'Create Admin Account' : 'Admin Access'}
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">AI × Mental Health Repository</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {error && (
              <div className={`border rounded-lg px-4 py-3 text-sm ${
                isSignUp && error.includes('Set up')
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={inputClass}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                Password {isSignUp && <span className="normal-case font-normal text-[#9CA3AF]">(min. 8 characters)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={isSignUp ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#3A5A40] hover:bg-[#2d4731] text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <UserPlus size={15} />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in')}
            </button>

            {isSignUp && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors pt-1"
              >
                Back to sign in
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
