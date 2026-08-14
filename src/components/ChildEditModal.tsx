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
  const [roleTag, setRoleTag] = useState(child?.roleTag || 'Kakak');
  const [avatarUrl, setAvatarUrl] = useState(
    child?.avatarUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlB89wCdgPHMwr3buo-DaIJ7cYy1_oXgCKOTI1dEczo-6GRSynqTuIVIXgVulCE72DP0_LYFlIu-clLX5231aYVMpfNjHlXu092DhLMy1ZWPxvQ-d43aFZmfi7eWOC_DlWqG-snUtUuUcnHf2ZqjMRq-i9oZ7E_yEJeyxaGjlyLzOBLeZzP4hU7N5oMkmPgKMR5dzxnsMsGkcT-gSwucEf9EINFNPEXcyBVz4qNJfLnF-ZsRKGRZsA'
  );
  const [defaultPickupTime, setDefaultPickupTime] = useState(child?.defaultPickupTime || '07:00');
  const [defaultDropoffTime, setDefaultDropoffTime] = useState(child?.defaultDropoffTime || '12:00');
  const [school, setSchool] = useState(child?.school || '');

  const sampleAvatars = [
    {
      label: 'Anak Laki 1 (Abid)',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlB89wCdgPHMwr3buo-DaIJ7cYy1_oXgCKOTI1dEczo-6GRSynqTuIVIXgVulCE72DP0_LYFlIu-clLX5231aYVMpfNjHlXu092DhLMy1ZWPxvQ-d43aFZmfi7eWOC_DlWqG-snUtUuUcnHf2ZqjMRq-i9oZ7E_yEJeyxaGjlyLzOBLeZzP4hU7N5oMkmPgKMR5dzxnsMsGkcT-gSwucEf9EINFNPEXcyBVz4qNJfLnF-ZsRKGRZsA',
    },
    {
      label: 'Anak Laki 2 (Dhabit)',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFV6TR1OwzvI24Gt7q4oAmpUjdnhR4jzDzoTH7lRFF6SaTZI787kWmgn0eKPH_TrGY6p27FVm-o5LkQxYpDjnCGxIcrY4iJLUkwd-hqzOcea5IyVcPM3cet52jla2u41KNsiNaL7lSXcPLv0TazVXHFPdZZYq0d1WwdEGPUbmv79AYQE8e5VQSR4MO9K0IiLkHPowHmDqY9jf8VB1edtBUnUcmDP7BkHTMV3QHdsMH02jFpMYrYVR5OA',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: child?.id || `child-${Date.now()}`,
      name: name.trim().toUpperCase(),
      roleTag: roleTag.trim() || 'Anak',
      avatarUrl,
      defaultPickupTime,
      defaultDropoffTime,
      school: school.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#faf8ff]">
          <h3 className="text-[18px] font-bold text-[#191b24]">
            {child ? `Edit Profil ${child.name}` : 'Tambah Anak Baru'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#737687] hover:text-[#191b24] p-1 rounded-full hover:bg-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Nama Anak
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: ABID"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-[15px] font-semibold text-[#191b24] focus:border-[#004ccd] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Peran / Label (e.g. Kakak, Adik)
            </label>
            <div className="flex gap-2">
              {['Kakak', 'Adik', 'Anak 1', 'Anak 2'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setRoleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer ${
                    roleTag === tag
                      ? 'bg-[#004ccd] text-white border-[#004ccd]'
                      : 'bg-[#F4F7FB] text-[#424656] border-[#E2E8F0] hover:bg-[#e1e1ee]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Foto Profil
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#004ccd]">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                {sampleAvatars.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(item.url)}
                    className="w-10 h-10 rounded-full overflow-hidden border border-[#E2E8F0] hover:scale-105 transition-transform"
                    title={item.label}
                  >
                    <img src={item.url} alt="Option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
                Jadwal Antar
              </label>
              <input
                type="time"
                value={defaultPickupTime}
                onChange={(e) => setDefaultPickupTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[14px] font-semibold text-[#191b24]"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
                Jadwal Jemput
              </label>
              <input
                type="time"
                value={defaultDropoffTime}
                onChange={(e) => setDefaultDropoffTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[14px] font-semibold text-[#191b24]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Sekolah / Instansi (Opsional)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="SD Al-fath Bsd"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-[14px] text-[#191b24] focus:border-[#004ccd] outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
            {child && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus data ${child.name}?`)) {
                    onDelete(child.id);
                  }
                }}
                className="text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Hapus
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#424656] font-semibold text-[13px] hover:bg-[#F4F7FB]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#004ccd] hover:bg-[#003da9] text-white font-semibold text-[13px] shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
