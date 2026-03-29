import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuCategoriesService } from '@app/core/api/services/menu-categories.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-create-sub-category-dialog',
  standalone: false,
  templateUrl: './create-sub-category-dialog.component.html',
})
export class CreateSubCategoryDialogComponent {
  form: FormGroup;
  isSubmitting = signal(false);

  private categoryType: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly menuCategoriesService: MenuCategoriesService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.categoryType = this.config.data?.categoryType ?? 1;
    this.form = this.fb.group({
      name: ['', Validators.required],
      isActive: [true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    this.menuCategoriesService
      .menuCategoriesCreateSubCategoryPost({
        body: {
          categoryType: this.categoryType,
          name: this.form.value.name,
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
            message: 'ไม่สามารถสร้างหมวดหมู่เมนูได้',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
