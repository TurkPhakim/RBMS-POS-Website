import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nationalIdMask',
  standalone: false
})
export class NationalIdMaskPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }

    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 13) {
      return value; // Return original if not valid length
    }

    // Format: x-xxxx-xxxxx-xx-x
    // Show only first and last digit, mask the rest
    const first = cleaned[0];
    const last = cleaned[12];

    return `${first}-xxxx-xxxxx-xx-${last}`;
  }

}
