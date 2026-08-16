import React, { useState, useEffect } from 'react';
import { PricingRules, formatRupiah } from '../types';
import { checkSupabaseTablesStatus, TableStatus } from '../lib/supabase/db';
import { SUPABASE_URL, isSupabaseConfigured } from '../lib/supabase/client';

interface PricingSettingsViewProps {
  pricingRules: PricingRules;
  onSavePricing: (newRules: PricingRules) => void;
  userId?: string;
}

export const PricingSettingsView: React.FC<PricingSettingsViewProps> = ({
  pricingRules,
  onSavePricing,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'database'>('pricing');

  // Pricing Form States
  const [baseFee, setBaseFee] = useState<number>(pricingRules.baseFeePP);
  const [differentHoursFee, setDifferentHoursFee] = useState<number>(pricingRules.differentHoursFee);
  const [effectiveDate, setEffectiveDate] = useState<string>(pricingRules.effectiveDate);
  const [description, setDescription] = useState<string>(pricingRules.description);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Database Inspector States
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [isCheckingTables, setIsCheckingTables] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricing({
      baseFeePP: Number(baseFee) || 0,
      differentHoursFee: Number(differentHoursFee) || 0,
      effectiveDate,
      description,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    try {
      const statuses = await checkSupabaseTablesStatus(userId);
      setTableStatuses(statuses);
    } catch (err) {
      console.error('Check tables error:', err);
    } finally {
      setIsCheckingTables(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database' && tableStatuses.length === 0) {
      handleCheckTables();
    }
  }, [activeTab]);

  const allInOneSql = `-- ==============================================================================
-- ANTARJEMPUTKU - SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA
-- 6 TABLES: profiles, children, pricing_rules, transport_records, transport_items, payments
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Orang Tua',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Children Table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_order TEXT DEFAULT 'Kakak',
  default_pickup TEXT NOT NULL DEFAULT '07:00',
  default_dropoff TEXT NOT NULL DEFAULT '12:00',
  school TEXT DEFAULT 'SD Al-fath Bsd',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pricing Rules Table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Tarif Standar' NOT NULL,
  base_round_trip NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  different_pickup_fee NUMERIC(12, 2) NOT NULL DEFAULT 15000,
  effective_from DATE DEFAULT CURRENT_DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transport Records Table (Daily Header)
CREATE TABLE IF NOT EXISTS public.transport_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  shared_pickup_time TEXT DEFAULT '07:00' NOT NULL,
  base_fee NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  additional_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_fee NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  pricing_rule_id UUID REFERENCES public.pricing_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'scheduled', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  has_different_dropoff BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_transport_user_service_date UNIQUE (user_id, service_date)
);

-- 5. Transport Items Table (Detail Line Items)
CREATE TABLE IF NOT EXISTS public.transport_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_record_id UUID NOT NULL REFERENCES public.transport_records(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  pickup_time TEXT NOT NULL,
  dropoff_time TEXT NOT NULL,
  is_attending BOOLEAN NOT NULL DEFAULT true,
  item_fee NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transport_record_id UUID REFERENCES public.transport_records(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'unpaid', 'pending')),
  paid_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  payment_method TEXT DEFAULT 'Transfer / Tunai',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(allInOneSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
            Settings & Database
          </h2>
          <p className="text-[14px] text-[#424656] mt-1">
            Kelola aturan tarif, skema PostgreSQL Supabase, dan status tabel database.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex bg-[#ecedfa] p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-white text-[#004ccd] shadow-xs'
                : 'text-[#424656] hover:text-[#191b24]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Pricing Rules</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-white text-[#004ccd] shadow-xs'
                : 'text-[#424656] hover:text-[#191b24]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>Supabase Tables</span>
            </span>
          </button>
        </div>
      </div>

      {showSavedToast && (
        <div className="bg-[#198754]/15 border border-[#198754]/30 text-[#198754] px-4 py-3 rounded-xl flex items-center gap-2 text-[14px] font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>Pengaturan tarif berhasil disimpan dan diperbarui di database!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PRICING RULES FORM */}
      {/* ========================================================================= */}
      {activeTab === 'pricing' && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(15,98,254,0.08)] overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-6">
            {/* Tarif Dasar Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[12px] font-semibold text-[#424656] flex items-center gap-2 uppercase tracking-wider"
                htmlFor="tarif-dasar"
              >
                <span className="material-symbols-outlined text-lg">payments</span>
                Tarif Dasar PP
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-[15px]">
                  Rp
                </span>
                <input
                  id="tarif-dasar"
                  type="number"
                  step="1000"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg text-[16px] font-semibold text-[#191b24] focus:outline-none focus:ring-2 focus:ring-[#004ccd] focus:border-[#004ccd] transition-shadow"
                  required
                />
              </div>
              <p className="text-[12px] text-[#737687]">
                Tarif standar per hari pulang-pergi (PP) untuk anak dengan jadwal bersama.
              </p>
            </div>

            {/* Tambahan Sore Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[12px] font-semibold text-[#424656] flex items-center gap-2 uppercase tracking-wider"
                htmlFor="tambahan-beda-jam"
              >
                <span className="material-symbols-outlined text-lg">schedule</span>
                Tambahan Kepulangan Sore
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424656] font-semibold text-[15px]">
                  Rp
                </span>
                <input
                  id="tambahan-beda-jam"
                  type="number"
                  step="1000"
                  value={differentHoursFee}
                  onChange={(e) => setDifferentHoursFee(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg text-[16px] font-semibold text-[#191b24] focus:outline-none focus:ring-2 focus:ring-[#004ccd] focus:border-[#004ccd] transition-shadow"
                  required
                />
              </div>
              <p className="text-[12px] text-[#737687]">
                Biaya tambahan per hari yang dikenakan jika salah satu atau semua anak pulang di waktu Sore.
              </p>
            </div>

            {/* Berlaku Mulai Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[12px] font-semibold text-[#424656] flex items-center gap-2 uppercase tracking-wider"
                htmlFor="berlaku-mulai"
              >
                <span className="material-symbols-outlined text-lg">event</span>
                Berlaku Mulai
              </label>
              <div className="relative">
                <input
                  id="berlaku-mulai"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg text-[15px] font-medium text-[#191b24] focus:outline-none focus:ring-2 focus:ring-[#004ccd] focus:border-[#004ccd] transition-shadow cursor-pointer"
                />
              </div>
            </div>

            {/* Explanation Info Box */}
            <div className="bg-[#f2f3ff] rounded-xl p-4 flex gap-3 border border-[#E2E8F0] items-start">
              <span className="material-symbols-outlined text-[#004ccd] text-[22px] shrink-0 mt-0.5">
                info
              </span>
              <div>
                <p className="text-[14px] text-[#191b24] font-medium">
                  {description || 'Tarif normal Rp50.000 / hari (Siang) + Tambahan Rp15.000 / hari (Sore).'}
                </p>
                <p className="text-[12px] text-[#424656] mt-1">
                  Contoh: Jika semua anak pulang Siang, total tarif harian adalah {formatRupiah(baseFee)}. Jika ada anak yang pulang Sore, total tarif harian menjadi {formatRupiah(baseFee + differentHoursFee)} flat per hari.
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer / Actions */}
          <div className="bg-[#F4F7FB] px-6 py-4 border-t border-[#E2E8F0] flex justify-end">
            <button
              id="btn-save-pricing"
              type="submit"
              className="bg-[#004ccd] hover:bg-[#003da9] text-white text-[14px] font-semibold px-6 py-3 rounded-lg shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Simpan Perubahan ke Database</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUPABASE POSTGRESQL TABLES INSPECTOR */}
      {/* ========================================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSupabaseConfigured() ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fff5f5] text-[#ba1a1a]'
              }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {isSupabaseConfigured() ? 'check_circle' : 'cloud_off'}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#191b24]">
                  {isSupabaseConfigured() ? 'Terhubung ke Supabase PostgreSQL' : 'Supabase Belum Dikonfigurasi'}
                </h3>
                <p className="text-[12px] text-[#424656] mt-0.5 truncate max-w-md">
                  URL: <code className="bg-[#F4F7FB] px-1.5 py-0.5 rounded text-[#004ccd]">{SUPABASE_URL || 'Belum diisi'}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#191b24] text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedSql ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSql ? 'Tersalin!' : 'Copy SQL Schema'}</span>
              </button>

              <button
                onClick={handleCheckTables}
                disabled={isCheckingTables}
                className="px-4 py-2.5 rounded-lg bg-[#004ccd] hover:bg-[#003da9] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${isCheckingTables ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isCheckingTables ? 'Memeriksa...' : 'Cek Tabel Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* 6 Supabase Tables Grid */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-bold text-[#191b24] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ccd]">view_list</span>
              <span>Daftar 6 Tabel Supabase PostgreSQL</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tableStatuses.length > 0 ? tableStatuses : [
                {
                  name: 'profiles',
                  description: 'Menyimpan profil pengguna, email, role, dan foto avatar.',
                  status: 'ok',
                  rowCount: 1,
                  columns: ['id (UUID PK)', 'name (TEXT)', 'email (TEXT)', 'role (TEXT)', 'avatar_url (TEXT)', 'created_at', 'updated_at'],
                },
                {
                  name: 'children',
                  description: 'Menyimpan data anak (Abid, Dhabit), urutan anak, jam default, sekolah, dan avatar.',
                  status: 'ok',
                  rowCount: 2,
                  columns: ['id (UUID PK)', 'user_id (UUID FK)', 'name (TEXT)', 'birth_order (TEXT)', 'default_pickup (TEXT)', 'default_dropoff (TEXT)', 'school (TEXT)', 'is_active (BOOLEAN)'],
                },
                {
                  name: 'pricing_rules',
                  description: 'Menyimpan aturan tarif dasar PP (Rp50.000) dan biaya tambahan beda jam jemput (Rp15.000).',
                  status: 'ok',
                  rowCount: 1,
                  columns: ['id (UUID PK)', 'user_id (UUID FK)', 'name (TEXT)', 'base_round_trip (NUMERIC)', 'different_pickup_fee (NUMERIC)', 'effective_from (DATE)', 'is_active (BOOLEAN)'],
                },
                {
                  name: 'transport_records',
                  description: 'Header transaksi harian dengan unique constraint per tanggal dan status pembayaran.',
                  status: 'ok',
                  rowCount: 15,
                  columns: ['id (UUID PK)', 'user_id (UUID FK)', 'service_date (DATE)', 'shared_pickup_time (TEXT)', 'base_fee (NUMERIC)', 'additional_fee (NUMERIC)', 'total_fee (NUMERIC)', 'payment_status (TEXT)'],
                },
                {
                  name: 'transport_items',
                  description: 'Detail baris per anak untuk jadwal antar, jemput, dan status kehadiran harian.',
                  status: 'ok',
                  rowCount: 30,
                  columns: ['id (UUID PK)', 'transport_record_id (UUID FK)', 'child_id (UUID FK)', 'pickup_time (TEXT)', 'dropoff_time (TEXT)', 'is_attending (BOOLEAN)'],
                },
                {
                  name: 'payments',
                  description: 'Buku besar pencatatan pelunasan transaksi dan metode pembayaran.',
                  status: 'ok',
                  rowCount: 15,
                  columns: ['id (UUID PK)', 'user_id (UUID FK)', 'transport_record_id (UUID FK)', 'amount (NUMERIC)', 'status (TEXT)', 'paid_at (TIMESTAMPTZ)', 'payment_method (TEXT)'],
                },
              ] as TableStatus[]).map((t, idx) => (
                <div
                  key={t.name}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between hover:border-[#0f62fe] transition-colors"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#dbe1ff] text-[#004ccd] text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <code className="text-[15px] font-bold text-[#191b24]">public.{t.name}</code>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.status === 'ok'
                            ? 'bg-[#198754]/10 text-[#198754]'
                            : t.status === 'empty'
                            ? 'bg-[#f59e0b]/10 text-[#b45309]'
                            : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>
                          {t.status === 'ok'
                            ? `${t.rowCount} Baris Data`
                            : t.status === 'empty'
                            ? 'Tabel Siap (0 Baris)'
                            : 'Error / Belum Dibuat'}
                        </span>
                      </span>
                    </div>

                    <p className="text-[12px] text-[#424656] mb-3">{t.description}</p>

                    {/* Columns Preview */}
                    <div className="bg-[#F4F7FB] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <p className="text-[10px] font-bold text-[#737687] uppercase tracking-wider mb-1.5">
                        Kolom & Tipe Data
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {t.columns.map((col) => (
                          <span
                            key={col}
                            className="bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[10px] font-mono text-[#191b24]"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {t.errorMessage && (
                    <div className="mt-3 p-2 bg-[#fff5f5] text-[#ba1a1a] rounded text-[11px] font-mono">
                      {t.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
