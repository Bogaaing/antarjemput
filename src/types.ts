export interface Child {
  id: string;
  name: string;
  roleTag: string; // 'Kakak', 'Adik', etc.
  avatarUrl: string;
  defaultPickupTime: string; // e.g. "07:00"
  defaultDropoffTime: string; // e.g. "12:00"
  school?: string;
  notes?: string;
}

export interface ChildDailySchedule {
  childId: string;
  isAttending: boolean;
  pickupTime: string;
  dropoffTime: string;
}

export interface DailyTransportRecord {
  id: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-08-14"
  sharedPickupTime: string; // "07:00"
  children: ChildDailySchedule[];
  baseFee: number; // 50000
  additionalFee: number; // 15000
  totalFee: number; // 65000
  status: 'completed' | 'scheduled' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  hasDifferentDropoff: boolean;
  notes?: string;
}

export interface PricingRules {
  baseFeePP: number; // 50000
  differentHoursFee: number; // 15000
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

