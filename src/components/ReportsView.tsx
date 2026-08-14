import React from 'react';
import { DailyTransportRecord, formatRupiah, Child } from '../types';

interface ReportsViewProps {
  records: DailyTransportRecord[];
  childrenList: Child[];
  monthName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  records,
  childrenList,
  monthName,
}) => {
  const totalCost = records.reduce((acc, r) => acc + r.totalFee, 0);
  const paidCost = records.filter((r) => r.paymentStatus === 'paid').reduce((acc, r) => acc + r.totalFee, 0);
  const unpaidCost = totalCost - paidCost;

  const normalTrips = records.filter((r) => !r.hasDifferentDropoff && r.additionalFee === 0).length;
  const extraTrips = records.filter((r) => r.hasDifferentDropoff || r.additionalFee > 0).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
            Laporan Logistik {monthName}
          </h2>
          <p className="text-[14px] text-[#424656]">
            Analisis perjalanan, efisiensi waktu, dan keuangan
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#191b24] px-4 py-2.5 rounded-xl font-semibold text-[13px] shadow-xs cursor-pointer self-start"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[12px] font-semibold text-[#737687] uppercase">Total Pengeluaran</p>
          <p className="text-[24px] font-bold text-[#004ccd] mt-1">{formatRupiah(totalCost)}</p>
          <p className="text-[12px] text-[#198754] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check</span>
            {records.length} Hari Perjalanan
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[12px] font-semibold text-[#737687] uppercase">Status Lunas</p>
          <p className="text-[24px] font-bold text-[#198754] mt-1">{formatRupiah(paidCost)}</p>
          <p className="text-[12px] text-[#737687] mt-2">
            Belum Lunas: <span className="text-[#ba1a1a] font-semibold">{formatRupiah(unpaidCost)}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[12px] font-semibold text-[#737687] uppercase">Rasio Waktu Jemput</p>
          <p className="text-[24px] font-bold text-[#191b24] mt-1">
            {records.length > 0 ? Math.round((normalTrips / records.length) * 100) : 0}% Normal
          </p>
          <p className="text-[12px] text-[#b45309] mt-2">
            {extraTrips} Hari dengan jam kepulangan berbeda
          </p>
        </div>
      </div>

      {/* Attendance per Child Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6">
        <h3 className="text-[18px] font-bold text-[#191b24] mb-4">
          Statistik Perjalanan per Anak
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#737687] text-[12px] uppercase">
                <th className="pb-3 font-semibold">Anak</th>
                <th className="pb-3 font-semibold">Label</th>
                <th className="pb-3 font-semibold">Kehadiran</th>
                <th className="pb-3 font-semibold">Rata-rata Antar</th>
                <th className="pb-3 font-semibold">Rata-rata Jemput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/70">
              {childrenList.map((child) => {
                const attendedCount = records.filter((r) =>
                  r.children.some((c) => c.childId === child.id && c.isAttending)
                ).length;

                return (
                  <tr key={child.id} className="hover:bg-[#F4F7FB]">
                    <td className="py-3.5 font-bold text-[#191b24] flex items-center gap-3">
                      <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{child.name}</span>
                    </td>
                    <td className="py-3.5 text-[#424656]">{child.roleTag}</td>
                    <td className="py-3.5 font-semibold text-[#004ccd]">{attendedCount} Hari</td>
                    <td className="py-3.5 text-[#424656]">{child.defaultPickupTime}</td>
                    <td className="py-3.5 text-[#424656]">{child.defaultDropoffTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
