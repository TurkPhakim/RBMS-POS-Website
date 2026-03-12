import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-access-denied',
  standalone: false,
  templateUrl: './access-denied.component.html',
})
export class AccessDeniedComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
