import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MenuOptionsService } from '@app/core/api/services/menu-options.service';
import { OptionGroupResponseModel } from '@app/core/api/models/option-group-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-option-group';

@Component({
  selector: 'app-option-group-list',
  standalone: false,
  templateUrl: './option-group-list.component.html',
})
export class OptionGroupListComponent implements OnInit, OnDestroy {
  optionGroups = signal<OptionGroupResponseModel[]>([]);
  totalRecords = signal(0);

  searchTerm = '';
  selectedCategoryType: number | null = null;
  selectedStatus: string | null = null;
  page = 1;
  rows = 10;

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  constructor(
    private readonly menuOptionsService: MenuOptionsService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = this.authService.hasPermission('menu-option.create');
    this.canUpdate = this.authService.hasPermission('menu-option.update');
    this.canDelete = this.authService.hasPermission('menu-option.delete');
  }

  ngOnInit(): void {
    this.loadOptionGroups();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadOptionGroups();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadOptionGroups();
  }

  onEdit(optionGroupId: number): void {
    this.router.navigate(['/menu/options/update', optionGroupId]);
  }

  onDelete(optionGroupId: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบกลุ่มตัวเลือก "${name}" หรือไม่?`,
      onConfirm: () => {
        this.menuOptionsService
          .menuOptionsDeleteOptionGroupDelete({ optionGroupId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadOptionGroups();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message:
                  'ไม่สามารถลบกลุ่มตัวเลือกได้\nเนื่องจากมีเมนูที่ใช้กลุ่มนี้อยู่',
              }),
          });
      },
    });
  }

  private loadOptionGroups(): void {
    const status = this.selectedStatus;
    const isActive =
      status === 'active' ? true : status === 'inactive' ? false : undefined;

    this.menuOptionsService
      .menuOptionsGetAllOptionGroupsGet({
        categoryType: this.selectedCategoryType ?? undefined,
        isActive,
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.optionGroups.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          }),
      });
  }

  private setupBreadcrumbButtons(): void {
    if (!this.canCreate) return;
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่มตัวเลือกเสริม',
        severity: 'primary',
        callback: () => this.router.navigate(['/menu/options/create']),
      },
    });
  }
}
