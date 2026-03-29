import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';

@Component({
  selector: 'app-nickname-dialog',
  standalone: false,
  templateUrl: './nickname-dialog.component.html',
})
export class NicknameDialogComponent {
  nickname = '';
  showError = false;
  isSaving = false;

  constructor(
    private ref: DynamicDialogRef,
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
  ) {}

  onConfirm(): void {
    const trimmed = this.nickname.trim();
    if (!trimmed || trimmed.length > 20) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.isSaving = true;

    this.selfOrderService
      .selfOrderSetNicknamePost({ body: { nickname: trimmed } })
      .subscribe({
        next: () => {
          this.customerAuth.updateNickname(trimmed);
          this.ref.close(trimmed);
        },
        error: () => {
          this.isSaving = false;
        },
      });
  }
}
