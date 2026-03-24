import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';

import { OrderItemResponseModel } from '@app/core/api/models';
import { VerifyPinDialogComponent } from '@app/shared/dialogs/verify-pin/verify-pin-dialog.component';

@Component({
  selector: 'app-cancel-reason-dialog',
  standalone: false,
  templateUrl: './cancel-reason-dialog.component.html',
  providers: [DialogService],
})
export class CancelReasonDialogComponent implements OnInit {
  headerLabel = '';
  item!: OrderItemResponseModel;
  categoryLabel = 'อาหาร';
  cancelReasonControl = new FormControl('', Validators.required);

  constructor(
    private readonly config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
    private readonly dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.headerLabel = this.config.header ?? 'ยกเลิกออเดอร์';
    this.item = this.config.data?.item ?? {};
    this.categoryLabel = this.getCategoryLabel(this.item.categoryType);
  }

  private getCategoryLabel(categoryType?: number): string {
    switch (categoryType) {
      case 2: return 'เครื่องดื่ม';
      case 3: return 'ของหวาน';
      default: return 'อาหาร';
    }
  }

  onConfirm(): void {
    this.cancelReasonControl.markAsDirty();
    if (this.cancelReasonControl.invalid) return;

    const pinRef = this.dialogService.open(VerifyPinDialogComponent, {
      header: 'ยืนยันตัวตน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
    });

    pinRef.onClose.subscribe((result: boolean | string | undefined) => {
      if (result === true) {
        this.ref.close({ cancelReason: this.cancelReasonControl.value!.trim() });
      } else if (result === 'max-attempts') {
        this.ref.close();
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
