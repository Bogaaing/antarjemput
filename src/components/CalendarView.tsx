import React from 'react';
import { DailyTransportRecord, formatRupiah } from '../types';
import { getIndonesianHoliday, INDONESIAN_HOLIDAYS_2026 } from '../data/holidays2026';

interface CalendarViewProps {
  records: DailyTransportRecord[];
  currentYear: number;
  currentMonth: number; // 0-indexed (7 for August)
  onChangeMonth: (delta: number) => void;
  onSelectDate: (dateStr: string) => void;
  onOpenAddModal: (dateStr?: string) => void;
  onJumpToToday?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  currentYear,
  currentMonth,
  onChangeMonth,
  onSelectDate,
  onOpenAddModal,
  onJumpToToday,
}) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;

  // Realtime date comparison
  const today = new Date();
  const realYear = today.getFullYear();
  const realMonth = today.getMonth();
  const realDate = today.getDate();

  // Filter records for current month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

  const totalDays = monthRecords.length;
  const normalDays = monthRecords.filter((r) => !r.hasDifferentDropoff && r.additionalFee === 0).length;
  const extraDays = monthRecords.filter((r) => r.hasDifferentDropoff || r.additionalFee > 0).length;
  const totalCost = monthRecords.reduce((acc, r) => acc + r.totalFee, 0);

  // Calendar matrix calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPrefixSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Holidays in current month
  const holidaysThisMonth = Object.values(INDONESIAN_HOLIDAYS_2026).filter((h) =>
    h.date.startsWith(monthPrefix)
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5 pb-28 md:pb-12">
      {/* 1. Month Navigation Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[26px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
            {currentMonthName}
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-prev-month"
              onClick={() => onChangeMonth(-1)}
              className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#F4F7FB] active:scale-95 transition-all shadow-xs cursor-pointer"
              aria-label="Previous Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              id="btn-next-month"
              onClick={() => onChangeMonth(1)}
              className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#F4F7FB] active:scale-95 transition-all shadow-xs cursor-pointer"
              aria-label="Next Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <p className="text-[13px] md:text-[14px] text-[#64748B]">
          Jadwal antar-jemput & kalender hari libur nasional Indonesia
        </p>

        {onJumpToToday && (
          <div>
            <button
              onClick={onJumpToToday}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[13px] font-bold text-[#004ccd] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>Hari Ini</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Combined Single Summary Card */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-[#E2E8F0]">
          {/* Section 1: Hari Layanan */}
          <div className="flex items-center gap-3.5 sm:pr-4">
            <div className="w-11 h-11 rounded-full bg-[#E0EDFF] text-[#004ccd] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-[#004ccd] leading-none">
                  {totalDays}
                </span>
                <span className="text-[15px] font-bold text-[#191b24]">Hari</span>
              </div>
              <p className="text-[12px] text-[#64748B] font-medium mt-0.5">Layanan</p>
            </div>
          </div>

          {/* Section 2: Days Breakdown */}
          <div className="flex flex-col justify-center gap-1.5 sm:px-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#191b24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004ccd] shrink-0"></span>
              <span>{normalDays} Hari Normal</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#191b24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0"></span>
              <span>{extraDays} Hari Tambahan</span>
            </div>
          </div>

          {/* Section 3: Total Biaya Bulan Ini */}
          <div className="flex items-center gap-3.5 sm:pl-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E2E8F0]">
            <div className="w-11 h-11 rounded-full bg-[#E6F4EA] text-[#137333] font-bold flex items-center justify-center shrink-0 text-[15px]">
              Rp
            </div>
            <div>
              <p className="text-[20px] md:text-[22px] font-bold text-[#137333] leading-none">
                {formatRupiah(totalCost)}
              </p>
              <p className="text-[12px] text-[#64748B] font-medium mt-0.5">
                Total Biaya Bulan Ini
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#137333] mt-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Sesuai Anggaran</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary Calendar Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {/* Weekday Grid Headers */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          {['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'].map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 text-center text-[12px] font-bold tracking-wider ${
                idx === 0 || idx === 6 ? 'text-[#DC2626]' : 'text-[#DC2626]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 border-l border-[#E2E8F0]">
          {/* Empty prefix slots */}
          {emptyPrefixSlots.map((slot) => (
            <div
              key={`empty-${slot}`}
              className="aspect-square md:aspect-auto md:min-h-[84px] border-r border-b border-[#E2E8F0] bg-[#F8FAFC]/50"
            />
          ))}

          {/* Days of Month */}
          {daysArray.map((dayNum) => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = monthRecords.find((r) => r.date === dateStr);
            const holiday = getIndonesianHoliday(dateStr);

            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isRedDate = isSunday || !!holiday;

            const isToday =
              currentYear === realYear &&
              currentMonth === realMonth &&
              dayNum === realDate;

            const hasExtraFee = record && (record.hasDifferentDropoff || record.additionalFee > 0);
            const isPaid = record?.paymentStatus === 'paid';

            return (
              <div
                key={dateStr}
                id={`calendar-cell-${dayNum}`}
                onClick={() => onSelectDate(dateStr)}
                className={`aspect-square md:aspect-auto md:min-h-[84px] border-r border-b border-[#E2E8F0] p-1 md:p-2 flex flex-col items-center md:items-start justify-between relative cursor-pointer transition-all duration-150 group ${
                  holiday
                    ? 'bg-[#FFF5F5] hover:bg-[#FEE2E2]'
                    : isToday
                    ? 'bg-[#EFF6FF] hover:bg-[#DBEAFE]'
                    : isSunday
                    ? 'bg-[#FFF5F5]/70 hover:bg-[#FEE2E2]'
                    : isSaturday
                    ? 'hover:bg-[#F8FAFC]'
                    : 'hover:bg-[#F8FAFC]'
                }`}
              >
                {/* Date Number Badge */}
                <div className="w-full flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] md:text-[14px] transition-transform ${
                      isToday
                        ? 'bg-[#004ccd] text-white font-bold shadow-xs'
                        : isRedDate
                        ? 'font-bold text-[#DC2626]'
                        : isSaturday
                        ? 'font-bold text-[#D97706]'
                        : 'font-semibold text-[#191b24]'
                    }`}
                  >
                    {dayNum}
                  </div>

                  {holiday && (
                    <span
                      className="hidden md:inline-block w-2 h-2 rounded-full bg-[#DC2626]"
                      title={holiday.name}
                    ></span>
                  )}
                </div>

                {/* Holiday Label on Desktop */}
                {holiday && (
                  <span className="hidden md:block text-[10px] font-bold text-[#DC2626] truncate w-full">
                    {holiday.name}
                  </span>
                )}

                {/* Indicators Area */}
                {record ? (
                  <div className="flex items-center justify-center md:justify-between w-full mt-auto pt-1">
                    {/* Dot indicator */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full block ${
                          hasExtraFee ? 'bg-[#F59E0B]' : 'bg-[#004ccd]'
                        }`}
                        title={hasExtraFee ? 'Tambahan (Rp65.000)' : 'Normal (Rp50.000)'}
                      ></span>

                      {/* Payment Status Icon Badge */}
                      {isPaid ? (
                        <span
                          className="material-symbols-outlined text-[14px] text-[#198754] hidden sm:inline-block font-bold"
                          title="Lunas"
                        >
                          check
                        </span>
                      ) : (
                        <span
                          className="material-symbols-outlined text-[13px] text-[#DC2626] hidden sm:inline-block font-bold"
                          title="Belum dibayar"
                        >
                          priority_high
                        </span>
                      )}
                    </div>

                    {/* Compact Fee text on desktop */}
                    <span className="hidden md:inline-block text-[11px] font-bold text-[#475569]">
                      Rp{record.totalFee >= 1000 ? `${Math.round(record.totalFee / 1000)}k` : record.totalFee}
                    </span>
                  </div>
                ) : (
                  holiday && (
                    <div className="md:hidden mt-auto pb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] block"></span>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Calendar Legend */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-around gap-y-2 gap-x-4 text-[12px] font-medium text-[#475569]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004ccd]"></span>
            <span>Normal Siang (Rp50.000)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span>Tambahan Sore (Rp65.000)</span>
          </div>

          <div className="flex items-center gap-1 text-[#198754] font-semibold">
            <span className="material-symbols-outlined text-[15px]">check</span>
            <span>Lunas</span>
          </div>

          <div className="flex items-center gap-1 text-[#DC2626] font-semibold">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
            <span>Belum dibayar</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FFF5F5] border border-[#FECDD3] inline-block"></span>
            <span>Libur Nasional</span>
          </div>
        </div>
      </div>

      {/* 4. Compact CTA Button Below Calendar */}
      <button
        id="btn-add-schedule"
        onClick={() => onOpenAddModal()}
        className="w-full py-3.5 px-4 rounded-xl bg-[#004ccd] hover:bg-[#003da9] text-white font-bold text-[15px] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[22px]">add</span>
        <span>Tambah Antar-Jemput</span>
      </button>

      {/* 5. Compact Holiday Section */}
      <div className="bg-[#FFF5F5] rounded-2xl border border-[#FFDAD6] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#DC2626]">
              calendar_month
            </span>
            <h4 className="text-[14px] font-bold text-[#DC2626] tracking-tight">
              Hari Libur Nasional & Cuti Bersama
            </h4>
          </div>
          <span className="text-[12px] font-semibold text-[#DC2626] hover:underline cursor-pointer flex items-center gap-0.5">
            <span>Lihat semua</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </span>
        </div>

        <div className="space-y-2">
          {holidaysThisMonth.length > 0 ? (
            holidaysThisMonth.map((h) => {
              const dayStr = h.date.split('-')[2];
              const monthAbbrev = monthNames[currentMonth].substring(0, 3).toUpperCase();

              return (
                <div
                  key={h.date}
                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#FFDAD6]/60 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex flex-col items-center justify-center leading-none shrink-0">
                    <span className="text-[13px] font-bold">{dayStr}</span>
                    <span className="text-[8px] font-semibold uppercase">{monthAbbrev}</span>
                  </div>
                  <div className="truncate">
                    <p className="text-[13px] font-bold text-[#191b24] truncate">{h.name}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {h.isCutiBersama ? 'Cuti Bersama' : 'Libur Nasional'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[12px] text-[#64748B] italic bg-white p-3 rounded-xl border border-[#FFDAD6]/60">
              Tidak ada hari libur nasional di bulan ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
