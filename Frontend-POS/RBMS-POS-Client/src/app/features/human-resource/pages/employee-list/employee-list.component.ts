import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EmployeeResponseModel } from '@app/core/api/models';
import { HumanResourceService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { CreateUserDialogComponent } from '../../dialogs/create-user-dialog/create-user-dialog.component';
import { CredentialsDialogComponent } from '../../dialogs/credentials-dialog/credentials-dialog.component';
const KEY_BTN_ADD = 'add-employee';
@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent implements OnDestroy {
  private allEmployees = signal<EmployeeResponseModel[]>([]);
  statusFilter = signal<string | null>(null);
  positionFilter = signal<number | null>(null);
  searchTerm = signal('');
  canCreate: boolean;
  canDelete: boolean;

  employees = computed(() => {
    const status = this.statusFilter();
    const positionId = this.positionFilter();
    const search = this.searchTerm().toLowerCase().trim();
    let filtered = this.allEmployees();

    if (status === 'active') {
      filtered = filtered.filter((emp) => emp.isActive === true);
    } else if (status === 'inactive') {
      filtered = filtered.filter((emp) => emp.isActive === false);
    }

    if (positionId) {
      filtered = filtered.filter((emp) => emp.positionId === positionId);
    }

    if (search) {
      filtered = filtered.filter(
        (emp) =>
          emp.fullNameThai?.toLowerCase().includes(search) ||
          emp.fullNameEnglish?.toLowerCase().includes(search),
      );
    }

    return filtered.sort((a, b) => (a.employeeId || 0) - (b.employeeId || 0));
  });

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly humanResourceService: HumanResourceService,
    private readonly modalService: ModalService,
    private readonly router: Router,
  ) {
    this.canCreate = this.authService.hasPermission('employee.create');
    this.canDelete = this.authService.hasPermission('employee.delete');
  }

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
    if (this.canCreate) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_ADD,
        type: 'button',
        item: {
          key: KEY_BTN_ADD,
          label: 'เพิ่มพนักงาน',
          callback: () => this.onAdd(),
        },
      });
    }
  }

  loadEmployees(): void {
    this.humanResourceService
      .humanResourceGetEmployeesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allEmployees.set(response.results ?? []);
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลพนักงานได้',
          });
        },
      });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onAdd(): void {
    this.router.navigate(['/human-resource/employees/create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/human-resource/employees/update', id]);
  }

  onDelete(id: number, fullNameThai: string): void {
    this.modalService
      .info({
        icon: Icon.Question,
        title: 'ยืนยันการลบ',
        message: `คุณต้องการลบพนักงาน "${fullNameThai}"?`,
        confirmButtonLabel: 'ลบ',
        cancelButtonLabel: 'ยกเลิก',
        onConfirm: () =>
          this.humanResourceService.humanResourceDeleteDelete({
            employeeId: id,
          }),
      })
      .onClose.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.modalService.commonSuccess();
          this.loadEmployees();
        }
      });
  }

  onCreateUser(employee: EmployeeResponseModel): void {
    const ref = this.dialogService.open(CreateUserDialogComponent, {
      header: 'สร้างบัญชีผู้ใช้',
      width: '40vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: {
        employee,
        imageUrl: employee.imageFileId
          ? this.getImageUrl(employee.imageFileId)
          : null,
      },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (result?: {
          username: string;
          password: string;
        }) => {
          if (result) {
            this.openCredentialsDialog(result);
            this.loadEmployees();
          }
        },
      );
  }

  private openCredentialsDialog(credentials: {
    username: string;
    password: string;
  }): void {
    this.dialogService.open(CredentialsDialogComponent, {
      header: 'สร้างบัญชีผู้ใช้สำเร็จ',
      width: '40vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { credentials },
    });
  }
}
