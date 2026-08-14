import React, { useState } from 'react';
import { signInUser, signUpUser } from '../lib/supabase/db';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          throw new Error('Nama lengkap wajib diisi');
        }
        await signUpUser(email.trim(), password, name.trim());
        setSuccessMessage('Pendaftaran berhasil! Akun Anda telah siap.');
        onLogin();
      } else {
        await signInUser(email.trim(), password);
        onLogin();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk';
      if (message.includes('Invalid login credentials')) {
        setErrorMessage('Email atau password salah. Silakan periksa kembali.');
      } else if (message.includes('Email not confirmed')) {
        setErrorMessage('Email belum dikonfirmasi. Periksa kotak masuk Anda atau nonaktifkan email confirmation di dashboard Supabase.');
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F7FB] text-[#191b24] min-h-screen flex items-center justify-center p-4 antialiased selection:bg-[#0f62fe]/20">
      {/* Container Utama */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0_4px_12px_rgba(15,98,254,0.08)] border border-[#E2E8F0] p-8 md:p-10 flex flex-col relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#0f62fe] rounded-full opacity-20 blur-2xl pointer-events-none"></div>

        {/* Header / Logo Area */}
        <div className="flex flex-col items-center mb-6 z-10">
          <div className="w-16 h-16 bg-[#0f62fe] rounded-2xl flex items-center justify-center mb-4 shadow-sm text-white">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              airport_shuttle
            </span>
          </div>
          <h1 className="text-[24px] md:text-[30px] font-bold text-[#191b24] text-center mb-1 tracking-tight">
            AntarJemputKu
          </h1>
          <h2 className="text-[14px] text-[#424656] text-center">
            {isRegisterMode ? 'Daftar Akun Baru (Supabase Auth)' : 'Monitoring Antar Jemput Anak'}
          </h2>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-[#fff5f5] border border-[#ffdad6] text-[#ba1a1a] text-[13px] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[13px] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
            <div className="leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Form Area */}
        <form className="flex flex-col gap-4 z-10" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#c3c6d8] group-focus-within:text-[#004ccd] transition-colors">
                  person
                </span>
                <input
                  id="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c3c6d8] rounded-lg text-[14px] text-[#191b24] placeholder:text-[#c3c6d8] focus:outline-none focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] transition-all shadow-xs"
                  placeholder="Nama Lengkap Orang Tua"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Input Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider" htmlFor="email">
              Email
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#c3c6d8] group-focus-within:text-[#004ccd] transition-colors">
                mail
              </span>
              <input
                id="email"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c3c6d8] rounded-lg text-[14px] text-[#191b24] placeholder:text-[#c3c6d8] focus:outline-none focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] transition-all shadow-xs"
                placeholder="nama@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#c3c6d8] group-focus-within:text-[#004ccd] transition-colors">
                lock
              </span>
              <input
                id="password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#c3c6d8] rounded-lg text-[14px] text-[#191b24] placeholder:text-[#c3c6d8] focus:outline-none focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] transition-all shadow-xs"
                placeholder="Minimal 6 karakter"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c3c6d8] hover:text-[#424656] transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            disabled={isLoading}
            className="w-full mt-3 bg-[#004ccd] hover:bg-[#003da9] disabled:bg-[#004ccd]/60 text-white font-medium text-[15px] py-3 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
            type="submit"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Memproses...</span>
              </span>
            ) : (
              <>
                <span>{isRegisterMode ? 'Daftar Akun Baru' : 'Masuk ke Aplikasi'}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Sign Up Link */}
        <div className="mt-6 text-center z-10">
          <p className="text-[13px] text-[#424656]">
            {isRegisterMode ? 'Sudah memiliki akun? ' : 'Belum memiliki akun? '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[13px] font-semibold text-[#004ccd] hover:text-[#003da9] transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              {isRegisterMode ? 'Masuk di sini' : 'Daftar Akun'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
