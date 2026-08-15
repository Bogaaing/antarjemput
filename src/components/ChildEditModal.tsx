import React, { useState } from 'react';
import { Child } from '../types';

interface ChildEditModalProps {
  child?: Child | null;
  onSave: (child: Child) => void;
  onDelete?: (childId: string) => void;
  onClose: () => void;
}

export const ChildEditModal: React.FC<ChildEditModalProps> = ({
  child,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(child?.name || '');
  const [nickname, setNickname] = useState(child?.name || '');
  const [roleTag, setRoleTag] = useState(child?.roleTag || 'Kakak');
  const [avatarUrl, setAvatarUrl] = useState(
    child?.avatarUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlB89wCdgPHMwr3buo-DaIJ7cYy1_oXgCKOTI1dEczo-6GRSynqTuIVIXgVulCE72DP0_LYFlIu-clLX5231aYVMpfNjHlXu092DhLMy1ZWPxvQ-d43aFZmfi7eWOC_DlWqG-snUtUuUcnHf2ZqjMRq-i9oZ7E_yEJeyxaGjlyLzOBLeZzP4hU7N5oMkmPgKMR5dzxnsMsGkcT-gSwucEf9EINFNPEXcyBVz4qNJfLnF-ZsRKGRZsA'
  );
  const [defaultPickupTime, setDefaultPickupTime] = useState(child?.defaultPickupTime || '07:00');
  const [defaultDropoffTime, setDefaultDropoffTime] = useState(child?.defaultDropoffTime || '12:00');
  const [school, setSchool] = useState(child?.school || 'SD Al-fath BSD');
  const [notes, setNotes] = useState(child?.notes || '');

  // Active days states (Monday to Friday active by default)
  const daysList = [
    { key: 'sen', label: 'Sen' },
    { key: 'sel', label: 'Sel' },
    { key: 'rab', label: 'Rab' },
    { key: 'kam', label: 'Kam' },
    { key: 'jum', label: 'Jum' },
    { key: 'sab', label: 'Sab' },
    { key: 'min', label: 'Min' },
  ];

  const [pickupDays, setPickupDays] = useState<string[]>(['sen', 'sel', 'rab', 'kam', 'jum']);
  const [dropoffDays, setDropoffDays] = useState<string[]>(['sen', 'sel', 'rab', 'kam', 'jum']);

  const sampleAvatars = [
    {
      label: 'Abid',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlB89wCdgPHMwr3buo-DaIJ7cYy1_oXgCKOTI1dEczo-6GRSynqTuIVIXgVulCE72DP0_LYFlIu-clLX5231aYVMpfNjHlXu092DhLMy1ZWPxvQ-d43aFZmfi7eWOC_DlWqG-snUtUuUcnHf2ZqjMRq-i9oZ7E_yEJeyxaGjlyLzOBLeZzP4hU7N5oMkmPgKMR5dzxnsMsGkcT-gSwucEf9EINFNPEXcyBVz4qNJfLnF-ZsRKGRZsA',
    },
    {
      label: 'Dhabit',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFV6TR1OwzvI24Gt7q4oAmpUjdnhR4jzDzoTH7lRFF6SaTZI787kWmgn0eKPH_TrGY6p27FVm-o5LkQxYpDjnCGxIcrY4iJLUkwd-hqzOcea5IyVcPM3cet52jla2u41KNsiNaL7lSXcPLv0TazVXHFPdZZYq0d1WwdEGPUbmv79AYQE8e5VQSR4MO9K0IiLkHPowHmDqY9jf8VB1edtBUnUcmDP7BkHTMV3QHdsMH02jFpMYrYVR5OA',
    },
  ];

  const toggleDay = (dayKey: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupDays((prev) =>
        prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
      );
    } else {
      setDropoffDays((prev) =>
        prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: child?.id || `child-${Date.now()}`,
      name: name.trim().toUpperCase(),
      roleTag: roleTag.trim() || 'Kakak',
      avatarUrl,
      defaultPickupTime,
      defaultDropoffTime,
      school: school.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (child && onDelete) {
      if (confirm(`Apakah Anda yakin ingin menghapus profil ${child.name}?`)) {
        onDelete(child.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#F4F7FB] flex items-center justify-center text-[#191b24] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h3 className="text-[18px] font-bold text-[#191b24] tracking-tight">
              {child ? 'Detail Anak' : 'Tambah Anak Baru'}
            </h3>
          </div>

          {child && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-8 h-8 rounded-full text-[#DC2626] hover:bg-[#FFF5F5] flex items-center justify-center transition-colors cursor-pointer"
              title="Hapus Anak"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Profile Header Preview */}
          <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#004ccd] shrink-0 bg-white shadow-xs">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[18px] font-extrabold text-[#191b24] leading-tight">
                  {name || 'Nama Anak'}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    roleTag === 'Kakak'
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#DBEAFE] text-[#1E40AF]'
                  }`}
                >
                  {roleTag}
                </span>
              </div>
              <p className="text-[12px] text-[#64748B] font-medium mt-0.5">
                {school || 'SD Al-fath BSD'}
              </p>

              {/* Avatar Selector Mini-Options */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-[#94A3B8] font-medium">Foto:</span>
                {sampleAvatars.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(item.url);
                      if (!child) {
                        setName(item.label.toUpperCase());
                        setNickname(item.label);
                        setRoleTag(item.label === 'Abid' ? 'Kakak' : 'Adik');
                      }
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === item.url ? 'border-[#004ccd] scale-105' : 'border-[#CBD5E1] opacity-70'
                    }`}
                    title={item.label}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: Informasi Anak */}
          <div className="space-y-3.5">
            <h4 className="text-[14px] font-bold text-[#004ccd] tracking-tight">
              Informasi Anak
            </h4>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Abid"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] font-medium text-[#191b24] focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all"
                required
              />
            </div>

            {/* Panggilan & Peran */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                  Panggilan
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Abid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] font-medium text-[#191b24] focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                  Peran / Hubungan
                </label>
                <div className="flex gap-1.5">
                  {['Kakak', 'Adik'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setRoleTag(tag)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                        roleTag === tag
                          ? tag === 'Kakak'
                            ? 'bg-[#D1FAE5] text-[#065F46] border-[#065F46]/30 shadow-2xs'
                            : 'bg-[#DBEAFE] text-[#1E40AF] border-[#1E40AF]/30 shadow-2xs'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sekolah */}
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                Sekolah
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="SD Al-fath BSD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] font-medium text-[#191b24] focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all"
              />
            </div>

            {/* Catatan (Opsional) */}
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: alergi makanan, catatan khusus, dll"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#191b24] focus:border-[#004ccd] focus:ring-1 focus:ring-[#004ccd] outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Jadwal Default */}
          <div className="space-y-4 pt-3 border-t border-[#E2E8F0]">
            <h4 className="text-[14px] font-bold text-[#004ccd] tracking-tight">
              Jadwal Default
            </h4>

            {/* Antar ke sekolah */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ccd] text-[20px]">
                    two_wheeler
                  </span>
                  <span className="text-[13px] font-bold text-[#191b24]">Antar ke sekolah</span>
                </div>

                <div className="bg-[#EFF6FF] text-[#004ccd] border border-[#DBEAFE] px-3 py-1 rounded-xl text-[14px] font-extrabold flex items-center gap-1">
                  <input
                    type="time"
                    value={defaultPickupTime}
                    onChange={(e) => setDefaultPickupTime(e.target.value)}
                    className="bg-transparent text-[#004ccd] font-extrabold outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Day chips */}
              <div className="flex gap-1 justify-between pt-1">
                {daysList.map((d) => {
                  const isActive = pickupDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key, true)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-[#004ccd] text-white shadow-2xs'
                          : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jemput dari sekolah */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D9488] text-[20px]">
                    two_wheeler
                  </span>
                  <span className="text-[13px] font-bold text-[#191b24]">Jemput dari sekolah</span>
                </div>

                <div className="bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-3 py-1 rounded-xl text-[14px] font-extrabold flex items-center gap-1">
                  <input
                    type="time"
                    value={defaultDropoffTime}
                    onChange={(e) => setDefaultDropoffTime(e.target.value)}
                    className="bg-transparent text-[#047857] font-extrabold outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Day chips */}
              <div className="flex gap-1 justify-between pt-1">
                {daysList.map((d) => {
                  const isActive = dropoffDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key, false)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-[#0D9488] text-white shadow-2xs'
                          : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Callout */}
            <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3.5 flex items-start gap-2.5 text-[12px] text-[#1E40AF]">
              <span className="material-symbols-outlined text-[18px] text-[#004ccd] shrink-0 mt-0.5">
                info
              </span>
              <p className="leading-snug">
                Jadwal ini akan digunakan sebagai default saat mencatat antar jemput di kalender.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#004ccd] hover:bg-[#003da9] text-white font-bold text-[15px] shadow-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
