import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';

import { ServiceChargeResponseModel } from '@app/core/api/models';
import { ServiceChargesService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { ServiceChargeDialogComponent } from '../../dialogs/service-charge-dialog/service-charge-dialog.component';

const KEY_BTN_ADD = 'add-service-charge';

@Component({
  selector: 'app-service-charge-list',
  standalone: false,
  templateUrl: './service-charge-list.component.html',
  providers: [DialogService],
})
export class ServiceChargeListComponent implements OnInit, OnDestroy {
  serviceCharges = signal<ServiceChargeResponseModel[]>([]);
  totalRecords = signal(0);

  searchTerm = '';
  statusFilter: string | null = null;
  page = 1;
  rows = 10;

  canCreate: boolean;
  canDelete: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly modalService: ModalService,
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

  onFilterChange(): void {
    this.page = 1;
    this.loadServiceCharges();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows)) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadServiceCharges();
  }

  onAdd(): void {
    this.openDialog('เพิ่มค่าบริการ');
  }

  onEdit(serviceCharge: ServiceChargeResponseModel): void {
    this.openDialog('แก้ไขค่าบริการ', serviceCharge);
  }

  onDelete(id: number, name: string): void {
    this.modalService
      .info({
        icon: Icon.Question,
        title: 'ยืนยันการลบ',
        message: `คุณต้องการลบค่าบริการ "${name}" ?`,
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

  private loadServiceCharges(): void {
    const isActive =
      this.statusFilter === 'active' ? true :
      this.statusFilter === 'inactive' ? false : undefined;

    this.serviceChargesService
      .serviceChargesGetAllGet({
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
        isActive,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.serviceCharges.set(response.results ?? []);
          this.totalRecords.set(response.total ?? 0);
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลค่าบริการได้',
          });
        },
      });
  }

  private setupBreadcrumbButtons(): void {
    if (this.canCreate) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_ADD,
        type: 'button',
        item: {
          key: KEY_BTN_ADD,
          label: 'เพิ่มค่าบริการ',
          callback: () => this.onAdd(),
        },
      });
    }
  }

  private openDialog(header: string, serviceCharge?: ServiceChargeResponseModel): void {
    const ref = this.dialogService.open(ServiceChargeDialogComponent, {
      header,
      width: '50vw',
      styleClass: 'card-dialog',
      showHeader: false,
      modal: true,
      data: { serviceCharge },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadServiceCharges();
        }
      });
  }
}
