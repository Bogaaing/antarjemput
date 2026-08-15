import React, { useState } from 'react';
import { signInUser } from '../lib/supabase/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await signInUser(email.trim(), password);
      onLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk';
      if (message.includes('Invalid login credentials')) {
        setErrorMessage('Email atau password salah. Silakan periksa kembali.');
      } else if (message.includes('Email not confirmed')) {
        setErrorMessage('Email belum dikonfirmasi. Periksa kotak masuk Anda.');
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotLoading(true);
    setForgotFeedback(null);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase belum dikonfigurasi.');
      }
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setForgotFeedback({
        type: 'success',
        message: 'Tautan reset password telah dikirim ke email Anda.',
      });
    } catch (err: unknown) {
      setForgotFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal mengirim email reset password.',
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F7FB] text-[#191b24] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-[#0f62fe]/20">
      {/* Main Container Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all">
        {/* Top Logo / Brand Badge */}
        <div className="flex flex-col items-center justify-center pt-1 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-[#004ccd] text-white flex items-center justify-center shadow-xs mb-1.5">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_car
            </span>
          </div>
          <span className="text-[13px] font-bold text-[#004ccd] tracking-tight">AntarJemputKu</span>
        </div>

        {/* Hero Vector Illustration */}
        <div className="w-full flex justify-center items-center my-2">
          <div className="relative w-full max-w-[240px] sm:max-w-[270px] aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-transparent">
            <img
              src="/login_illustration.jpg"
              alt="Antar Jemput Anak Motor"
              className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300 hover:scale-102"
              loading="eager"
            />
          </div>
        </div>

        {/* Form Header Title */}
        <div className="mb-4">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#191b24] tracking-tight">
            Login
          </h1>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFF5F5] border border-[#FFDAD6] text-[#BA1A1A] text-[13px] font-medium flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Inline Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[13px] font-medium flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
            <div className="leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="space-y-1">
            <div className="relative flex items-center border-b border-[#CBD5E1] focus-within:border-[#004ccd] transition-colors py-1">
              <span className="material-symbols-outlined text-[20px] text-[#64748B] mr-2.5 shrink-0">
                alternate_email
              </span>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID"
                className="w-full py-2 bg-transparent text-[15px] text-[#191b24] placeholder:text-[#94A3B8] focus:outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field with Show/Hide & Forgot Password */}
          <div className="space-y-1">
            <div className="relative flex items-center border-b border-[#CBD5E1] focus-within:border-[#004ccd] transition-colors py-1">
              <span className="material-symbols-outlined text-[20px] text-[#64748B] mr-2.5 shrink-0">
                lock
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-2 bg-transparent text-[15px] text-[#191b24] placeholder:text-[#94A3B8] focus:outline-none pr-16"
                autoComplete="current-password"
              />
              
              <div className="absolute right-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#64748B] hover:text-[#191b24] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotFeedback(null);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[13px] font-bold text-[#004ccd] hover:text-[#003da9] hover:underline cursor-pointer transition-colors"
                >
                  Forgot?
                </button>
              </div>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-[#004ccd] hover:bg-[#003da9] disabled:bg-[#004ccd]/60 text-white font-bold text-[15px] shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer h-[50px]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Memproses...</span>
              </span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[16px] font-bold text-[#191b24]">Reset Password</h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-full text-[#64748B] hover:bg-[#F4F7FB] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {forgotFeedback && (
              <div
                className={`p-3 rounded-xl text-[12px] font-semibold flex items-start gap-2 ${
                  forgotFeedback.type === 'success'
                    ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]'
                    : 'bg-[#FFF5F5] border border-[#FFDAD6] text-[#BA1A1A]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  {forgotFeedback.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{forgotFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#475569] block mb-1">
                  Masukkan Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl text-[14px] focus:outline-none focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd]"
                />
              </div>

              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#004ccd] hover:bg-[#003da9] disabled:bg-[#004ccd]/60 text-white font-bold text-[14px] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isForgotLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Mengirim...</span>
                  </span>
                ) : (
                  <span>Kirim Tautan Reset</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
