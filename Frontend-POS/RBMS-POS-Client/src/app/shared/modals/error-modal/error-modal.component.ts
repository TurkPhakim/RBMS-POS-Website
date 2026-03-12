// 1. Angular core
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: false,
  templateUrl: './error-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Error';
  @Input() message = 'Something went wrong.';
  @Input() closeButtonText = 'OK';

  @Output() closed = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }
}
