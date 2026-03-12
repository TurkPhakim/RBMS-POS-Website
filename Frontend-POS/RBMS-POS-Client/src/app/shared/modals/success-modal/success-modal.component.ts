// 1. Angular core
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-success-modal',
  standalone: false,
  templateUrl: './success-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() title = 'Success!';
  @Input() message = '';
  /** true = auto-close after 2s with progress bar | false = show close button */
  @Input() autoClose = true;
  @Input() closeButtonText = 'OK';

  @Output() closed = new EventEmitter<void>();

  private timer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && this.autoClose) {
        this.clearTimer();
        this.timer = setTimeout(() => {
          this.closed.emit();
        }, 2000);
      } else if (!this.isOpen) {
        this.clearTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onClose(): void {
    this.closed.emit();
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}
