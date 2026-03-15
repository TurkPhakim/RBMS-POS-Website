import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ChildModuleNode, ModuleNode, PermissionItem } from '@app/core/api/models';
import { PositionsService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';

import { markFormDirty } from '@app/shared/utils';

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
  isSaving = signal(false);

  modules = signal<ModuleNode[]>([]);
  grantedIds = signal<Set<number>>(new Set());
  parentExpanded = signal<ExpandState>({});
  childExpanded = signal<ExpandState>({});

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly positionsService: PositionsService,
    private readonly router: Router,
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
        label: 'ย้อนกลับ',
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
        label: 'บันทึก',
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
    this.positionsService
      .positionsGetPositionByIdGet({ positionId: id })
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
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลตำแหน่งได้' });
        },
      });
  }

  loadPermissions(positionId: number): void {
    this.positionsService
      .positionsGetPositionPermissionsGet({ positionId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.modules.set(response.result.moduleTree?.modules ?? []);
            this.grantedIds.set(new Set(response.result.grantedAuthorizeMatrixIds ?? []));
            this.expandAll();
          }
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้' });
        },
      });
  }

  loadModuleTree(): void {
    this.positionsService
      .positionsGetModuleTreeGet()
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
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลโมดูลได้' });
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
      markFormDirty(this.form);
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);

    if (this.isEditMode()) {
      this.updatePosition();
    } else {
      this.createPosition();
    }
  }

  private createPosition(): void {
    const f = this.form.value;
    this.positionsService
      .positionsCreatePositionPost({
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
            this.savePermissions(newId);
          } else {
            this.resetSavingState();
            this.modalService.commonSuccess();
            this.router.navigate(['/admin-setting/positions']);
          }
        },
        error: (error) => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: error.error?.message || 'ไม่สามารถสร้างตำแหน่งได้' });
          this.resetSavingState();
        },
      });
  }

  private updatePosition(): void {
    const id = this.positionId()!;
    const f = this.form.value;

    this.positionsService
      .positionsUpdatePositionPut({
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
          this.savePermissions(id);
        },
        error: (error) => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: error.error?.message || 'ไม่สามารถแก้ไขตำแหน่งได้' });
          this.resetSavingState();
        },
      });
  }

  private savePermissions(positionId: number): void {
    const matrixIds = Array.from(this.grantedIds());
    this.positionsService
      .positionsUpdatePositionPermissionsPut({
        positionId,
        body: { authorizeMatrixIds: matrixIds },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshMyPermissions();
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/admin-setting/positions']);
        },
        error: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/admin-setting/positions']);
        },
      });
  }

  private refreshMyPermissions(): void {
    this.positionsService
      .positionsGetMyPermissionsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.authService.updatePermissions(res.results ?? []);
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

}
