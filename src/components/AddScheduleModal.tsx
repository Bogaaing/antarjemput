import React, { useState, useMemo } from 'react';
import { Child, DailyTransportRecord, PricingRules, formatRupiah } from '../types';
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

  // Track each child's attendance & times
  const [childrenState, setChildrenState] = useState<{
    [childId: string]: {
      isAttending: boolean;
      pickupTime: string;
      dropoffTime: string;
    };
  }>(() => {
    const state: { [key: string]: { isAttending: boolean; pickupTime: string; dropoffTime: string } } = {};
    childrenList.forEach((child) => {
      const existingChildSchedule = existingRecord?.children.find((c) => c.childId === child.id);
      state[child.id] = {
        isAttending: existingChildSchedule ? existingChildSchedule.isAttending : true,
        pickupTime: existingChildSchedule?.pickupTime || child.defaultPickupTime || '07:00',
        dropoffTime: existingChildSchedule?.dropoffTime || child.defaultDropoffTime || '12:00',
      };
    });
    return state;
  });

  const [notes, setNotes] = useState(existingRecord?.notes || '');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(
    existingRecord?.paymentStatus || 'unpaid'
  );

  // Dynamic cost calculation based on pricing rules
  const attendingChildren = childrenList.filter((c) => childrenState[c.id]?.isAttending);

  // Check if drop-off times differ among attending children
  const dropoffTimes = attendingChildren.map((c) => childrenState[c.id]?.dropoffTime);
  const uniqueDropoffTimes = new Set(dropoffTimes);
  const hasDifferentDropoff = attendingChildren.length > 1 && uniqueDropoffTimes.size > 1;

  const baseFee = attendingChildren.length > 0 ? pricingRules.baseFeePP : 0;
  const additionalFee = hasDifferentDropoff ? pricingRules.differentHoursFee : 0;
  const totalFee = baseFee + additionalFee;

  const handleToggleChild = (childId: string) => {
    setChildrenState((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        isAttending: !prev[childId]?.isAttending,
      },
    }));
  };

  const handleUpdateDropoff = (childId: string, time: string) => {
    setChildrenState((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        dropoffTime: time,
      },
    }));
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
      children: childrenList.map((c) => ({
        childId: c.id,
        isAttending: childrenState[c.id]?.isAttending ?? true,
        pickupTime: sharedPickupTime,
        dropoffTime: childrenState[c.id]?.dropoffTime ?? '12:00',
      })),
      baseFee,
      additionalFee,
      totalFee,
      status: 'completed',
      paymentStatus,
      hasDifferentDropoff,
      notes: notes.trim() || undefined,
    };

    onSave(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#F4F7FB] w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl border-0 sm:border border-[#E2E8F0] flex flex-col relative overflow-hidden my-auto max-h-screen sm:max-h-[92vh]">
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
            <h1 className="text-[20px] font-bold text-[#004ccd]">
              {existingRecord ? 'Edit Antar-Jemput' : 'Tambah Antar-Jemput'}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="text-[#737687] hover:text-[#191b24] p-1.5 rounded-lg hover:bg-[#F4F7FB] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </header>

        {/* Scrollable Form Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 pb-36">
          {/* Date Selection */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-3 shadow-xs">
            <label className="block text-[15px] font-semibold text-[#191b24]" htmlFor="schedule-date">
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
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#E2E8F0] bg-[#F4F7FB] focus:bg-white focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all text-[15px] font-medium text-[#191b24] cursor-pointer"
                required
              />
            </div>
            {(() => {
              const holiday = getIndonesianHoliday(selectedDate);
              if (!holiday) return null;
              return (
                <div className="bg-[#fff5f5] border border-[#ffdad6] p-3 rounded-lg flex items-center gap-2.5 text-[13px] text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[18px]">event_busy</span>
                  <span>
                    <strong>Tanggal Merah:</strong> {holiday.name} ({holiday.isCutiBersama ? 'Cuti Bersama' : 'Libur Nasional'})
                  </span>
                </div>
              );
            })()}
          </section>

          {/* Children Selection */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <label className="block text-[15px] font-semibold text-[#191b24]">Anak</label>
              <span className="text-[12px] text-[#737687]">Pilih anak yang diantar/jemput</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {childrenList.map((child) => {
                const isSelected = childrenState[child.id]?.isAttending;

                return (
                  <div
                    key={child.id}
                    onClick={() => handleToggleChild(child.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[#004ccd] bg-[#0f62fe]/10'
                        : 'border-[#E2E8F0] bg-white hover:border-[#c3c6d8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#004ccd] text-white' : 'border-2 border-[#c3c6d8] bg-white'
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check
                          </span>
                        )}
                      </div>
                      <span className="text-[16px] font-medium text-[#191b24]">{child.name}</span>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        child.roleTag === 'Kakak' ? 'bg-[#94efec] text-[#006e6d]' : 'bg-[#dbe1ff] text-[#003da9]'
                      }`}
                    >
                      {child.roleTag}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Schedule Configuration */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-5 shadow-xs">
            <h3 className="text-[18px] font-semibold text-[#191b24] border-b border-[#E2E8F0] pb-2">
              Jadwal
            </h3>

            {/* Global Pickup */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-[#424656]" htmlFor="pickup-time">
                Waktu Jemput (Bersama)
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
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all text-[15px] font-semibold text-[#191b24]"
                />
              </div>
            </div>

            {/* Individual Drop-off */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <label className="block text-[14px] font-medium text-[#424656]">
                Waktu Pulang (Individu)
              </label>

              {childrenList.map((child) => {
                const isAttending = childrenState[child.id]?.isAttending;
                if (!isAttending) return null;

                return (
                  <div
                    key={child.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F4F7FB] p-3 rounded-lg border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-[#191b24] min-w-[80px]">
                        {child.name}
                      </span>
                      <span className="text-[11px] text-[#737687]">({child.roleTag})</span>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737687]">
                        schedule
                      </span>
                      <input
                        type="time"
                        value={childrenState[child.id]?.dropoffTime || '12:00'}
                        onChange={(e) => handleUpdateDropoff(child.id, e.target.value)}
                        className="w-full pl-11 pr-4 py-2 rounded-lg border border-[#E2E8F0] bg-white focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all text-[15px] font-semibold text-[#191b24]"
                      />
                    </div>
                  </div>
                );
              })}

              {hasDifferentDropoff && (
                <div className="bg-[#ffdad6]/40 text-[#93000a] text-[12px] p-2.5 rounded-lg flex items-center gap-2 border border-[#ffdad6]">
                  <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">info</span>
                  <span>Jam kepulangan berbeda (+{formatRupiah(pricingRules.differentHoursFee)} otomatis diterapkan)</span>
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <label className="block text-[13px] font-medium text-[#424656] mb-1.5" htmlFor="notes-field">
                Catatan Tambahan (Opsional)
              </label>
              <input
                id="notes-field"
                type="text"
                placeholder="Contoh: Dhabit ada ekskul robotik sampai jam 15:00"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:border-[#004ccd] text-[14px] text-[#191b24] outline-none"
              />
            </div>
          </section>
        </main>

        {/* Real-Time Cost Preview Section (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#E2E8F0] p-4 px-6 z-30 shadow-[0_-4px_16px_rgba(15,98,254,0.1)]">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 w-full flex justify-between sm:justify-start sm:gap-8 items-center">
              <div className="space-y-0.5">
                <span className="block text-[11px] font-semibold text-[#737687] uppercase tracking-wider">
                  Ringkasan Biaya
                </span>
                <div className="flex items-center gap-2 text-[13px] text-[#424656]">
                  <span>Biaya dasar: {baseFee >= 1000 ? `${baseFee / 1000}k` : baseFee}</span>
                  <span>•</span>
                  <span>Tambahan: {additionalFee >= 1000 ? `${additionalFee / 1000}k` : additionalFee}</span>
                </div>
              </div>

              <div className="text-right sm:text-left">
                <span className="block text-[11px] font-bold text-[#004ccd] uppercase tracking-wider">
                  TOTAL
                </span>
                <span className="text-[22px] sm:text-[26px] font-bold text-[#004ccd] tracking-tight">
                  {formatRupiah(totalFee)}
                </span>
              </div>
            </div>

            <button
              id="btn-save-schedule"
              onClick={handleSave}
              className="w-full sm:w-auto bg-[#004ccd] hover:bg-[#003da9] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-98 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
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
