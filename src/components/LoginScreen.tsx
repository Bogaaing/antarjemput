import React, { useState } from 'react';
import { signInUser, signUpUser } from '../lib/supabase/db';
import { isSupabaseConfigured, SUPABASE_URL, updateSupabaseConfig } from '../lib/supabase/client';

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

  // Config modal for Supabase URL / Key
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(SUPABASE_URL || '');
  const [customKey, setCustomKey] = useState('');

  const isConfigured = isSupabaseConfigured();

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

  const handleSaveCustomConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      alert('URL dan Anon Key Supabase wajib diisi');
      return;
    }
    updateSupabaseConfig(customUrl, customKey);
  };

  return (
    <div className="bg-[#F4F7FB] text-[#191b24] min-h-screen flex items-center justify-center p-4 antialiased selection:bg-[#0f62fe]/20">
      {/* Container Utama */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0_4px_12px_rgba(15,98,254,0.08)] border border-[#E2E8F0] p-8 md:p-10 flex flex-col relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#0f62fe] rounded-full opacity-20 blur-2xl pointer-events-none"></div>

        {/* Supabase Status Indicator Banner */}
        <div className="mb-6 -mx-8 -mt-8 md:-mx-10 md:-mt-10 px-6 py-2.5 bg-[#F4F7FB] border-b border-[#E2E8F0] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-[#198754] animate-pulse' : 'bg-[#F59E0B]'
              }`}
            ></span>
            <span className="font-semibold text-[#424656]">
              {isConfigured ? 'Supabase PostgreSQL: Terhubung' : 'Supabase: Perlu Kredensial'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="text-[#004ccd] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">settings</span>
            <span>Konfigurasi</span>
          </button>
        </div>

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

      {/* Supabase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ccd]">database</span>
                <h3 className="font-bold text-[16px] text-[#191b24]">Konfigurasi Supabase PostgreSQL</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#737687] hover:text-[#191b24] p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-[13px] text-[#424656] leading-relaxed">
              Aplikasi ini terhubung langsung dengan Supabase PostgreSQL & Auth. Jika belum disetel di file environment, Anda dapat memasukkan Project URL & Anon Key di bawah ini:
            </p>

            <form onSubmit={handleSaveCustomConfig} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#424656] mb-1">
                  SUPABASE PROJECT URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 border border-[#c3c6d8] rounded-lg text-[13px] font-mono focus:border-[#004ccd] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#424656] mb-1">
                  SUPABASE ANON KEY (Public)
                </label>
                <textarea
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#c3c6d8] rounded-lg text-[12px] font-mono focus:border-[#004ccd] outline-none"
                  required
                />
                <p className="text-[11px] text-[#737687] mt-1">
                  *Gunakan Anon (Public) Key dengan RLS aktif. Jangan pernah memasukkan Service Role Key.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[13px] font-semibold text-[#424656]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#004ccd] hover:bg-[#003da9] text-white text-[13px] font-semibold"
                >
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
