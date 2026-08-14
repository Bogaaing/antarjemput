export interface IndonesianHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  isCutiBersama?: boolean;
}

// Daftar Hari Libur Nasional & Cuti Bersama Indonesia 2026
export const INDONESIAN_HOLIDAYS_2026: Record<string, IndonesianHoliday> = {
  // Januari
  '2026-01-01': { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
  '2026-01-16': { date: '2026-01-16', name: 'Isra Mi\'raj Nabi Muhammad SAW' },

  // Februari
  '2026-02-17': { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  '2026-02-16': { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek', isCutiBersama: true },

  // Maret
  '2026-03-20': { date: '2026-03-20', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
  '2026-03-21': { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H' },
  '2026-03-22': { date: '2026-03-22', name: 'Hari Raya Idul Fitri 1447 H' },
  '2026-03-23': { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri 1447 H', isCutiBersama: true },
  '2026-03-24': { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri 1447 H', isCutiBersama: true },

  // April
  '2026-04-03': { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  '2026-04-05': { date: '2026-04-05', name: 'Hari Paskah' },

  // Mei
  '2026-05-01': { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  '2026-05-14': { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  '2026-05-28': { date: '2026-05-28', name: 'Hari Raya Idul Adha 1447 H' },
  '2026-05-31': { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE' },

  // Juni
  '2026-06-01': { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  '2026-06-16': { date: '2026-06-16', name: 'Tahun Baru Islam 1448 Hijriah' },

  // Agustus
  '2026-08-17': { date: '2026-08-17', name: 'Hari Kemerdekaan RI (HUT RI Ke-81)' },
  '2026-08-25': { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },

  // Desember
  '2026-12-25': { date: '2026-12-25', name: 'Hari Raya Natal' },
  '2026-12-26': { date: '2026-12-26', name: 'Cuti Bersama Hari Raya Natal', isCutiBersama: true }
};

export function getIndonesianHoliday(dateStr: string): IndonesianHoliday | undefined {
  return INDONESIAN_HOLIDAYS_2026[dateStr];
}
