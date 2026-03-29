import { Component } from '@angular/core';
import { delay } from 'rxjs';
import { AnimationOptions } from 'ngx-lottie';
import { LoadingService } from '@app/core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: false,
  template: `
    @if (isLoading$ | async) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
      >
        <ng-lottie
          [options]="lottieOptions"
          width="200px"
          height="200px"
        ></ng-lottie>
      </div>
    }
  `,
})
export class GlobalLoadingComponent {
  lottieOptions: AnimationOptions = {
    path: 'animations/loading-animation.json',
  };

  isLoading$;

  constructor(private readonly loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.loading$.pipe(delay(0));
  }
}
