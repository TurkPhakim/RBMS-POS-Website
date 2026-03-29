import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-expired',
  standalone: false,
  templateUrl: './expired.component.html',
})
export class ExpiredComponent {
  mode: 'expired' | 'closed' = 'expired';

  lottieOptions: AnimationOptions = {
    path: 'animations/expired-mobile-cat.json',
  };

  constructor(private route: ActivatedRoute) {
    this.mode = this.route.snapshot.data['mode'] || 'expired';
  }
}
