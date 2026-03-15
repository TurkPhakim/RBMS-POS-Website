import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';

import * as LayoutActions from '@app/store/layout/layout.actions';
import { selectSidebarCollapsed } from '@app/store/layout/layout.selectors';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed$: Observable<boolean>;

  constructor(private readonly store: Store) {
    this.isCollapsed$ = this.store.select(selectSidebarCollapsed);
  }

  toggle(): void {
    this.store.dispatch(LayoutActions.toggleSidebar());
  }

  collapse(): void {
    this.store.dispatch(LayoutActions.setSidebarCollapsed({ collapsed: true }));
  }

  expand(): void {
    this.store.dispatch(LayoutActions.setSidebarCollapsed({ collapsed: false }));
  }
}
