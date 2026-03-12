import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PositionsService } from '@app/core/api/services';
import { ModuleNode, ChildModuleNode, PermissionItem } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_SAVE = 'save-position';
const KEY_BTN_BACK = 'back';

interface ExpandState {
  [key: number]: boolean;
}

@Component({
  selector: 'app-position-manage',
  standalone: false,
  templateUrl: './position-manage.component.html',
})
export class PositionManageComponent implements OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  positionId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');

  modules = signal<ModuleNode[]>([]);
  grantedIds = signal<Set<number>>(new Set());
  parentExpanded = signal<ExpandState>({});
  childExpanded = signal<ExpandState>({});

  constructor(
    private readonly fb: FormBuilder,
    private readonly positionsService: PositionsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'กลับ',
        icon: 'pi pi-arrow-left',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onCancel(),
      },
    });

    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_SAVE,
      type: 'button',
      item: {
        key: KEY_BTN_SAVE,
        label: this.isEditMode() ? 'บันทึกการแก้ไข' : 'บันทึก',
        icon: 'pi pi-check',
        callback: () => this.onSubmit(),
      },
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      positionName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('positionId');
    if (id) {
      this.isEditMode.set(true);
      this.positionId.set(+id);
      this.loadPosition(+id);
    } else {
      this.loadModuleTree();
    }
  }

  loadPosition(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.positionsService
      .apiAdminPositionsPositionIdGet({ positionId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.form.patchValue({
              positionName: response.result.positionName,
              description: response.result.description,
              isActive: response.result.isActive,
            });
          }
          this.loadPermissions(id);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลตำแหน่งได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  loadPermissions(positionId: number): void {
    this.positionsService
      .apiAdminPositionsPositionIdPermissionsGet({ positionId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.modules.set(response.result.moduleTree?.modules ?? []);
            this.grantedIds.set(new Set(response.result.grantedAuthorizeMatrixIds ?? []));
            this.expandAll();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  loadModuleTree(): void {
    this.isLoading.set(true);

    this.positionsService
      .apiAdminPositionsModulesTreeGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.modules.set(response.result.modules ?? []);
            // ตำแหน่งใหม่ default ติ๊กทั้งหมด
            const allIds = new Set<number>();
            for (const mod of response.result.modules ?? []) {
              for (const child of mod.children ?? []) {
                for (const perm of child.permissions ?? []) {
                  allIds.add(perm.authorizeMatrixId!);
                }
              }
            }
            this.grantedIds.set(allIds);
            this.expandAll();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลโมดูลได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  // === Expand/Collapse ===

  private expandAll(): void {
    const pState: ExpandState = {};
    const cState: ExpandState = {};
    for (const mod of this.modules()) {
      pState[mod.moduleId!] = true;
      for (const child of mod.children ?? []) {
        cState[child.moduleId!] = true;
      }
    }
    this.parentExpanded.set(pState);
    this.childExpanded.set(cState);
  }

  toggleParent(moduleId: number): void {
    const state = { ...this.parentExpanded() };
    state[moduleId] = !state[moduleId];
    this.parentExpanded.set(state);
  }

  toggleChild(moduleId: number): void {
    const state = { ...this.childExpanded() };
    state[moduleId] = !state[moduleId];
    this.childExpanded.set(state);
  }

  isParentExpanded(moduleId: number): boolean {
    return this.parentExpanded()[moduleId] ?? false;
  }

  isChildExpanded(moduleId: number): boolean {
    return this.childExpanded()[moduleId] ?? false;
  }

  // === Checkbox logic ===

  isPermissionChecked(matrixId: number): boolean {
    return this.grantedIds().has(matrixId);
  }

  togglePermission(matrixId: number): void {
    const ids = new Set(this.grantedIds());
    if (ids.has(matrixId)) {
      ids.delete(matrixId);
    } else {
      ids.add(matrixId);
    }
    this.grantedIds.set(ids);
  }

  // Child "ทั้งหมด" checkbox
  getChildAllState(child: ChildModuleNode): 'all' | 'none' | 'indeterminate' {
    const perms = child.permissions ?? [];
    if (perms.length === 0) return 'none';
    const checkedCount = perms.filter(p => this.grantedIds().has(p.authorizeMatrixId!)).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === perms.length) return 'all';
    return 'indeterminate';
  }

  toggleChildAll(child: ChildModuleNode): void {
    const perms = child.permissions ?? [];
    const ids = new Set(this.grantedIds());
    const state = this.getChildAllState(child);
    if (state === 'all') {
      for (const p of perms) ids.delete(p.authorizeMatrixId!);
    } else {
      for (const p of perms) ids.add(p.authorizeMatrixId!);
    }
    this.grantedIds.set(ids);
  }

  // Parent "ทั้งหมด" checkbox
  getParentAllState(mod: ModuleNode): 'all' | 'none' | 'indeterminate' {
    const children = mod.children ?? [];
    if (children.length === 0) return 'none';
    const states = children.map(c => this.getChildAllState(c));
    if (states.every(s => s === 'all')) return 'all';
    if (states.every(s => s === 'none')) return 'none';
    return 'indeterminate';
  }

  toggleParentAll(mod: ModuleNode): void {
    const children = mod.children ?? [];
    const ids = new Set(this.grantedIds());
    const state = this.getParentAllState(mod);
    for (const child of children) {
      for (const p of child.permissions ?? []) {
        if (state === 'all') {
          ids.delete(p.authorizeMatrixId!);
        } else {
          ids.add(p.authorizeMatrixId!);
        }
      }
    }
    this.grantedIds.set(ids);
  }

  // === Submit ===

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);
    this.errorMessage.set(null);

    if (this.isEditMode()) {
      this.updatePosition();
    } else {
      this.createPosition();
    }
  }

  private createPosition(): void {
    const f = this.form.value;
    this.positionsService
      .apiAdminPositionsPost({
        body: {
          positionName: f.positionName,
          description: f.description,
          isActive: f.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const newId = response.result?.positionId;
          if (newId) {
            this.savePermissions(newId, `สร้างตำแหน่ง "${f.positionName}" สำเร็จ`);
          } else {
            this.resetSavingState();
            this.successMessage.set(`สร้างตำแหน่ง "${f.positionName}" สำเร็จ`);
            this.showSuccessModal.set(true);
          }
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'ไม่สามารถสร้างตำแหน่งได้');
          this.showErrorModal.set(true);
          this.resetSavingState();
        },
      });
  }

  private updatePosition(): void {
    const id = this.positionId()!;
    const f = this.form.value;

    this.positionsService
      .apiAdminPositionsPositionIdPut({
        positionId: id,
        body: {
          positionName: f.positionName,
          description: f.description,
          isActive: f.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savePermissions(id, `แก้ไขตำแหน่ง "${f.positionName}" สำเร็จ`);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'ไม่สามารถแก้ไขตำแหน่งได้');
          this.showErrorModal.set(true);
          this.resetSavingState();
        },
      });
  }

  private savePermissions(positionId: number, successMsg: string): void {
    const matrixIds = Array.from(this.grantedIds());
    this.positionsService
      .apiAdminPositionsPositionIdPermissionsPut({
        positionId,
        body: { authorizeMatrixIds: matrixIds },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(successMsg);
          this.showSuccessModal.set(true);
        },
        error: () => {
          this.resetSavingState();
          this.successMessage.set(successMsg);
          this.showSuccessModal.set(true);
        },
      });
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, false);
  }

  onCancel(): void {
    this.router.navigate(['/admin-setting/positions']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/admin-setting/positions']);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['maxlength'])
      return `กรอกได้ไม่เกิน ${field.errors['maxlength'].requiredLength} ตัวอักษร`;
    return '';
  }
}
