import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PositionsService } from '@app/core/api/services';
import { PositionResponseModel } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_ADD = 'add-position';

@Component({
  selector: 'app-position-list',
  standalone: false,
  templateUrl: './position-list.component.html',
})
export class PositionListComponent implements OnDestroy {
  positions = signal<PositionResponseModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  selectedPosition = signal<{ id: number; name: string } | null>(null);

  constructor(
    private readonly positionsService: PositionsService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
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
        icon: 'pi pi-plus',
        callback: () => this.onAdd(),
      },
    });
  }

  loadPositions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.positionsService
      .apiAdminPositionsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.positions.set(response.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลตำแหน่งได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  onAdd(): void {
    this.router.navigate(['/admin-setting/positions/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin-setting/positions/edit', id]);
  }

  onDelete(id: number, name: string): void {
    this.selectedPosition.set({ id, name });
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const position = this.selectedPosition();
    if (!position) return;

    this.positionsService
      .apiAdminPositionsPositionIdDelete({ positionId: position.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.successMessage.set(`ลบตำแหน่ง "${position.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
          this.loadPositions();
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถลบตำแหน่งได้');
          this.showErrorModal.set(true);
          this.showDeleteModal.set(false);
        },
      });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.selectedPosition.set(null);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }
}
