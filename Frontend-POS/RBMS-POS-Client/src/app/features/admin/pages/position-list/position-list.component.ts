import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { PositionResponseModel } from '@app/core/api/models';
import { PositionsService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-position';

@Component({
  selector: 'app-position-list',
  standalone: false,
  templateUrl: './position-list.component.html',
})
export class PositionListComponent implements OnInit, OnDestroy {
  positions = signal<PositionResponseModel[]>([]);
  totalRecords = signal(0);

  searchTerm = '';
  statusFilter: string | null = null;
  page = 1;
  rows = 10;

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly modalService: ModalService,
    private readonly positionsService: PositionsService,
    private readonly router: Router,
  ) {
    this.canCreate = this.authService.hasPermission('position.create');
    this.canUpdate = this.authService.hasPermission('position.update');
    this.canDelete = this.authService.hasPermission('position.delete');
  }

  ngOnInit(): void {
    this.loadPositions();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadPositions();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows)) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadPositions();
  }

  onAdd(): void {
    this.router.navigate(['/admin-setting/positions/create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin-setting/positions/update', id]);
  }

  onDelete(id: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบตำแหน่ง "${name}"?`,
      confirmButtonLabel: 'ลบ',
      cancelButtonLabel: 'ยกเลิก',
      onConfirm: () => this.positionsService.positionsDeletePositionDelete({ positionId: id }),
    }).onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.modalService.commonSuccess();
          this.loadPositions();
        }
      });
  }

  private loadPositions(): void {
    const isActive =
      this.statusFilter === 'active' ? true :
      this.statusFilter === 'inactive' ? false : undefined;

    this.positionsService
      .positionsGetPositionsGet({
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
        isActive,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.positions.set(response.results ?? []);
          this.totalRecords.set(response.total ?? 0);
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลตำแหน่งได้',
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
          label: 'เพิ่มตำแหน่ง',
          callback: () => this.onAdd(),
        },
      });
    }
  }
}
