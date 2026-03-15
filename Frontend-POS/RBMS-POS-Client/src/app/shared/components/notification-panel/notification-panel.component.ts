import { Component } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Store } from '@ngrx/store';
import * as LayoutActions from '@app/store/layout/layout.actions';
import { selectNotificationPanelOpen } from '@app/store/layout/layout.selectors';

@Component({
  selector: 'app-notification-panel',
  standalone: false,
  templateUrl: './notification-panel.component.html',
})
export class NotificationPanelComponent {
  isOpen$;

  lottieOptions: AnimationOptions = {
    path: 'animations/bell-notification.json',
  };

  constructor(private readonly store: Store) {
    this.isOpen$ = this.store.select(selectNotificationPanelOpen);
  }

  close(): void {
    this.store.dispatch(LayoutActions.closeNotificationPanel());
  }
}
