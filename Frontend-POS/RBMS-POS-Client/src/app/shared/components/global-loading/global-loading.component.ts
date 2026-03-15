import { Component } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

import { LoadingService } from '@app/core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: false,
  template: `
    @if (loadingService.loading$ | async) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
        <ng-lottie [options]="lottieOptions" width="200px" height="200px"></ng-lottie>
      </div>
    }
  `,
})
export class GlobalLoadingComponent {
  lottieOptions: AnimationOptions = {
    path: 'animations/loading-animation.json',
  };

  constructor(public readonly loadingService: LoadingService) {}
}
