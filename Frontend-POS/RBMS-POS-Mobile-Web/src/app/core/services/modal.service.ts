import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CancelModalComponent } from '@shared/modals/cancel-modal/cancel-modal.component';
import { InfoModalComponent } from '@shared/modals/info-modal/info-modal.component';
import { SuccessModalComponent } from '@shared/modals/success-modal/success-modal.component';

export interface DialogData {
  title: string;
  message?: string | string[];
  onConfirm?: () => unknown;
  onCancel?: () => void;
  icon?: Icon;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  isShowConfirmButton?: boolean;
  width?: string;
  customError?: boolean;
}

export enum Icon {
  Info = 'info',
  Warning = 'warning',
  Question = 'question',
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private readonly dialogService: DialogService) {}

  info(data: DialogData): DynamicDialogRef {
    return this.dialogService.open(InfoModalComponent, {
      data,
      styleClass: 'alert-dialog',
      showHeader: false,
      width: data.width ?? '60vw',
      modal: true,
      duplicate: true,
    });
  }

  infoAsync(data: DialogData): Promise<boolean> {
    return new Promise((resolve) => {
      const ref = this.info(data);
      ref.onClose.subscribe((result) => resolve(!!result));
    });
  }

  cancel(data: DialogData): DynamicDialogRef {
    return this.dialogService.open(CancelModalComponent, {
      data,
      styleClass: 'alert-dialog',
      showHeader: false,
      width: data.width ?? '60vw',
      modal: true,
    });
  }

  success(data: DialogData): DynamicDialogRef {
    return this.dialogService.open(SuccessModalComponent, {
      data,
      styleClass: 'alert-dialog',
      showHeader: false,
      width: data.width ?? '60vw',
      modal: true,
    });
  }

  commonSuccess(): void {
    this.success({
      title: 'สำเร็จ !',
      message: 'ทำรายการสำเร็จ',
    });
  }
}
