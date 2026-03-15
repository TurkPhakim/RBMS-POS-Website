import { Component } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { DialogData } from '@app/core/services/modal.service';

@Component({
  selector: 'app-cancel-modal',
  standalone: false,
  templateUrl: './cancel-modal.component.html',
})
export class CancelModalComponent {
  constructor(
    readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig<DialogData>,
  ) {}

  get messages(): string[] {
    const msg = this.config.data?.message;
    if (!msg) return [];
    if (Array.isArray(msg)) return msg;
    return msg.split('\n');
  }
}
