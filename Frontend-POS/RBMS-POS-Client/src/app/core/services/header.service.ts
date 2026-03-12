import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Pbutton } from '@app/shared/component-interfaces';
import * as LayoutActions from '@app/store/layout/layout.actions';
import { selectHeaderButtons } from '@app/store/layout/layout.selectors';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  headerButtons$;

  constructor(private store: Store) {
    this.headerButtons$ = this.store.select(selectHeaderButtons);
  }

  addOrUpdateButton(button: Pbutton): void {
    this.store.dispatch(LayoutActions.addOrUpdateHeaderButton({ button }));
  }

  removeButton(key: string): void {
    this.store.dispatch(LayoutActions.removeHeaderButton({ key }));
  }

  setButtonLoading(key: string, loading: boolean): void {
    this.store.dispatch(LayoutActions.setHeaderButtonLoading({ key, loading }));
  }

  setButtonDisabled(key: string, disabled: boolean): void {
    this.store.dispatch(LayoutActions.setHeaderButtonDisabled({ key, disabled }));
  }

  clearButtons(): void {
    this.store.dispatch(LayoutActions.clearHeaderButtons());
  }
}
