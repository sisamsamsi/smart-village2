import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatTanggal = (date: string | Date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy', { locale: id });
};

export const formatTanggalLengkap = (date: string | Date) => {
  if (!date) return '-';
  return format(new Date(date), 'eeee, dd MMMM yyyy', { locale: id });
};

export const BULAN_ROMAWI = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];
