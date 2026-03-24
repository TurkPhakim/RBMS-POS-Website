import { Component } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-expired',
  standalone: false,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-badge via-primary-light/60 to-warning-bg">
      <div class="w-full text-center px-8 -mt-28">
        <!-- Lottie Animation -->
        <div class="-mb-6 flex justify-center">
          <ng-lottie
            [options]="lottieOptions"
            width="360px"
            height="360px"
          ></ng-lottie>
        </div>

        <h1 class="text-4xl font-bold text-primary-dark">
          เซสชันหมดอายุ
        </h1>

        <p class="text-lg text-surface-dark/80 mt-4">
          กรุณาสแกน QR Code ที่โต๊ะอีกครั้ง
        </p>
        <p class="text-lg text-surface-dark/80">
          หรือแจ้งพนักงานเพื่อขอความช่วยเหลือ
        </p>
      </div>
    </div>
  `,
})
export class ExpiredComponent {
  lottieOptions: AnimationOptions = {
    path: 'animations/expired-mobile-cat.json',
  };
}
