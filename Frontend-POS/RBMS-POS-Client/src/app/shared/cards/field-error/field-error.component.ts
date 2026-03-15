import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  standalone: false,
  template: `
    @if (control && control.invalid && control.dirty) {
      <small
        class="text-danger mt-1 flex items-center gap-1 text-sm font-semibold"
      >
        <app-generic-icon
          name="field-error"
          svgClass="w-4 h-4"
        ></app-generic-icon>
        {{ errorMessage }}
      </small>
    }
  `,
})
export class FieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() type: 'text' | 'select' = 'text';

  get errorMessage(): string {
    if (!this.control?.errors) return '';

    const errors = this.control.errors;

    if (errors['required']) {
      return this.type === 'select' ? 'กรุณาเลือก' : 'กรุณาระบุ';
    }
    if (errors['minlength']) {
      return `ต้องมีอย่างน้อย ${errors['minlength'].requiredLength} ตัวอักษร`;
    }
    if (errors['maxlength']) {
      return `ห้ามเกิน ${errors['maxlength'].requiredLength} ตัวอักษร`;
    }
    if (errors['email']) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (errors['min']) {
      return `ต้องไม่ต่ำกว่า ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `ต้องไม่เกิน ${errors['max'].max}`;
    }
    if (errors['pattern']) {
      return 'รูปแบบไม่ถูกต้อง';
    }
    if (errors['duplicate']) {
      return typeof errors['duplicate'] === 'string'
        ? errors['duplicate']
        : 'ข้อมูลนี้ถูกใช้งานแล้ว';
    }
    if (errors['incorrect']) {
      return 'รหัสผ่านไม่ถูกต้อง';
    }

    return '';
  }
}
