import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectNotificationPanelOpen } from '@app/store/layout/layout.selectors';
import * as LayoutActions from '@app/store/layout/layout.actions';

@Component({
  selector: 'app-notification-panel',
  standalone: false,
  templateUrl: './notification-panel.component.html',
})
export class NotificationPanelComponent {
  isOpen$;

  constructor(private store: Store) {
    this.isOpen$ = this.store.select(selectNotificationPanelOpen);
  }

  close(): void {
    this.store.dispatch(LayoutActions.closeNotificationPanel());
  }
}
