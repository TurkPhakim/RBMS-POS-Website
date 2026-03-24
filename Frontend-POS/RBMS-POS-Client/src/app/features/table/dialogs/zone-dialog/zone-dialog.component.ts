import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ZonesService } from '@app/core/api/services/zones.service';
import { ZoneResponseModel } from '@app/core/api/models/zone-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

const PRESET_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
  '#00BCD4', '#FF5722', '#795548', '#607D8B', '#E91E63',
  '#3F51B5', '#009688',
];

@Component({
  selector: 'app-zone-dialog',
  standalone: false,
  templateUrl: './zone-dialog.component.html',
})
export class ZoneDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  zone: ZoneResponseModel | null = null;
  canUpdate: boolean;

  readonly presetColors = PRESET_COLORS;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly zonesService: ZonesService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('table-manage.update');
  }

  ngOnInit(): void {
    this.zone = this.config.data?.zone ?? null;
    this.isEditMode.set(!!this.zone);
    this.initForm();
  }

  get selectedColor(): string {
    return this.form.get('color')?.value ?? '#4CAF50';
  }

  selectColor(color: string): void {
    this.form.get('color')?.setValue(color);
  }

  onColorInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.form.get('color')?.setValue(value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      this.updateZone();
    } else {
      this.createZone();
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private initForm(): void {
    this.form = this.fb.group({
      zoneName: [this.zone?.zoneName ?? '', [Validators.required, Validators.maxLength(100)]],
      color: [this.zone?.color ?? '#4CAF50', Validators.required],
      isActive: [this.zone?.isActive ?? true],
    });

    if (this.isEditMode() && !this.canUpdate) {
      this.form.disable();
    }
  }

  private createZone(): void {
    this.zonesService
      .zonesCreateZonePost({
        body: {
          zoneName: this.form.value.zoneName,
          color: this.form.value.color,
          isActive: this.form.value.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถสร้างโซนได้',
          });
        },
      });
  }

  private updateZone(): void {
    this.zonesService
      .zonesUpdateZonePut({
        zoneId: this.zone!.zoneId!,
        body: {
          zoneName: this.form.value.zoneName,
          color: this.form.value.color,
          isActive: this.form.value.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถบันทึกข้อมูลได้',
          });
        },
      });
  }
}
