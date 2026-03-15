import { Component, signal } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-credentials-dialog',
  standalone: false,
  templateUrl: './credentials-dialog.component.html',
})
export class CredentialsDialogComponent {
  credentials: { username: string; password: string };
  showPassword = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
  ) {
    this.credentials = this.config.data.credentials;
  }

  onClose(): void {
    this.ref.close();
  }
}
