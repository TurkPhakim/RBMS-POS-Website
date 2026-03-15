import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ServiceChargeResponseModel } from '@app/core/api/models';
import { ServiceChargesService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-service-charge';

@Component({
  selector: 'app-service-charge-list',
  standalone: false,
  templateUrl: './service-charge-list.component.html',
})
export class ServiceChargeListComponent implements OnDestroy {
  private allServiceCharges = signal<ServiceChargeResponseModel[]>([]);
  statusFilter = signal<string | null>(null);
  startDateFilter = signal<Date | null>(null);

  canCreate: boolean;
  canDelete: boolean;

  serviceCharges = computed(() => {
    const status = this.statusFilter();
    const startDate = this.startDateFilter();
    let filtered = this.allServiceCharges();

    if (status === 'active') {
      filtered = filtered.filter((sc) => sc.isActive === true);
    } else if (status === 'inactive') {
      filtered = filtered.filter((sc) => sc.isActive === false);
    }

    if (startDate) {
      filtered = filtered.filter((sc) => {
        if (!sc.startDate) return true;
        return new Date(sc.startDate) >= startDate;
      });
    }

    return filtered;
  });

  constructor(
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly serviceChargesService: ServiceChargesService,
  ) {
    this.canCreate = this.authService.hasPermission('service-charge.create');
    this.canDelete = this.authService.hasPermission('service-charge.delete');
  }

  ngOnInit(): void {
    this.loadServiceCharges();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    if (this.canCreate) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_ADD,
        type: 'button',
        item: {
          key: KEY_BTN_ADD,
          label: 'เพิ่ม Service Charge',
          callback: () => this.onAdd(),
        },
      });
    }
  }

  loadServiceCharges(): void {
    this.serviceChargesService
      .serviceChargesGetAllGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allServiceCharges.set(response.results ?? []);
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูล Service Charge ได้',
          });
        },
      });
  }

  onAdd(): void {
    this.router.navigate(['/admin-setting/service-charges/create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin-setting/service-charges/update', id]);
  }

  onDelete(id: number, name: string): void {
    this.modalService
      .info({
        icon: Icon.Question,
        title: 'ยืนยันการลบ',
        message: `คุณต้องการลบ Service Charge "${name}" ?`,
        confirmButtonLabel: 'ลบ',
        cancelButtonLabel: 'ยกเลิก',
        onConfirm: () =>
          this.serviceChargesService.serviceChargesDeleteDelete({
            serviceChargeId: id,
          }),
      })
      .onClose.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.modalService.commonSuccess();
          this.loadServiceCharges();
        }
      });
  }
}
