import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AnimationOptions } from 'ngx-lottie';
import { DialogData } from '@app/core/services/modal.service';

@Component({
  selector: 'app-success-modal',
  standalone: false,
  templateUrl: './success-modal.component.html',
})
export class SuccessModalComponent implements OnInit, OnDestroy {
  private timer?: ReturnType<typeof setTimeout>;

  lottieOptions: AnimationOptions = {
    path: 'animations/success.json',
  };

  constructor(
    readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig<DialogData>,
  ) {}

  ngOnInit(): void {
    if (!this.config.data?.onConfirm) {
      this.timer = setTimeout(() => this.ref.close(), 2000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  handleConfirm(): void {
    const callback = this.config.data?.onConfirm;
    if (callback) callback();
    this.ref.close(true);
  }
}
