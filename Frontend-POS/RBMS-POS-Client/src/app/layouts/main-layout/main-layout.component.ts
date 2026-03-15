import { Component, OnDestroy, OnInit } from '@angular/core';

import { SessionTimeoutService } from '@app/core/services/session-timeout.service';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  constructor(private readonly sessionTimeout: SessionTimeoutService) {}

  ngOnInit(): void {
    this.sessionTimeout.start();
  }

  ngOnDestroy(): void {
    this.sessionTimeout.stop();
  }
}
