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
  '#f97316', '#ef4444', '#ec4899', '#a855f7',
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#10b981', '#84cc16', '#eab308', '#78716c',
  '#0ea5e9',
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

  private zoneId: number | null = null;
  zone: ZoneResponseModel | null = null;
  canUpdate: boolean;

  readonly presetColors = PRESET_COLORS;
  showPicker = false;

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
    this.zoneId = this.config.data?.zoneId ?? null;
    this.isEditMode.set(!!this.zoneId);
    this.initForm();

    if (this.zoneId) {
      this.loadZoneDetail(this.zoneId);
    }
  }

  get selectedColor(): string {
    return this.form.get('color')?.value ?? '#4CAF50';
  }

  isCustomColor(): boolean {
    return !this.presetColors.includes(this.selectedColor.toUpperCase())
      && !this.presetColors.includes(this.selectedColor);
  }

  selectColor(color: string): void {
    this.form.get('color')?.setValue(color);
  }

  onHexInput(value: string): void {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      this.form.get('color')?.setValue(value);
    }
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
      zoneName: ['', [Validators.required, Validators.maxLength(100)]],
      color: ['#4CAF50', Validators.required],
      isActive: [true],
    });
  }

  private loadZoneDetail(zoneId: number): void {
    this.zonesService
      .zonesGetZoneGet({ zoneId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.zone = res.result ?? null;
          if (this.zone) {
            this.form.patchValue({
              zoneName: this.zone.zoneName,
              color: this.zone.color,
              isActive: this.zone.isActive,
            });
            if (!this.canUpdate) this.form.disable();
          }
        },
      });
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
        zoneId: this.zoneId!,
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
