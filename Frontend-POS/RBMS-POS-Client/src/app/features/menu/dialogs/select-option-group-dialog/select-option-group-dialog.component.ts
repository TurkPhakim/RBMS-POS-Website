import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuOptionsService } from '@app/core/api/services/menu-options.service';
import { OptionGroupResponseModel } from '@app/core/api/models/option-group-response-model';

@Component({
  selector: 'app-select-option-group-dialog',
  standalone: false,
  templateUrl: './select-option-group-dialog.component.html',
})
export class SelectOptionGroupDialogComponent implements OnInit {
  optionGroups = signal<OptionGroupResponseModel[]>([]);
  selectedGroups = signal<OptionGroupResponseModel[]>([]);

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly menuOptionsService: MenuOptionsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loadOptionGroups();
  }

  onConfirm(): void {
    this.ref.close(this.selectedGroups());
  }

  onCancel(): void {
    this.ref.close();
  }

  private loadOptionGroups(): void {
    const categoryType: number = this.config.data?.categoryType;
    const excludeIds: number[] = this.config.data?.excludeIds ?? [];

    this.menuOptionsService
      .menuOptionsGetOptionGroupsGet({
        categoryType,
        ItemPerPage: 999,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const all = res.results ?? [];
          const filtered = all.filter(
            (g) => !excludeIds.includes(g.optionGroupId!) && g.isActive,
          );
          this.optionGroups.set(filtered);
        },
      });
  }
}
