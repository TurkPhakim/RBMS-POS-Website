import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function markFormDirty(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach(c => markFormDirty(c));
  } else if (control instanceof FormArray) {
    control.controls.forEach(c => markFormDirty(c));
  } else {
    control.markAsDirty();
  }
}

export function linkDateRange(
  form: FormGroup,
  startField: string,
  endField: string,
  minEndDate: WritableSignal<Date | null>,
  destroyRef: DestroyRef,
): void {
  form.get(startField)!.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((date: Date | null) => {
      minEndDate.set(date);
      const endDate = form.get(endField)!.value as Date | null;
      if (date && endDate && endDate < date) {
        form.get(endField)!.setValue(null);
      }
    });
}
