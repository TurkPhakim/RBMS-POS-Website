import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

const KEY_BTN_BACK = 'back-table';
const KEY_BTN_SAVE = 'save-table';

@Component({
  selector: 'app-table-manage',
  standalone: false,
  templateUrl: './table-manage.component.html',
})
export class TableManageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  tableId = signal<number | null>(null);
  tableData = signal<TableResponseModel | null>(null);

  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('table-manage.update');
  }

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.setSavingState(true);

    if (this.isEditMode()) {
      this.updateTable();
    } else {
      this.createTable();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      tableName: ['', [Validators.required, Validators.maxLength(50)]],
      zoneId: [null, Validators.required],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(50)]],
      size: ['Medium', Validators.required],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('tableId');
    if (id) {
      this.isEditMode.set(true);
      this.tableId.set(+id);
      this.loadTable(+id);
    }
  }

  private loadTable(id: number): void {
    this.tablesService
      .tablesGetTableGet({ tableId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.result!;
          this.tableData.set(data);
          this.form.patchValue({
            tableName: data.tableName,
            zoneId: data.zoneId,
            capacity: data.capacity,
            size: data.size,
          });
          if (!this.canUpdate) this.form.disable();
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          });
          this.router.navigate(['/table/tables']);
        },
      });
  }

  private createTable(): void {
    const val = this.form.value;
    this.tablesService
      .tablesCreateTablePost({
        body: {
          tableName: val.tableName,
          zoneId: val.zoneId,
          capacity: val.capacity,
          size: val.size,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/table/tables']);
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถสร้างโต๊ะได้',
          });
          this.resetSavingState();
        },
      });
  }

  private updateTable(): void {
    const val = this.form.value;
    this.tablesService
      .tablesUpdateTablePut({
        tableId: this.tableId()!,
        body: {
          tableName: val.tableName,
          zoneId: val.zoneId,
          capacity: val.capacity,
          size: val.size,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/table/tables']);
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถบันทึกข้อมูลได้',
          });
          this.resetSavingState();
        },
      });
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.router.navigate(['/table/tables']),
      },
    });

    const showSave = this.isEditMode() ? this.canUpdate : true;
    if (showSave) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_SAVE,
        type: 'button',
        item: {
          key: KEY_BTN_SAVE,
          label: 'บันทึก',
          severity: 'primary',
          callback: () => this.onSubmit(),
        },
      });
    }
  }

  private setSavingState(saving: boolean): void {
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, saving);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, saving);
  }

  private resetSavingState(): void {
    this.setSavingState(false);
  }
}
