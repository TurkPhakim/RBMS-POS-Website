import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-access-denied',
  standalone: false,
  templateUrl: './access-denied.component.html',
})
export class AccessDeniedComponent {
  isFlipped = signal(false);

  lottieOptions: AnimationOptions = {
    path: 'animations/access-denied.json',
  };

  constructor(private router: Router) {}

  toggleFlip(): void {
    this.isFlipped.update((v) => !v);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
