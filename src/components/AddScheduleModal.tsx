import React, { useState, useMemo } from 'react';
import {
  Child,
  DailyTransportRecord,
  PricingRules,
  ReturnPeriod,
  getReturnPeriod,
  getReturnPeriodTime,
  calculateDailyFee,
  formatRupiah,
} from '../types';
import { getIndonesianHoliday } from '../data/holidays2026';

interface AddScheduleModalProps {
  initialDate?: string;
  existingRecord?: DailyTransportRecord;
  childrenList: Child[];
  pricingRules: PricingRules;
  onSave: (record: DailyTransportRecord) => void;
  onClose: () => void;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  initialDate = '2026-08-14',
  existingRecord,
  childrenList,
  pricingRules,
  onSave,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState(existingRecord?.date || initialDate);
  const [sharedPickupTime, setSharedPickupTime] = useState(
    existingRecord?.sharedPickupTime || '07:00'
  );

  // Track each child's attendance & return period (siang / sore)
  const [childrenState, setChildrenState] = useState<{
    [childId: string]: {
      isAttending: boolean;
      returnPeriod: ReturnPeriod;
    };
  }>(() => {
    const state: { [key: string]: { isAttending: boolean; returnPeriod: ReturnPeriod } } = {};
    childrenList.forEach((child) => {
      const existingChildSchedule = existingRecord?.children.find((c) => c.childId === child.id);
      const defaultPeriod =
        child.defaultDropoffPeriod || getReturnPeriod(child.defaultDropoffTime);

      state[child.id] = {
        isAttending: existingChildSchedule ? existingChildSchedule.isAttending : true,
        returnPeriod: existingChildSchedule
          ? getReturnPeriod(existingChildSchedule.dropoffTime)
          : defaultPeriod,
      };
    });
    return state;
  });

  const [notes, setNotes] = useState(existingRecord?.notes || '');
  const [paymentStatus] = useState<'paid' | 'unpaid'>(
    existingRecord?.paymentStatus || 'unpaid'
  );

  // Attending children list
  const attendingChildren = childrenList.filter((c) => childrenState[c.id]?.isAttending);

  // Calculate pricing based on single source of truth
  const { baseFee, additionalFee, totalFee, hasSore } = useMemo(() => {
    const activeKids = attendingChildren.map((c) => ({
      dropoffPeriod: childrenState[c.id]?.returnPeriod,
    }));
    return calculateDailyFee(activeKids, pricingRules.baseFeePP, pricingRules.differentHoursFee);
  }, [attendingChildren, childrenState, pricingRules]);

  const handleToggleChild = (childId: string) => {
    setChildrenState((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        isAttending: !prev[childId]?.isAttending,
      },
    }));
  };

  const handleSelectPeriod = (childId: string, period: ReturnPeriod) => {
    setChildrenState((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        returnPeriod: period,
      },
    }));
  };

  const handleSetAllPeriod = (period: ReturnPeriod) => {
    setChildrenState((prev) => {
      const next = { ...prev };
      childrenList.forEach((c) => {
        if (next[c.id]) {
          next[c.id] = { ...next[c.id], returnPeriod: period };
        }
      });
      return next;
    });
  };

  const handleSave = () => {
    if (attendingChildren.length === 0) {
      alert('Pilih setidaknya satu anak untuk dijadwalkan.');
      return;
    }

    const newRecord: DailyTransportRecord = {
      id: existingRecord?.id || `rec-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      sharedPickupTime,
      children: childrenList.map((c) => {
        const period = childrenState[c.id]?.returnPeriod || 'siang';
        return {
          childId: c.id,
          isAttending: childrenState[c.id]?.isAttending ?? true,
          pickupTime: sharedPickupTime,
          dropoffTime: getReturnPeriodTime(period),
          dropoffPeriod: period,
        };
      }),
      baseFee,
      additionalFee,
      totalFee,
      status: 'completed',
      paymentStatus,
      hasDifferentDropoff: hasSore,
      notes: notes.trim() || undefined,
    };

    onSave(newRecord);
  };

  const holiday = getIndonesianHoliday(selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#F4F7FB] w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border-0 sm:border border-[#E2E8F0] flex flex-col relative overflow-hidden my-auto max-h-screen sm:max-h-[92vh]">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E2E8F0] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-[#424656] hover:bg-[#F4F7FB] p-2 rounded-full transition-colors cursor-pointer"
              aria-label="Kembali"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-[19px] font-extrabold text-[#004ccd] tracking-tight">
              {existingRecord ? 'Edit Antar-Jemput' : 'Tambah Antar-Jemput'}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="text-[#737687] hover:text-[#191b24] p-1.5 rounded-lg hover:bg-[#F4F7FB] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </header>

        {/* Scrollable Form Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-36">
          {/* 1. Date Selection */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 space-y-2.5 shadow-xs">
            <label className="block text-[14px] font-bold text-[#191b24]" htmlFor="schedule-date">
              Tanggal
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737687]">
                calendar_month
              </span>
              <input
                id="schedule-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all text-[14px] font-semibold text-[#191b24] cursor-pointer"
                required
              />
            </div>
            {holiday && (
              <div className="bg-[#FFF5F5] border border-[#FFDAD6] p-3 rounded-xl flex items-center gap-2.5 text-[12px] text-[#BA1A1A] font-medium">
                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                <span>
                  <strong>Tanggal Merah:</strong> {holiday.name} ({holiday.isCutiBersama ? 'Cuti Bersama' : 'Libur Nasional'})
                </span>
              </div>
            )}
          </section>

          {/* 2. Children Selection */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <label className="block text-[14px] font-bold text-[#191b24]">Anak</label>
              <span className="text-[12px] text-[#737687]">Pilih anak yang berangkat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {childrenList.map((child) => {
                const isSelected = childrenState[child.id]?.isAttending;

                return (
                  <div
                    key={child.id}
                    onClick={() => handleToggleChild(child.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#004ccd] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#004ccd] text-white' : 'border-2 border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] font-bold">
                            check
                          </span>
                        )}
                      </div>
                      <span className="text-[15px] font-bold text-[#191b24]">{child.name}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        child.roleTag === 'Kakak'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : 'bg-[#DBEAFE] text-[#1E40AF]'
                      }`}
                    >
                      {child.roleTag}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Schedule & Return Period (Siang / Sore) */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <h3 className="text-[15px] font-bold text-[#191b24]">
                Jadwal & Kepulangan
              </h3>

              {attendingChildren.length > 1 && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B]">
                  <span>Set semua:</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllPeriod('siang')}
                    className="px-2 py-0.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#004ccd] cursor-pointer"
                  >
                    Siang
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllPeriod('sore')}
                    className="px-2 py-0.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#D97706] cursor-pointer"
                  >
                    Sore
                  </button>
                </div>
              )}
            </div>

            {/* Jam Antar */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#64748B]" htmlFor="pickup-time">
                Jam Antar (Bersama)
              </label>
              <div className="relative max-w-xs">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737687]">
                  schedule
                </span>
                <input
                  id="pickup-time"
                  type="time"
                  value={sharedPickupTime}
                  onChange={(e) => setSharedPickupTime(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all text-[14px] font-bold text-[#191b24]"
                />
              </div>
            </div>

            {/* Pilihan Kepulangan per Anak */}
            <div className="space-y-3 pt-2">
              <label className="block text-[13px] font-bold text-[#191b24]">
                Pilihan Pulang
              </label>

              {childrenList.map((child) => {
                const isAttending = childrenState[child.id]?.isAttending;
                if (!isAttending) return null;

                const currentPeriod = childrenState[child.id]?.returnPeriod || 'siang';

                return (
                  <div
                    key={child.id}
                    className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#004ccd]"></span>
                      <span className="text-[14px] font-extrabold text-[#191b24]">
                        {child.name}
                      </span>
                      <span className="text-[11px] text-[#64748B]">({child.roleTag})</span>
                    </div>

                    {/* Segmented Selection: Siang vs Sore */}
                    <div className="flex gap-2">
                      {/* Option Siang */}
                      <button
                        type="button"
                        onClick={() => handleSelectPeriod(child.id, 'siang')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                          currentPeriod === 'siang'
                            ? 'bg-[#004ccd] text-white shadow-sm'
                            : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <span>☀</span>
                        <span>Siang (12:00)</span>
                      </button>

                      {/* Option Sore */}
                      <button
                        type="button"
                        onClick={() => handleSelectPeriod(child.id, 'sore')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                          currentPeriod === 'sore'
                            ? 'bg-[#004ccd] text-white shadow-sm'
                            : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <span>🌇</span>
                        <span>Sore (15:00)</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Status Explanation Banner */}
              <div
                className={`p-3 rounded-xl border text-[12px] font-medium flex items-start gap-2 ${
                  hasSore
                    ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                    : 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E40AF]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                  {hasSore ? 'more_time' : 'info'}
                </span>
                <div>
                  {hasSore ? (
                    <p>
                      <strong>Ada kepulangan Sore:</strong> Dikenakan tarif Rp65.000 (Tarif normal Rp50.000 + Rp15.000 tambahan sore flat per hari).
                    </p>
                  ) : (
                    <p>
                      <strong>Semua pulang Siang:</strong> Dikenakan tarif normal Rp50.000 per hari.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <label className="block text-[12px] font-semibold text-[#64748B] mb-1" htmlFor="notes-field">
                Catatan (Opsional)
              </label>
              <input
                id="notes-field"
                type="text"
                placeholder="Contoh: Dhabit ada les musik sampai jam 15:00"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:border-[#004ccd] text-[13px] text-[#191b24] outline-none"
              />
            </div>
          </section>
        </main>

        {/* Real-Time Cost Preview Sticky Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#E2E8F0] p-4 px-6 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 w-full flex justify-between sm:justify-start sm:gap-8 items-center">
              <div className="space-y-0.5">
                <span className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Biaya Hari Ini
                </span>
                <div className="flex items-center gap-2 text-[12px] text-[#424656] font-semibold">
                  <span>Normal: Rp50k</span>
                  <span>•</span>
                  <span>Tambahan: {hasSore ? 'Rp15k' : 'Rp0'}</span>
                </div>
              </div>

              <div className="text-right sm:text-left">
                <span className="block text-[10px] font-bold text-[#004ccd] uppercase tracking-wider">
                  TOTAL
                </span>
                <span className="text-[22px] sm:text-[26px] font-extrabold text-[#004ccd] tracking-tight">
                  {formatRupiah(totalFee)}
                </span>
              </div>
            </div>

            <button
              id="btn-save-schedule"
              onClick={handleSave}
              className="w-full sm:w-auto bg-[#004ccd] hover:bg-[#003da9] text-white px-7 py-3.5 rounded-2xl text-[15px] font-bold transition-all active:scale-98 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>Simpan Antar-Jemput</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
