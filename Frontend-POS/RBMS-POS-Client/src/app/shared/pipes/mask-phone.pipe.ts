import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone',
  standalone: false,
})
export class FormatPhonePipe implements PipeTransform {
  /**
   * Format เบอร์โทรไทย 10 หลัก
   * @param mask - true: 09X-XXX-5678 / false (default): 091-234-5678
   */
  transform(value: string | null | undefined, mask = false): string {
    if (!value || value.length < 10) {
      return value ?? '';
    }

    if (mask) {
      // 0912345678 → 09X-XXX-5678
      return `${value.substring(0, 2)}X-XXX-${value.substring(6)}`;
    }

    // 0912345678 → 091-234-5678
    return `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(6)}`;
  }
}
