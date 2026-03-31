/**
 * แปลง Date เป็น ISO-like string โดยใช้ local timezone
 * ป้องกันปัญหา .toISOString() ที่แปลงเป็น UTC แล้ววันที่ถอยหลัง 1 วัน (Bangkok = UTC+7)
 */
export function toLocalDateString(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T00:00:00`;
}
