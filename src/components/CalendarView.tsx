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

  // Realtime date object
  const today = new Date();
  const realYear = today.getFullYear();
  const realMonth = today.getMonth();
  const realDate = today.getDate();

  // Filter records for this month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

  const totalDays = monthRecords.length;
  const normalDays = monthRecords.filter((r) => !r.hasDifferentDropoff && r.additionalFee === 0).length;
  const extraDays = monthRecords.filter((r) => r.hasDifferentDropoff || r.additionalFee > 0).length;
  const totalCost = monthRecords.reduce((acc, r) => acc + r.totalFee, 0);

  // Calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create grid cells
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPrefixSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // List of holidays in current month
  const holidaysThisMonth = Object.values(INDONESIAN_HOLIDAYS_2026).filter((h) =>
    h.date.startsWith(monthPrefix)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
              {currentMonthName}
            </h2>
            {currentYear === realYear && currentMonth === realMonth && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#198754]/15 text-[#198754] border border-[#198754]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#198754] animate-pulse"></span>
                Realtime
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#424656]">
            Jadwal antar-jemput & kalender hari libur nasional Indonesia
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onJumpToToday && (
            <button
              onClick={onJumpToToday}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[13px] font-semibold text-[#004ccd] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Kembali ke Bulan/Hari Ini"
            >
              <span className="material-symbols-outlined text-[16px]">today</span>
              <span>Hari Ini</span>
            </button>
          )}

          <div className="flex gap-1.5">
            <button
              id="btn-prev-month"
              onClick={() => onChangeMonth(-1)}
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#f2f3ff] transition-colors shadow-xs cursor-pointer"
              aria-label="Previous Month"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              id="btn-next-month"
              onClick={() => onChangeMonth(1)}
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#f2f3ff] transition-colors shadow-xs cursor-pointer"
              aria-label="Next Month"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Total Layanan */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <p className="text-[14px] font-medium text-[#424656] mb-1">Total Layanan</p>
          <p className="text-[28px] font-bold text-[#004ccd] tracking-tight">
            {totalDays}{' '}
            <span className="text-[20px] text-[#424656] font-normal">Hari</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-[12px] font-semibold">
            <div className="flex items-center gap-1.5 text-[#191b24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f62fe] shrink-0"></span>
              <span>{normalDays} Hari Normal</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#191b24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0"></span>
              <span>{extraDays} Hari Tambahan</span>
            </div>
          </div>
        </div>

        {/* Card 2: Estimasi Biaya Bulan Ini */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <p className="text-[14px] font-medium text-[#424656] mb-1">Estimasi Biaya Bulan Ini</p>
          <p className="text-[28px] font-bold text-[#191b24] tracking-tight">
            {formatRupiah(totalCost)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#198754]">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span>Sesuai Anggaran</span>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F4F7FB]">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-[12px] font-semibold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-[#ba1a1a] font-bold' : 'text-[#424656]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-l border-[#E2E8F0]">
          {/* Empty prefix slots */}
          {emptyPrefixSlots.map((slot) => (
            <div
              key={`empty-${slot}`}
              className="aspect-square md:aspect-auto md:min-h-[105px] border-r border-b border-[#E2E8F0] p-1 md:p-2 bg-[#F4F7FB]/40"
            />
          ))}

          {/* Days in month */}
          {daysArray.map((dayNum) => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = monthRecords.find((r) => r.date === dateStr);
            const holiday = getIndonesianHoliday(dateStr);
            
            // Check day of week for weekend styling
            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isRedDate = isSunday || !!holiday;

            // Is real-time today
            const isToday =
              currentYear === realYear &&
              currentMonth === realMonth &&
              dayNum === realDate;

            const hasExtraFee = record && (record.hasDifferentDropoff || record.additionalFee > 0);

            return (
              <div
                key={dateStr}
                id={`calendar-cell-${dayNum}`}
                onClick={() => {
                  if (record) {
                    onSelectDate(dateStr);
                  } else {
                    onOpenAddModal(dateStr);
                  }
                }}
                className={`aspect-square md:aspect-auto md:min-h-[105px] border-r border-b border-[#E2E8F0] p-1 md:p-2 flex flex-col items-center md:items-start relative cursor-pointer transition-all duration-150 group ${
                  holiday
                    ? 'bg-[#ffdad6]/25 hover:bg-[#ffdad6]/40'
                    : isToday
                    ? 'bg-[#dbe1ff]/35 hover:bg-[#dbe1ff]/50 ring-2 ring-inset ring-[#004ccd]'
                    : isSunday
                    ? 'bg-[#fff5f5]/60 hover:bg-[#ffebeb]'
                    : isSaturday
                    ? 'bg-[#faf8ff]/60 hover:bg-[#f2f3ff]'
                    : hasExtraFee
                    ? 'bg-[#ffdad6]/20 hover:bg-[#ffdad6]/35'
                    : 'hover:bg-[#f2f3ff]'
                }`}
                title={holiday ? `Libur: ${holiday.name}` : undefined}
              >
                {/* Top Row: Date Number & Holiday Indicator */}
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[13px] md:text-[14px] ${
                      isToday
                        ? 'bg-[#004ccd] text-white font-bold shadow-xs'
                        : isRedDate
                        ? 'font-bold text-[#ba1a1a]'
                        : isSaturday
                        ? 'font-semibold text-[#b45309]'
                        : record
                        ? 'font-semibold text-[#191b24]'
                        : 'text-[#424656]'
                    }`}
                  >
                    {dayNum}
                  </div>

                  {holiday && (
                    <span
                      className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#ba1a1a]/15 text-[#ba1a1a] border border-[#ba1a1a]/20"
                      title={holiday.name}
                    >
                      LIBUR
                    </span>
                  )}
                </div>

                {/* Holiday Title on Desktop */}
                {holiday && (
                  <div className="hidden md:block w-full text-[10px] font-bold text-[#ba1a1a] line-clamp-2 leading-tight mb-1 bg-white/80 p-1 rounded border border-[#ba1a1a]/20">
                    {holiday.name}
                  </div>
                )}

                {/* Status Badges for scheduled transport */}
                {record ? (
                  <>
                    {/* Desktop Pill */}
                    <div
                      className={`hidden md:flex items-center gap-1.5 mt-auto bg-white border rounded px-1.5 py-0.5 text-[11px] font-semibold w-full shadow-xs truncate ${
                        hasExtraFee
                          ? 'border-[#F59E0B]/40 text-[#b45309]'
                          : 'border-[#E2E8F0] text-[#004ccd]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          hasExtraFee ? 'bg-[#F59E0B]' : 'bg-[#0f62fe]'
                        }`}
                      ></span>
                      <span className="truncate">
                        Rp{record.totalFee >= 1000 ? `${Math.round(record.totalFee / 1000)}K` : record.totalFee}
                      </span>
                    </div>

                    {/* Mobile Dot */}
                    <div className="md:hidden mt-auto flex items-center justify-center gap-1 w-full pb-0.5">
                      <span
                        className={`w-2 h-2 rounded-full block ${
                          hasExtraFee ? 'bg-[#F59E0B]' : 'bg-[#0f62fe]'
                        }`}
                      ></span>
                      {holiday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] block" title="Libur"></span>
                      )}
                    </div>
                  </>
                ) : (
                  holiday && (
                    <div className="md:hidden mt-auto flex justify-center w-full pb-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] block" title={holiday.name}></span>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Holiday list card for current month if any */}
      {holidaysThisMonth.length > 0 && (
        <div className="bg-[#fff5f5] rounded-xl border border-[#ffdad6] p-4 shadow-xs">
          <h4 className="text-[14px] font-bold text-[#ba1a1a] flex items-center gap-2 mb-2.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">event_busy</span>
            Hari Libur Nasional & Cuti Bersama ({currentMonthName})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {holidaysThisMonth.map((h) => {
              const day = parseInt(h.date.split('-')[2], 10);
              return (
                <div
                  key={h.date}
                  className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-[#ffdad6] text-[13px]"
                >
                  <span className="w-7 h-7 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                    {day}
                  </span>
                  <div>
                    <span className="font-bold text-[#191b24] block">{h.name}</span>
                    <span className="text-[11px] text-[#737687]">
                      {h.isCutiBersama ? 'Cuti Bersama' : 'Libur Nasional'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        id="btn-fab-add"
        onClick={() => onOpenAddModal()}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-[#004ccd] hover:bg-[#003da9] text-white rounded-xl px-5 py-3.5 flex items-center gap-2 shadow-[0_4px_14px_rgba(15,98,254,0.35)] hover:-translate-y-0.5 transition-transform z-30 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span className="text-[13px] font-bold tracking-wide">Tambah Antar-Jemput</span>
      </button>
    </div>
  );
};
