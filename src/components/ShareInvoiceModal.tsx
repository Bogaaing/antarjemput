import React, { useState } from 'react';
import { DailyTransportRecord, formatRupiah, formatDateIndo } from '../types';

interface ShareInvoiceModalProps {
  records: DailyTransportRecord[];
  monthName: string;
  onClose: () => void;
}

export const ShareInvoiceModal: React.FC<ShareInvoiceModalProps> = ({
  records,
  monthName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [parentName, setParentName] = useState('Orang Tua Abid & Dhabit');

  const baseTotal = records.reduce((acc, r) => acc + r.baseFee, 0);
  const extraTotal = records.reduce((acc, r) => acc + r.additionalFee, 0);
  const grandTotal = baseTotal + extraTotal;
  const paidTotal = records.filter((r) => r.paymentStatus === 'paid').reduce((acc, r) => acc + r.totalFee, 0);
  const remainingTotal = grandTotal - paidTotal;
  const normalDays = records.filter((r) => !r.hasDifferentDropoff && r.additionalFee === 0).length;
  const extraDays = records.filter((r) => r.hasDifferentDropoff || r.additionalFee > 0).length;

  const invoiceMessage = `*TAGIHAN ANTAR-JEMPUT BULAN ${monthName.toUpperCase()}*
Halo Bapak/Ibu ${parentName},

Berikut adalah rekap layanan antar-jemput anak untuk bulan *${monthName}*:

📋 *Ringkasan Layanan:*
• Total Hari Layanan: ${records.length} Hari
• Hari Normal: ${normalDays} Hari
• Hari Tambahan (Beda Jam/Weekend): ${extraDays} Hari

💰 *Rincian Keuangan:*
• Biaya Dasar: ${formatRupiah(baseTotal)}
• Biaya Tambahan: ${formatRupiah(extraTotal)}
*TOTAL TAGIHAN: ${formatRupiah(grandTotal)}*

💳 *Status Pembayaran:*
• Sudah Dibayar: ${formatRupiah(paidTotal)}
• *Sisa Belum Dibayar: ${formatRupiah(remainingTotal)}*

Mohon konfirmasi jika pembayaran telah ditransfer. Terima kasih atas kepercayaannya! 🙏
_AntarJemputKu - Monitoring Antar Jemput_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(invoiceMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#faf8ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0f62fe] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#191b24]">Kirim Tagihan Rekap</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#737687] hover:text-[#191b24] p-1 rounded-full hover:bg-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Nama Penerima
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-[14px] font-medium text-[#191b24] focus:border-[#004ccd] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Preview Pesan Tagihan (WhatsApp Ready)
            </label>
            <pre className="bg-[#F4F7FB] p-4 rounded-xl border border-[#E2E8F0] text-[13px] font-mono whitespace-pre-wrap text-[#191b24] leading-relaxed max-h-56 overflow-y-auto">
              {invoiceMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#faf8ff] border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl border font-semibold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              copied
                ? 'bg-[#198754] text-white border-[#198754]'
                : 'border-[#E2E8F0] bg-white text-[#191b24] hover:bg-[#F4F7FB]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Pesan'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#157347] text-white font-semibold text-[13px] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Kirim via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
