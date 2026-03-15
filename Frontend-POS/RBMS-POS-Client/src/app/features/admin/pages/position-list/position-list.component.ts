import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { PositionResponseModel } from '@app/core/api/models';
import { PositionsService } from '@app/core/api/services';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-position';

@Component({
  selector: 'app-position-list',
  standalone: false,
  templateUrl: './position-list.component.html',
})
export class PositionListComponent implements OnDestroy {
  positions = signal<PositionResponseModel[]>([]);

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly modalService: ModalService,
    private readonly positionsService: PositionsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPositions();
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
        label: 'เพิ่มตำแหน่ง',
        callback: () => this.onAdd(),
      },
    });
  }

  loadPositions(): void {
    this.positionsService
      .positionsGetPositionsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.positions.set(response.results ?? []);
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลตำแหน่งได้' });
        },
      });
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
}
