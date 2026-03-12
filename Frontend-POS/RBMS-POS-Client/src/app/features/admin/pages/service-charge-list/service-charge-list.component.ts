import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServiceChargesService } from '@app/core/api/services';
import { ServiceChargeResponseModel } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_ADD = 'add-service-charge';

@Component({
  selector: 'app-service-charge-list',
  standalone: false,
  templateUrl: './service-charge-list.component.html',
})
export class ServiceChargeListComponent implements OnDestroy {
  serviceCharges = signal<ServiceChargeResponseModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  selectedServiceCharge = signal<{ id: number; name: string } | null>(null);

  constructor(
    private readonly serviceChargesService: ServiceChargesService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.loadServiceCharges();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่ม Service Charge',
        icon: 'pi pi-plus',
        callback: () => this.onAdd(),
      },
    });
  }

  loadServiceCharges(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.serviceChargesService
      .apiAdminServicechargesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.serviceCharges.set(response.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูล Service Charge ได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  onAdd(): void {
    this.router.navigate(['/admin-setting/service-charges/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin-setting/service-charges/edit', id]);
  }

  onDelete(id: number, name: string): void {
    this.selectedServiceCharge.set({ id, name });
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const serviceCharge = this.selectedServiceCharge();
    if (!serviceCharge) return;

    this.serviceChargesService
      .apiAdminServicechargesServiceChargeIdDelete({ serviceChargeId: serviceCharge.id! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.successMessage.set(`ลบ "${serviceCharge.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
          this.loadServiceCharges();
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถลบ Service Charge ได้');
          this.showErrorModal.set(true);
          this.showDeleteModal.set(false);
        },
      });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.selectedServiceCharge.set(null);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }
}
