import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationStart, NavigationEnd, NavigationStart, Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Store } from '@ngrx/store';

import * as LayoutActions from '@app/store/layout/layout.actions';
import { selectBreadcrumbButtons } from '@app/store/layout/layout.selectors';

import { BreadcrumbButton, BreadcrumbItem, Pbutton } from '@app/shared/component-interfaces';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbButtons$;

  private breadcrumbItemsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbItems$ = this.breadcrumbItemsSubject.asObservable();

  private pendingUrl = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
  ) {
    this.breadcrumbButtons$ = this.store.select(selectBreadcrumbButtons);
    this.listenToRouterEvents();
  }

  // --- Button management ---

  addOrUpdateButton(button: BreadcrumbButton): void {
    this.store.dispatch(LayoutActions.addOrUpdateBreadcrumbButton({ button }));
  }

  removeButton(key: string): void {
    this.store.dispatch(LayoutActions.removeBreadcrumbButton({ key }));
  }

  setButtonLoading(key: string, loading: boolean): void {
    this.store.dispatch(LayoutActions.setBreadcrumbButtonLoading({ key, loading }));
  }

  setButtonDisabled(key: string, disabled: boolean): void {
    this.store.dispatch(LayoutActions.setBreadcrumbButtonDisabled({ key, disabled }));
  }

  clearButtons(): void {
    this.store.dispatch(LayoutActions.clearBreadcrumbButtons());
  }

  getButton(key: string): BreadcrumbButton | undefined {
    let found: BreadcrumbButton | undefined;
    this.breadcrumbButtons$.subscribe(buttons => {
      found = buttons.find(b => b.key === key);
    }).unsubscribe();
    return found;
  }

  // --- Auto-clear on navigation ---

  private listenToRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.pendingUrl = event.url;
      }

      if (event instanceof ActivationStart) {
        if (this.pendingUrl !== this.router.url) {
          this.clearButtons();
        }
      }

      if (event instanceof NavigationEnd) {
        this.buildBreadcrumb();
      }
    });
  }

  private buildBreadcrumb(): void {
    const items: BreadcrumbItem[] = [];
    let route: ActivatedRoute | null = this.activatedRoute.root;

    while (route) {
      if (route.snapshot.data['breadcrumb']) {
        const label = route.snapshot.data['breadcrumb'];
        const url = this.getRouteUrl(route);

        if (!items.find(item => item.label === label)) {
          items.push({ label, route: url });
        }
      }
      route = route.firstChild;
    }

    this.breadcrumbItemsSubject.next(items);
  }

  private getRouteUrl(route: ActivatedRoute): string {
    const segments: string[] = [];
    let current: ActivatedRoute | null = route;

    while (current) {
      const seg = current.snapshot.url.map(s => s.path);
      if (seg.length > 0) {
        segments.push(...seg);
      }
      current = current.parent;
    }

    return '/' + segments.reverse().join('/');
  }
}
