import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: false,
  templateUrl: './access-denied.component.html',
})
export class AccessDeniedComponent {
  isFlipped = signal(false);

  constructor(private router: Router) {}

  toggleFlip(): void {
    this.isFlipped.update((v) => !v);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
