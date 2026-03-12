import { Component, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HumanResourceService } from '@app/core/api/services';
import { EmployeeResponseModel } from '@app/core/api/models';

@Component({
  selector: 'app-create-user-dialog',
  standalone: false,
  templateUrl: './create-user-dialog.component.html',
})
export class CreateUserDialogComponent {
  employee: EmployeeResponseModel;
  imageUrl: string | null;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly humanResourceService: HumanResourceService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.employee = this.config.data.employee;
    this.imageUrl = this.config.data.imageUrl;
  }

  onConfirm(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.humanResourceService
      .apiHumanresourceEmployeeIdCreateUserPost({ employeeId: this.employee.employeeId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.ref.close({
            username: response.result?.username ?? '',
            password: response.result?.password ?? '',
            emailSent: response.result?.emailSent ?? false,
          });
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('ไม่สามารถสร้างบัญชีผู้ใช้ได้');
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }
}
