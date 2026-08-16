import { supabase, isSupabaseConfigured } from './client';
import {
  Child,
  DailyTransportRecord,
  PricingRules,
  UserProfile,
  ChildDailySchedule,
  getReturnPeriod,
  calculateDailyFee,
} from '../../types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ChildRow {
  id: string;
  user_id: string;
  name: string;
  birth_order: string | null;
  default_pickup: string;
  default_dropoff: string;
  school: string | null;
  avatar_url: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PricingRow {
  id: string;
  user_id: string;
  name: string;
  base_round_trip: number;
  different_pickup_fee: number;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface RecordRow {
  id: string;
  user_id: string;
  service_date: string;
  shared_pickup_time: string;
  base_fee: number;
  additional_fee: number;
  total_fee: number;
  pricing_rule_id: string | null;
  status: 'completed' | 'scheduled' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  has_different_dropoff: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: string;
  transport_record_id: string;
  child_id: string;
  pickup_time: string;
  dropoff_time: string;
  is_attending: boolean;
  item_fee: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// AUTH SERVICES
// ==============================================================================
export async function signUpUser(email: string, password: string, name: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Silakan masukkan Supabase URL dan Anon Key.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) throw error;

  if (data.user) {
    await ensureUserProfileAndPricing(data.user.id, name, email);
  }

  return data;
}

export async function signInUser(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Silakan masukkan Supabase URL dan Anon Key.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    await ensureUserProfileAndPricing(data.user.id, data.user.user_metadata?.name || '', email);
  }

  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper to initialize profile and default pricing rules if triggers aren't executed
async function ensureUserProfileAndPricing(userId: string, name: string, email: string) {
  try {
    // 1. Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      await supabase.from('profiles').insert({
        id: userId,
        name: name || splitEmail(email),
        email: email,
        role: 'Orang Tua',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYdEa71V6z5oW_P9U4L03y16dJ3-y0U5N3fK9A9g1m=s96-c',
      } as unknown as Record<string, unknown>);
    }

    // 2. Pricing Rule
    const { data: pricing } = await supabase
      .from('pricing_rules')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!pricing) {
      await supabase.from('pricing_rules').insert({
        user_id: userId,
        name: 'Tarif Standar',
        base_round_trip: 50000,
        different_pickup_fee: 15000,
        effective_from: new Date().toISOString().split('T')[0],
        is_active: true,
        description: 'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000',
      } as unknown as Record<string, unknown>);
    }
  } catch (err) {
    console.warn('Could not auto-seed profile/pricing:', err);
  }
}

function splitEmail(email: string) {
  return email.split('@')[0] || 'User';
}

// ==============================================================================
// PROFILES
// ==============================================================================
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    name: 'Orang Tua',
    email: '',
    role: 'Orang Tua',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYdEa71V6z5oW_P9U4L03y16dJ3-y0U5N3fK9A9g1m=s96-c',
  };

  if (!isSupabaseConfigured() || !userId) return defaultProfile;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return defaultProfile;
  }

  const row = data as ProfileRow;
  return {
    name: row.name || 'Orang Tua',
    email: row.email || '',
    role: row.role || 'Orang Tua',
    avatarUrl: row.avatar_url || defaultProfile.avatarUrl,
  };
}

// ==============================================================================
// CHILDREN CRUD
// ==============================================================================
export async function fetchChildrenFromDB(userId: string): Promise<Child[]> {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching children:', error);
    return [];
  }

  return ((data || []) as ChildRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    roleTag: row.birth_order || 'Anak',
    avatarUrl:
      row.avatar_url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(row.name)}`,
    defaultPickupTime: row.default_pickup || '07:00',
    defaultDropoffTime: row.default_dropoff || '12:00',
    defaultDropoffPeriod: getReturnPeriod(row.default_dropoff),
    school: row.school || 'SD Al-fath Bsd',
    notes: row.notes || '',
  }));
}

export async function createChildInDB(userId: string, child: Omit<Child, 'id'>): Promise<Child> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi');
  }

  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id: userId,
      name: child.name,
      birth_order: child.roleTag,
      default_pickup: child.defaultPickupTime,
      default_dropoff: child.defaultDropoffTime,
      school: child.school || 'SD Al-fath Bsd',
      avatar_url: child.avatarUrl,
      notes: child.notes,
      is_active: true,
    } as unknown as Record<string, unknown>)
    .select()
    .single();

  if (error) throw error;
  const row = data as ChildRow;

  return {
    id: row.id,
    name: row.name,
    roleTag: row.birth_order || 'Anak',
    avatarUrl: row.avatar_url || child.avatarUrl,
    defaultPickupTime: row.default_pickup,
    defaultDropoffTime: row.default_dropoff,
    school: row.school || '',
    notes: row.notes || '',
  };
}

export async function updateChildInDB(childId: string, child: Partial<Child>): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const updatePayload: Record<string, unknown> = {};
  if (child.name !== undefined) updatePayload.name = child.name;
  if (child.roleTag !== undefined) updatePayload.birth_order = child.roleTag;
  if (child.defaultPickupTime !== undefined) updatePayload.default_pickup = child.defaultPickupTime;
  if (child.defaultDropoffTime !== undefined) updatePayload.default_dropoff = child.defaultDropoffTime;
  if (child.school !== undefined) updatePayload.school = child.school;
  if (child.avatarUrl !== undefined) updatePayload.avatar_url = child.avatarUrl;
  if (child.notes !== undefined) updatePayload.notes = child.notes;
  updatePayload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('children')
    .update(updatePayload as unknown as Record<string, unknown>)
    .eq('id', childId);

  if (error) throw error;
}

export async function deleteChildFromDB(childId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from('children')
    .update({ is_active: false, updated_at: new Date().toISOString() } as unknown as Record<string, unknown>)
    .eq('id', childId);

  if (error) throw error;
}

// ==============================================================================
// PRICING RULES
// ==============================================================================
export async function fetchPricingRulesFromDB(userId: string): Promise<PricingRules> {
  const defaultPricing: PricingRules = {
    baseFeePP: 50000,
    differentHoursFee: 15000,
    effectiveDate: new Date().toISOString().split('T')[0],
    description: 'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000',
  };

  if (!isSupabaseConfigured() || !userId) return defaultPricing;

  const { data, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return defaultPricing;
  }

  const row = data as PricingRow;
  return {
    baseFeePP: Number(row.base_round_trip),
    differentHoursFee: Number(row.different_pickup_fee),
    effectiveDate: row.effective_from,
    description: row.description || '',
  };
}

export async function savePricingRulesToDB(userId: string, rules: PricingRules): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Check if existing active rule exists
  const { data: existing } = await supabase
    .from('pricing_rules')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('pricing_rules')
      .update({
        base_round_trip: rules.baseFeePP,
        different_pickup_fee: rules.differentHoursFee,
        effective_from: rules.effectiveDate,
        description: rules.description,
        updated_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
      .eq('id', (existing as { id: string }).id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('pricing_rules').insert({
      user_id: userId,
      name: 'Tarif Standar',
      base_round_trip: rules.baseFeePP,
      different_pickup_fee: rules.differentHoursFee,
      effective_from: rules.effectiveDate,
      description: rules.description,
      is_active: true,
    } as unknown as Record<string, unknown>);
    if (error) throw error;
  }
}

// ==============================================================================
// TRANSPORT RECORDS & ITEMS (TRANSACTION ENGINE)
// ==============================================================================

export async function fetchMonthlyRecordsFromDB(
  userId: string,
  year: number,
  month: number // 0-indexed (0=Jan, 7=Aug)
): Promise<DailyTransportRecord[]> {
  if (!isSupabaseConfigured() || !userId) return [];

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Fetch transport records
  const { data: recordsData, error: recordsError } = await supabase
    .from('transport_records')
    .select('*')
    .eq('user_id', userId)
    .gte('service_date', startDate)
    .lte('service_date', endDate)
    .order('service_date', { ascending: true });

  if (recordsError || !recordsData || recordsData.length === 0) {
    if (recordsError) console.error('Error fetching records:', recordsError);
    return [];
  }

  const recordIds = (recordsData as RecordRow[]).map((r) => r.id);

  // Fetch all transport_items for these records
  const { data: itemsData, error: itemsError } = await supabase
    .from('transport_items')
    .select('*')
    .in('transport_record_id', recordIds);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  }

  const itemsByRecordId: Record<string, ItemRow[]> = {};
  ((itemsData || []) as ItemRow[]).forEach((item: ItemRow) => {
    if (!itemsByRecordId[item.transport_record_id]) {
      itemsByRecordId[item.transport_record_id] = [];
    }
    itemsByRecordId[item.transport_record_id].push(item);
  });

  return (recordsData as RecordRow[]).map((rec) => {
    const rawItems = itemsByRecordId[rec.id] || [];
    const childrenSchedule: ChildDailySchedule[] = rawItems.map((it) => ({
      childId: it.child_id,
      isAttending: it.is_attending,
      pickupTime: it.pickup_time,
      dropoffTime: it.dropoff_time,
    }));

    return {
      id: rec.id,
      date: rec.service_date,
      sharedPickupTime: rec.shared_pickup_time,
      children: childrenSchedule,
      baseFee: Number(rec.base_fee),
      additionalFee: Number(rec.additional_fee),
      totalFee: Number(rec.total_fee),
      status: rec.status,
      paymentStatus: rec.payment_status,
      hasDifferentDropoff: rec.has_different_dropoff,
      notes: rec.notes || '',
    };
  });
}

export async function createTransportRecordInDB(
  userId: string,
  record: Omit<DailyTransportRecord, 'id'>
): Promise<DailyTransportRecord> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi');
  }

  // 1. Check for duplicate transaction on same service_date
  const { data: existing } = await supabase
    .from('transport_records')
    .select('id')
    .eq('user_id', userId)
    .eq('service_date', record.date)
    .maybeSingle();

  if (existing) {
    throw new Error(`Transaksi untuk tanggal ${record.date} sudah ada. Silakan edit transaksi yang tersedia.`);
  }

  // 2. Fetch active pricing rule to calculate on server/database side
  const pricing = await fetchPricingRulesFromDB(userId);

  // Determine pricing based on Siang (50k) / Sore (65k) rule
  const attendingKids = record.children.filter((c) => c.isAttending);
  const feeCalc = calculateDailyFee(
    attendingKids.map((c) => ({ dropoffTime: c.dropoffTime, dropoffPeriod: c.dropoffPeriod })),
    pricing.baseFeePP,
    pricing.differentHoursFee
  );

  const baseFee = feeCalc.baseFee;
  const additionalFee = feeCalc.additionalFee;
  const totalFee = feeCalc.totalFee;
  const hasDifferent = feeCalc.hasSore;

  // 3. Insert header record
  const { data: recData, error: recError } = await supabase
    .from('transport_records')
    .insert({
      user_id: userId,
      service_date: record.date,
      shared_pickup_time: record.sharedPickupTime || '07:00',
      base_fee: baseFee,
      additional_fee: additionalFee,
      total_fee: totalFee,
      status: record.status || 'completed',
      payment_status: record.paymentStatus || 'unpaid',
      has_different_dropoff: hasDifferent,
      notes: record.notes || null,
    } as unknown as Record<string, unknown>)
    .select()
    .single();

  if (recError || !recData) {
    if ((recError as { code?: string })?.code === '23505') {
      throw new Error(`Transaksi untuk tanggal ${record.date} sudah ada (Unique constraint).`);
    }
    throw recError || new Error('Gagal menyimpan transaksi');
  }

  const createdRec = recData as RecordRow;

  // 4. Insert line items
  if (record.children && record.children.length > 0) {
    const itemsToInsert = record.children.map((c) => ({
      transport_record_id: createdRec.id,
      child_id: c.childId,
      pickup_time: c.pickupTime,
      dropoff_time: c.dropoffTime,
      is_attending: c.isAttending,
      item_fee: 0,
      notes: null,
    }));

    const { error: itemsError } = await supabase
      .from('transport_items')
      .insert(itemsToInsert as unknown as Record<string, unknown>[]);

    if (itemsError) {
      console.error('Error inserting transport items:', itemsError);
    }
  }

  // 5. If paid, create payment record
  if (record.paymentStatus === 'paid') {
    await supabase.from('payments').insert({
      user_id: userId,
      transport_record_id: createdRec.id,
      amount: totalFee,
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: 'Transfer / Tunai',
    } as unknown as Record<string, unknown>);
  }

  return {
    id: createdRec.id,
    date: createdRec.service_date,
    sharedPickupTime: createdRec.shared_pickup_time,
    children: record.children,
    baseFee: Number(createdRec.base_fee),
    additionalFee: Number(createdRec.additional_fee),
    totalFee: Number(createdRec.total_fee),
    status: createdRec.status,
    paymentStatus: createdRec.payment_status,
    hasDifferentDropoff: createdRec.has_different_dropoff,
    notes: createdRec.notes || '',
  };
}

export async function updateTransportRecordInDB(
  recordId: string,
  userId: string,
  record: Partial<DailyTransportRecord>
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const pricing = await fetchPricingRulesFromDB(userId);

  // If children schedule is provided, recalculate fees
  let baseFee = record.baseFee;
  let additionalFee = record.additionalFee;
  let totalFee = record.totalFee;
  let hasDifferent = record.hasDifferentDropoff;

  if (record.children) {
    const attendingKids = record.children.filter((c) => c.isAttending);
    const feeCalc = calculateDailyFee(
      attendingKids.map((c) => ({ dropoffTime: c.dropoffTime, dropoffPeriod: c.dropoffPeriod })),
      pricing.baseFeePP,
      pricing.differentHoursFee
    );

    baseFee = feeCalc.baseFee;
    additionalFee = feeCalc.additionalFee;
    totalFee = feeCalc.totalFee;
    hasDifferent = feeCalc.hasSore;
  }

  const updateHeader: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (record.date) updateHeader.service_date = record.date;
  if (record.sharedPickupTime) updateHeader.shared_pickup_time = record.sharedPickupTime;
  if (baseFee !== undefined) updateHeader.base_fee = baseFee;
  if (additionalFee !== undefined) updateHeader.additional_fee = additionalFee;
  if (totalFee !== undefined) updateHeader.total_fee = totalFee;
  if (hasDifferent !== undefined) updateHeader.has_different_dropoff = hasDifferent;
  if (record.status) updateHeader.status = record.status;
  if (record.paymentStatus) updateHeader.payment_status = record.paymentStatus;
  if (record.notes !== undefined) updateHeader.notes = record.notes;

  const { error: headerError } = await supabase
    .from('transport_records')
    .update(updateHeader as unknown as Record<string, unknown>)
    .eq('id', recordId);

  if (headerError) throw headerError;

  // Replace transport items if provided
  if (record.children) {
    await supabase.from('transport_items').delete().eq('transport_record_id', recordId);

    const itemsToInsert = record.children.map((c) => ({
      transport_record_id: recordId,
      child_id: c.childId,
      pickup_time: c.pickupTime,
      dropoff_time: c.dropoffTime,
      is_attending: c.isAttending,
      item_fee: 0,
    }));

    await supabase.from('transport_items').insert(itemsToInsert as unknown as Record<string, unknown>[]);
  }
}

export async function deleteTransportRecordFromDB(recordId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from('transport_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
}

export async function togglePaymentStatusInDB(
  recordId: string,
  newStatus: 'paid' | 'unpaid',
  userId: string,
  totalFee: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from('transport_records')
    .update({ payment_status: newStatus, updated_at: new Date().toISOString() } as unknown as Record<string, unknown>)
    .eq('id', recordId);

  if (error) throw error;

  if (newStatus === 'paid') {
    await supabase.from('payments').insert({
      user_id: userId,
      transport_record_id: recordId,
      amount: totalFee,
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: 'Transfer / Tunai',
    } as unknown as Record<string, unknown>);
  } else {
    await supabase.from('payments').delete().eq('transport_record_id', recordId);
  }
}

// ==============================================================================
// TABLE INSPECTION & DIAGNOSTIC SERVICE
// ==============================================================================
export interface TableStatus {
  name: string;
  description: string;
  status: 'ok' | 'error' | 'empty' | 'loading';
  rowCount: number;
  errorMessage?: string;
  columns: string[];
}

export async function checkSupabaseTablesStatus(userId?: string): Promise<TableStatus[]> {
  const tables: Array<{ name: string; description: string; columns: string[] }> = [
    {
      name: 'profiles',
      description: 'Menyimpan profil pengguna, email, role, dan foto avatar.',
      columns: ['id (UUID PK)', 'name (TEXT)', 'email (TEXT)', 'role (TEXT)', 'avatar_url (TEXT)', 'created_at', 'updated_at'],
    },
    {
      name: 'children',
      description: 'Menyimpan data anak (Abid, Dhabit), urutan anak, jam default, sekolah, dan avatar.',
      columns: ['id (UUID PK)', 'user_id (UUID FK)', 'name (TEXT)', 'birth_order (TEXT)', 'default_pickup (TEXT)', 'default_dropoff (TEXT)', 'school (TEXT)', 'is_active (BOOLEAN)'],
    },
    {
      name: 'pricing_rules',
      description: 'Menyimpan aturan tarif dasar PP (Rp50.000) dan biaya tambahan beda jam jemput (Rp15.000).',
      columns: ['id (UUID PK)', 'user_id (UUID FK)', 'name (TEXT)', 'base_round_trip (NUMERIC)', 'different_pickup_fee (NUMERIC)', 'effective_from (DATE)', 'is_active (BOOLEAN)'],
    },
    {
      name: 'transport_records',
      description: 'Header transaksi harian dengan unique constraint per tanggal dan status pembayaran.',
      columns: ['id (UUID PK)', 'user_id (UUID FK)', 'service_date (DATE)', 'shared_pickup_time (TEXT)', 'base_fee (NUMERIC)', 'additional_fee (NUMERIC)', 'total_fee (NUMERIC)', 'payment_status (TEXT)'],
    },
    {
      name: 'transport_items',
      description: 'Detail baris per anak untuk jadwal antar, jemput, dan status kehadiran harian.',
      columns: ['id (UUID PK)', 'transport_record_id (UUID FK)', 'child_id (UUID FK)', 'pickup_time (TEXT)', 'dropoff_time (TEXT)', 'is_attending (BOOLEAN)'],
    },
    {
      name: 'payments',
      description: 'Buku besar pencatatan pelunasan transaksi dan metode pembayaran.',
      columns: ['id (UUID PK)', 'user_id (UUID FK)', 'transport_record_id (UUID FK)', 'amount (NUMERIC)', 'status (TEXT)', 'paid_at (TIMESTAMPTZ)', 'payment_method (TEXT)'],
    },
  ];

  if (!isSupabaseConfigured()) {
    return tables.map((t) => ({
      name: t.name,
      description: t.description,
      status: 'error',
      rowCount: 0,
      errorMessage: 'Koneksi Supabase belum dikonfigurasi',
      columns: t.columns,
    }));
  }

  const results: TableStatus[] = [];

  for (const t of tables) {
    try {
      let query = supabase.from(t.name).select('*', { count: 'exact', head: true });
      if (userId && t.name !== 'transport_items') {
        if (t.name === 'profiles') {
          query = query.eq('id', userId);
        } else {
          query = query.eq('user_id', userId);
        }
      }

      const { count, error } = await query;

      if (error) {
        results.push({
          name: t.name,
          description: t.description,
          status: 'error',
          rowCount: 0,
          errorMessage: error.message || 'Tabel belum dibuat di Supabase',
          columns: t.columns,
        });
      } else {
        const rowCount = count || 0;
        results.push({
          name: t.name,
          description: t.description,
          status: rowCount > 0 ? 'ok' : 'empty',
          rowCount,
          columns: t.columns,
        });
      }
    } catch (err: unknown) {
      results.push({
        name: t.name,
        description: t.description,
        status: 'error',
        rowCount: 0,
        errorMessage: err instanceof Error ? err.message : 'Gagal menghubungi tabel',
        columns: t.columns,
      });
    }
  }

  return results;
}

