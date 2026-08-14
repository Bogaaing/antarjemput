import React, { useState, useEffect, useCallback } from 'react';
import {
  Child,
  DailyTransportRecord,
  PricingRules,
  TabType,
  UserProfile,
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import {
  fetchUserProfile,
  fetchChildrenFromDB,
  fetchPricingRulesFromDB,
  fetchMonthlyRecordsFromDB,
  createTransportRecordInDB,
  updateTransportRecordInDB,
  deleteTransportRecordFromDB,
  togglePaymentStatusInDB,
  createChildInDB,
  updateChildInDB,
  deleteChildFromDB,
  savePricingRulesToDB,
  signOutUser,
} from './lib/supabase/db';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { CalendarView } from './components/CalendarView';
import { HistoryRekapView } from './components/HistoryRekapView';
import { ChildrenManagementView } from './components/ChildrenManagementView';
import { PricingSettingsView } from './components/PricingSettingsView';
import { ReportsView } from './components/ReportsView';
import { AddScheduleModal } from './components/AddScheduleModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { ShareInvoiceModal } from './components/ShareInvoiceModal';
import { ChildEditModal } from './components/ChildEditModal';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Orang Tua',
  email: '',
  role: 'Orang Tua',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYdEa71V6z5oW_P9U4L03y16dJ3-y0U5N3fK9A9g1m=s96-c',
};

const DEFAULT_PRICING: PricingRules = {
  baseFeePP: 50000,
  differentHoursFee: 15000,
  effectiveDate: '2026-08-01',
  description: 'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000',
};

export default function App() {
  // Authentication & User State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<TabType>('calendar');

  // Month navigation (Defaults to August 2026 or Current Realtime)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed (7 is August)

  // Supabase Data States
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_PRICING);
  const [records, setRecords] = useState<DailyTransportRecord[]>([]);

  // Loading & Feedback States
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals & Bottom Sheets State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>('2026-08-14');
  const [editingRecord, setEditingRecord] = useState<DailyTransportRecord | null>(null);

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Auto clear notifications after 4s
  useEffect(() => {
    if (actionError || actionSuccess) {
      const t = setTimeout(() => {
        setActionError(null);
        setActionSuccess(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [actionError, actionSuccess]);

  // Load all user data from Supabase PostgreSQL
  const loadUserData = useCallback(async (userId: string, year: number, month: number) => {
    if (!userId) return;
    setIsLoadingData(true);
    try {
      const [profileData, kidsData, pricingData, monthRecords] = await Promise.all([
        fetchUserProfile(userId),
        fetchChildrenFromDB(userId),
        fetchPricingRulesFromDB(userId),
        fetchMonthlyRecordsFromDB(userId, year, month),
      ]);

      setUser(profileData);
      setChildrenList(kidsData);
      setPricingRules(pricingData);
      setRecords(monthRecords);
    } catch (err: unknown) {
      console.error('Error loading Supabase data:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal memuat data dari database');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        if (!isSupabaseConfigured()) {
          if (isMounted) setIsAuthChecking(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setCurrentUserId(session.user.id);
          await loadUserData(session.user.id, currentYear, currentMonth);
        }
      } catch (err) {
        console.error('Auth session error:', err);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    }

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        await loadUserData(session.user.id, currentYear, currentMonth);
      } else {
        setCurrentUserId(null);
        setUser(DEFAULT_PROFILE);
        setChildrenList([]);
        setRecords([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, currentYear, currentMonth]);

  // Reload records when month/year changes
  useEffect(() => {
    if (currentUserId) {
      fetchMonthlyRecordsFromDB(currentUserId, currentYear, currentMonth).then((recs) => {
        setRecords(recs);
      });
    }
  }, [currentUserId, currentYear, currentMonth]);

  // Month navigation handler
  const handleMonthChange = (delta: number) => {
    let nextMonth = currentMonth + delta;
    let nextYear = currentYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    } else if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Record Handlers (Supabase PostgreSQL CRUD)
  const handleSaveRecord = async (record: DailyTransportRecord) => {
    if (!currentUserId) return;
    try {
      if (editingRecord) {
        // Update existing record
        await updateTransportRecordInDB(editingRecord.id, currentUserId, record);
        setActionSuccess('Transaksi berhasil diperbarui di database.');
      } else {
        // Create new record
        await createTransportRecordInDB(currentUserId, record);
        setActionSuccess('Jadwal antar-jemput berhasil disimpan ke database.');
      }

      // Refresh monthly records from database
      const updated = await fetchMonthlyRecordsFromDB(currentUserId, currentYear, currentMonth);
      setRecords(updated);

      setIsAddModalOpen(false);
      setEditingRecord(null);
    } catch (err: unknown) {
      console.error('Save record error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!currentUserId) return;
    try {
      await deleteTransportRecordFromDB(recordId);
      setActionSuccess('Transaksi berhasil dihapus dari database.');
      setSelectedRecordId(null);

      // Refresh records
      const updated = await fetchMonthlyRecordsFromDB(currentUserId, currentYear, currentMonth);
      setRecords(updated);
    } catch (err: unknown) {
      console.error('Delete record error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus transaksi');
    }
  };

  const handleTogglePayment = async (recordId: string) => {
    if (!currentUserId) return;
    const targetRec = records.find((r) => r.id === recordId);
    if (!targetRec) return;

    const newStatus: 'paid' | 'unpaid' = targetRec.paymentStatus === 'paid' ? 'unpaid' : 'paid';

    try {
      await togglePaymentStatusInDB(recordId, newStatus, currentUserId, targetRec.totalFee);
      // Optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, paymentStatus: newStatus } : r))
      );
      setActionSuccess(
        newStatus === 'paid' ? 'Status diubah menjadi Lunas.' : 'Status diubah menjadi Belum Lunas.'
      );
    } catch (err: unknown) {
      console.error('Toggle payment error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal memperbarui status pembayaran');
    }
  };

  // Child Handlers (Supabase PostgreSQL CRUD)
  const handleSaveChild = async (child: Child) => {
    if (!currentUserId) return;
    try {
      if (editingChild) {
        await updateChildInDB(editingChild.id, child);
        setActionSuccess(`Profil ${child.name} berhasil diperbarui.`);
      } else {
        await createChildInDB(currentUserId, child);
        setActionSuccess(`Anak ${child.name} berhasil ditambahkan ke database.`);
      }

      // Refresh children
      const freshKids = await fetchChildrenFromDB(currentUserId);
      setChildrenList(freshKids);

      setIsChildModalOpen(false);
      setEditingChild(null);
    } catch (err: unknown) {
      console.error('Save child error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan profil anak');
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!currentUserId) return;
    try {
      await deleteChildFromDB(childId);
      setActionSuccess('Data anak berhasil dihapus.');
      const freshKids = await fetchChildrenFromDB(currentUserId);
      setChildrenList(freshKids);

      setIsChildModalOpen(false);
      setEditingChild(null);
    } catch (err: unknown) {
      console.error('Delete child error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus anak');
    }
  };

  // Pricing Rules Update Handler
  const handleSavePricing = async (newRules: PricingRules) => {
    if (!currentUserId) return;
    try {
      await savePricingRulesToDB(currentUserId, newRules);
      setPricingRules(newRules);
      setActionSuccess('Tarif berhasil diperbarui di database.');

      // Refresh monthly records to reflect recalculated fees
      const updated = await fetchMonthlyRecordsFromDB(currentUserId, currentYear, currentMonth);
      setRecords(updated);
    } catch (err: unknown) {
      console.error('Save pricing error:', err);
      setActionError(err instanceof Error ? err.message : 'Gagal memperbarui tarif');
    }
  };

  // Seed sample initial children to Supabase if brand new account
  const handleSeedInitialChildren = async () => {
    if (!currentUserId) return;
    try {
      setIsLoadingData(true);
      await createChildInDB(currentUserId, {
        name: 'ABID',
        roleTag: 'Kakak',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlB89wCdgPHMwr3buo-DaIJ7cYy1_oXgCKOTI1dEczo-6GRSynqTuIVIXgVulCE72DP0_LYFlIu-clLX5231aYVMpfNjHlXu092DhLMy1ZWPxvQ-d43aFZmfi7eWOC_DlWqG-snUtUuUcnHf2ZqjMRq-i9oZ7E_yEJeyxaGjlyLzOBLeZzP4hU7N5oMkmPgKMR5dzxnsMsGkcT-gSwucEf9EINFNPEXcyBVz4qNJfLnF-ZsRKGRZsA',
        defaultPickupTime: '07:00',
        defaultDropoffTime: '12:00',
        school: 'SD Al-fath Bsd',
        notes: 'Kelas 4',
      });
      await createChildInDB(currentUserId, {
        name: 'DHABIT',
        roleTag: 'Adik',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCFV6TR1OwzvI24Gt7q4oAmpUjdnhR4jzDzoTH7lRFF6SaTZI787kWmgn0eKPH_TrGY6p27FVm-o5LkQxYpDjnCGxIcrY4iJLUkwd-hqzOcea5IyVcPM3cet52jla2u41KNsiNaL7lSXcPLv0TazVXHFPdZZYq0d1WwdEGPUbmv79AYQE8e5VQSR4MO9K0IiLkHPowHmDqY9jf8VB1edtBUnUcmDP7BkHTMV3QHdsMH02jFpMYrYVR5OA',
        defaultPickupTime: '07:00',
        defaultDropoffTime: '12:00',
        school: 'SD Al-fath Bsd',
        notes: 'Kelas TK B',
      });

      const freshKids = await fetchChildrenFromDB(currentUserId);
      setChildrenList(freshKids);
      setActionSuccess('Data awal Abid & Dhabit berhasil disimpan ke Supabase PostgreSQL!');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menambahkan data awal');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Open add modal helper
  const handleOpenAddModal = (dateStr?: string) => {
    if (childrenList.length === 0) {
      alert('Tambahkan setidaknya satu profil anak terlebih dahulu di menu Children Management.');
      setCurrentTab('children');
      return;
    }
    setModalDate(dateStr || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-14`);
    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal from transaction detail
  const handleEditFromDetail = (record: DailyTransportRecord) => {
    setSelectedRecordId(null);
    setEditingRecord(record);
    setModalDate(record.date);
    setIsAddModalOpen(true);
  };

  // Selected Record Object for Modal
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-[#004ccd] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[14px] font-semibold text-[#424656]">Menghubungkan ke Supabase...</p>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <LoginScreen
        onLogin={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUserId(session.user.id);
            await loadUserData(session.user.id, currentYear, currentMonth);
          }
        }}
      />
    );
  }

  // Titles for Mobile Top Bar
  const tabTitles: { [key in TabType]: string } = {
    calendar: 'AntarJemputKu',
    history: `Rekap ${currentMonthName}`,
    children: 'Children Management',
    pricing: 'Pricing Rules',
    reports: 'Reports',
  };

  return (
    <div className="bg-[#F4F7FB] text-[#191b24] min-h-screen flex flex-col md:flex-row antialiased selection:bg-[#0f62fe]/20">
      {/* Toast Notifications */}
      {actionError && (
        <div className="fixed top-4 right-4 z-50 bg-[#fff5f5] border border-[#ffdad6] text-[#ba1a1a] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-[14px] font-semibold animate-fadeIn max-w-md">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-[14px] font-semibold animate-fadeIn max-w-md">
          <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Desktop Sidebar (Fixed 280px) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogout={async () => {
          await signOutUser();
          setCurrentUserId(null);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] w-full min-h-screen">
        {/* Mobile Header & Bottom Navigation Shell */}
        <MobileNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          user={user}
          title={tabTitles[currentTab]}
          onOpenProfileModal={() => setCurrentTab('pricing')}
        />

        {/* Database Quick Action Banner if database is newly initialized */}
        {childrenList.length === 0 && !isLoadingData && (
          <div className="mx-4 md:mx-8 mt-4 p-4 rounded-xl bg-[#dbe1ff]/50 border border-[#0f62fe]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#004ccd]">info</span>
              <span>
                <strong>Database Baru:</strong> Belum ada data anak di PostgreSQL Supabase. Tambahkan profil anak atau gunakan inisialisasi awal.
              </span>
            </div>
            <button
              onClick={handleSeedInitialChildren}
              className="px-3.5 py-1.5 rounded-lg bg-[#004ccd] hover:bg-[#003da9] text-white font-semibold whitespace-nowrap shadow-xs cursor-pointer"
            >
              + Inisialisasi Abid & Dhabit ke Supabase
            </button>
          </div>
        )}

        {/* Content View Switching */}
        <main className="flex-1">
          {isLoadingData ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#004ccd] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[13px] text-[#424656]">Memuat data dari Supabase PostgreSQL...</p>
            </div>
          ) : (
            <>
              {currentTab === 'calendar' && (
                <CalendarView
                  records={records}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onChangeMonth={handleMonthChange}
                  onJumpToToday={() => {
                    const now = new Date();
                    setCurrentYear(now.getFullYear());
                    setCurrentMonth(now.getMonth());
                  }}
                  onSelectDate={(dateStr) => {
                    const rec = records.find((r) => r.date === dateStr);
                    if (rec) {
                      setSelectedRecordId(rec.id);
                    } else {
                      handleOpenAddModal(dateStr);
                    }
                  }}
                  onOpenAddModal={handleOpenAddModal}
                />
              )}

              {currentTab === 'history' && (
                <HistoryRekapView
                  records={records}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onChangeMonth={handleMonthChange}
                  onSelectRecord={(recId) => setSelectedRecordId(recId)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onTogglePayment={handleTogglePayment}
                />
              )}

              {currentTab === 'children' && (
                <ChildrenManagementView
                  childrenList={childrenList}
                  onAddChild={() => {
                    setEditingChild(null);
                    setIsChildModalOpen(true);
                  }}
                  onEditChild={(child) => {
                    setEditingChild(child);
                    setIsChildModalOpen(true);
                  }}
                  onDeleteChild={handleDeleteChild}
                />
              )}

              {currentTab === 'pricing' && (
                <PricingSettingsView
                  pricingRules={pricingRules}
                  onSavePricing={handleSavePricing}
                  userId={currentUserId || undefined}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  records={records.filter((r) =>
                    r.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)
                  )}
                  childrenList={childrenList}
                  monthName={currentMonthName}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Schedule Modal */}
      {isAddModalOpen && (
        <AddScheduleModal
          initialDate={modalDate}
          existingRecord={editingRecord || undefined}
          childrenList={childrenList}
          pricingRules={pricingRules}
          onSave={handleSaveRecord}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}

      {/* Transaction Detail Modal */}
      {selectedRecord && (
        <TransactionDetailModal
          record={selectedRecord}
          childrenList={childrenList}
          onClose={() => setSelectedRecordId(null)}
          onEdit={handleEditFromDetail}
          onTogglePayment={handleTogglePayment}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* Share Invoice Modal */}
      {isShareModalOpen && (
        <ShareInvoiceModal
          records={records.filter((r) =>
            r.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)
          )}
          monthName={currentMonthName}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Child Edit / Add Modal */}
      {isChildModalOpen && (
        <ChildEditModal
          child={editingChild}
          onSave={handleSaveChild}
          onDelete={handleDeleteChild}
          onClose={() => {
            setIsChildModalOpen(false);
            setEditingChild(null);
          }}
        />
      )}
    </div>
  );
}
