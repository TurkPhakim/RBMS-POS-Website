import { Pipe, PipeTransform } from '@angular/core';

type DateFormatMode = 'DATE' | 'TIME' | 'DATE_TIME' | 'MONTH' | 'DAY' | 'thLongDate';

const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

@Pipe({ name: 'dateFormat', standalone: false })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, mode: DateFormatMode = 'DATE'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    switch (mode) {
      case 'DATE':
        return `${dd}/${MM}/${yyyy}`;
      case 'TIME':
        return `${HH}:${mm}`;
      case 'DATE_TIME':
        return `${dd}/${MM}/${yyyy} ${HH}:${mm}`;
      case 'MONTH':
        return `${TH_MONTHS[date.getMonth()]} ${yyyy}`;
      case 'DAY':
        return dd;
      case 'thLongDate':
        return `วัน${TH_DAYS[date.getDay()]} ที่ ${date.getDate()} ${TH_MONTHS[date.getMonth()]} ${yyyy}`;
      default:
        return `${dd}/${MM}/${yyyy}`;
    }
  }
}
