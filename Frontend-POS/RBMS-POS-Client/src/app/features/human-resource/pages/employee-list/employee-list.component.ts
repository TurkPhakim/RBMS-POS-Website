import { Component, signal, computed, DestroyRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { HumanResourceService } from '@app/core/api/services';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EmployeeResponseModel, EEmploymentStatus } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { CreateUserDialogComponent } from '../../dialogs/create-user-dialog/create-user-dialog.component';
import { CredentialsDialogComponent } from '../../dialogs/credentials-dialog/credentials-dialog.component';

const KEY_BTN_ADD = 'add-employee';

type StatusFilter = 'all' | 'active' | 'inactive' | 'onLeave' | 'terminated';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  providers: [DialogService],
})
export class EmployeeListComponent implements OnDestroy {
  private allEmployees = signal<EmployeeResponseModel[]>([]);
  statusFilter = signal<StatusFilter>('all');

  employees = computed(() => {
    const filter = this.statusFilter();
    const all = this.allEmployees();

    let filtered: EmployeeResponseModel[];

    if (filter === 'all') {
      filtered = all;
    } else {
      const statusMap: Record<StatusFilter, EEmploymentStatus | undefined> = {
        all: undefined,
        active: 1,
        inactive: 2,
        onLeave: 3,
        terminated: 4,
      };

      const targetStatus = statusMap[filter];
      if (targetStatus) {
        filtered = all.filter((emp) => emp.employmentStatus === targetStatus);
      } else {
        filtered = all;
      }
    }

    return filtered.sort((a, b) => (a.employeeId || 0) - (b.employeeId || 0));
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  selectedEmployee = signal<{ id: number; name: string } | null>(null);

  constructor(
    private readonly humanResourceService: HumanResourceService,
    private readonly apiConfig: ApiConfiguration,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly dialogService: DialogService,
  ) {}

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  ngOnInit(): void {
    this.loadEmployees();
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
        label: 'เพิ่มพนักงาน',
        icon: 'pi pi-plus',
        callback: () => this.onAdd(),
      },
    });
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.humanResourceService
      .apiHumanresourceGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allEmployees.set(response.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลพนักงานได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }

  isFilterActive(filter: StatusFilter): boolean {
    return this.statusFilter() === filter;
  }

  onAdd(): void {
    this.router.navigate(['/hr/employees/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/hr/employees/edit', id]);
  }

  onDelete(id: number, fullNameThai: string): void {
    this.selectedEmployee.set({ id, name: fullNameThai });
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const employee = this.selectedEmployee();
    if (!employee) return;

    this.humanResourceService
      .apiHumanresourceEmployeeIdDelete({ employeeId: employee.id! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.successMessage.set(`ลบพนักงาน "${employee.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
          this.loadEmployees();
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถลบพนักงานได้');
          this.showErrorModal.set(true);
          this.showDeleteModal.set(false);
        },
      });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.selectedEmployee.set(null);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  getStatusLabel(status: EEmploymentStatus): string {
    switch (status) {
      case 1: return 'ทำงาน';
      case 2: return 'ไม่ทำงาน';
      case 3: return 'ลาหยุด';
      case 4: return 'สิ้นสุดการจ้าง';
      default: return 'ไม่ทราบ';
    }
  }

  getStatusSeverity(status: EEmploymentStatus): 'success' | 'secondary' | 'warn' | 'danger' {
    switch (status) {
      case 1: return 'success';
      case 2: return 'secondary';
      case 3: return 'warn';
      case 4: return 'danger';
      default: return 'secondary';
    }
  }

  onCreateUser(employee: EmployeeResponseModel): void {
    const ref = this.dialogService.open(CreateUserDialogComponent, {
      header: 'สร้างบัญชีผู้ใช้',
      width: '480px',
      modal: true,
      data: { employee, imageUrl: employee.imageFileId ? this.getImageUrl(employee.imageFileId) : null },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result?: { username: string; password: string; emailSent: boolean }) => {
        if (result) {
          this.openCredentialsDialog(result);
          this.loadEmployees();
        }
      });
  }

  private openCredentialsDialog(credentials: { username: string; password: string; emailSent: boolean }): void {
    this.dialogService.open(CredentialsDialogComponent, {
      header: 'สร้างบัญชีผู้ใช้สำเร็จ',
      width: '420px',
      modal: true,
      data: { credentials },
    });
  }
}
