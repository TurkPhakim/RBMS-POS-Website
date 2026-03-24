import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloorObjectsService } from '@app/core/api/services/floor-objects.service';
import { FloorObjectResponseModel } from '@app/core/api/models/floor-object-response-model';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-floor-object-dialog',
  standalone: false,
  templateUrl: './floor-object-dialog.component.html',
})
export class FloorObjectDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  floorObject: FloorObjectResponseModel | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly floorObjectsService: FloorObjectsService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.floorObject = this.config.data?.floorObject ?? null;
    this.isEditMode.set(!!this.floorObject);
    this.initForm();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      this.updateFloorObject();
    } else {
      this.createFloorObject();
    }
  }

  onDelete(): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบ "${this.floorObject?.label}" หรือไม่?`,
      onConfirm: () => {
        this.floorObjectsService
          .floorObjectsDeleteFloorObjectDelete({
            floorObjectId: this.floorObject!.floorObjectId!,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.ref.close(true);
            },
          });
      },
    });
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private initForm(): void {
    this.form = this.fb.group({
      objectType: [
        this.floorObject?.objectType ?? '',
        Validators.required,
      ],
      label: [
        this.floorObject?.label ?? '',
        [Validators.required, Validators.maxLength(100)],
      ],
    });
  }

  private createFloorObject(): void {
    const zoneId = this.config.data?.zoneId ?? null;
    this.floorObjectsService
      .floorObjectsCreateFloorObjectPost({
        body: {
          objectType: this.form.value.objectType,
          label: this.form.value.label,
          zoneId,
          positionX: 50,
          positionY: 50,
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
            message: 'ไม่สามารถสร้างวัตถุได้',
          });
        },
      });
  }

  private updateFloorObject(): void {
    this.floorObjectsService
      .floorObjectsUpdateFloorObjectPut({
        floorObjectId: this.floorObject!.floorObjectId!,
        body: {
          objectType: this.form.value.objectType,
          label: this.form.value.label,
          zoneId: this.floorObject?.zoneId ?? null,
          positionX: this.floorObject?.positionX ?? 0,
          positionY: this.floorObject?.positionY ?? 0,
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
