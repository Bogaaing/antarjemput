export type ReturnPeriod = 'siang' | 'sore';

export interface Child {
  id: string;
  name: string;
  roleTag: string; // 'Kakak', 'Adik', etc.
  avatarUrl: string;
  defaultPickupTime: string; // e.g. "07:00"
  defaultDropoffTime: string; // e.g. "12:00" (siang) or "15:00" (sore)
  defaultDropoffPeriod?: ReturnPeriod;
  school?: string;
  notes?: string;
}

export interface ChildDailySchedule {
  childId: string;
  isAttending: boolean;
  pickupTime: string;
  dropoffTime: string;
  dropoffPeriod?: ReturnPeriod;
}

export interface DailyTransportRecord {
  id: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-08-14"
  sharedPickupTime: string; // "07:00"
  children: ChildDailySchedule[];
  baseFee: number; // 50000
  additionalFee: number; // 15000
  totalFee: number; // 50000 or 65000
  status: 'completed' | 'scheduled' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  hasDifferentDropoff: boolean; // true if any attending child returns 'sore'
  notes?: string;
}

export interface PricingRules {
  baseFeePP: number; // 50000 (Siang)
  differentHoursFee: number; // 15000 (Tambahan Sore)
  effectiveDate: string; // "2026-08-01"
  description: string;
}

export interface MonthlySummary {
  year: number;
  month: number; // 1-12 (e.g. 8 for August)
  monthName: string; // "Agustus 2026"
  totalDays: number; // 18
  normalDays: number; // 14
  extraDays: number; // 4
  baseTotal: number; // 900000
  extraTotal: number; // 60000
  grandTotal: number; // 960000
  paidTotal: number; // 500000
  unpaidTotal: number; // 460000
  progressPercentage: number; // 52
}

export type TabType = 'calendar' | 'history' | 'children' | 'pricing' | 'reports';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

// ==============================================================================
// RETURN PERIOD & PRICING HELPERS (SINGLE SOURCE OF TRUTH)
// ==============================================================================

export function getReturnPeriod(timeOrPeriod?: string): ReturnPeriod {
  if (!timeOrPeriod) return 'siang';
  const val = timeOrPeriod.toLowerCase().trim();
  if (val === 'siang' || val === '12:00') {
    return 'siang';
  }
  if (val === 'sore' || val === '15:00') {
    return 'sore';
  }
  // If it is a time string in HH:mm format
  if (/^\d{1,2}:\d{2}$/.test(val)) {
    const hour = parseInt(val.split(':')[0], 10);
    if (!isNaN(hour) && hour >= 14) {
      return 'sore';
    }
    return 'siang';
  }
  return 'siang';
}

export function getReturnPeriodTime(period: ReturnPeriod): string {
  return period === 'sore' ? '15:00' : '12:00';
}

export function getReturnPeriodLabel(timeOrPeriod?: string): string {
  return getReturnPeriod(timeOrPeriod) === 'sore' ? 'Sore' : 'Siang';
}

export function calculateDailyFee(
  attendingChildren: { dropoffTime?: string; dropoffPeriod?: ReturnPeriod }[],
  basePP: number = 50000,
  extraSore: number = 15000
): { baseFee: number; additionalFee: number; totalFee: number; hasSore: boolean } {
  if (!attendingChildren || attendingChildren.length === 0) {
    return { baseFee: 0, additionalFee: 0, totalFee: 0, hasSore: false };
  }

  const hasSore = attendingChildren.some(
    (c) => getReturnPeriod(c.dropoffPeriod || c.dropoffTime) === 'sore'
  );

  const baseFee = basePP;
  const additionalFee = hasSore ? extraSore : 0;
  const totalFee = baseFee + additionalFee;

  return { baseFee, additionalFee, totalFee, hasSore };
}

export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
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

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'OT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
