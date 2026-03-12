import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { BreadcrumbButton, BreadcrumbItem } from '@app/shared/component-interfaces';

@Component({
  selector: 'app-top-breadcrumb',
  standalone: false,
  templateUrl: './top-breadcrumb.component.html',
})
export class TopBreadcrumbComponent {
  menuItems = signal<BreadcrumbItem[]>([]);
  buttons = signal<BreadcrumbButton[]>([]);

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.breadcrumbService.breadcrumbItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => this.menuItems.set(items));

    this.breadcrumbService.breadcrumbButtons$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(buttons => this.buttons.set(buttons));
  }
}
