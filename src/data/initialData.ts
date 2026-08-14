import { PricingRules, UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Orang Tua',
  email: '',
  role: 'Orang Tua',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYdEa71V6z5oW_P9U4L03y16dJ3-y0U5N3fK9A9g1m=s96-c',
};

export const DEFAULT_PRICING_RULES: PricingRules = {
  baseFeePP: 50000,
  differentHoursFee: 15000,
  effectiveDate: '2026-08-01',
  description: 'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000',
};

export function formatRupiah(amount: number): string {
  return 'Rp' + (amount || 0).toLocaleString('id-ID');
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
