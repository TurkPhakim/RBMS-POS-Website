import { AfterViewInit, Directive, ElementRef, Host, Input, Renderer2 } from '@angular/core';
import { DatePicker } from 'primeng-buddhist-year-datepicker';

@Directive({
  selector: 'p-datepicker',
  standalone: false,
})
export class DatePickerIconDirective implements AfterViewInit {
  @Input() timeOnly = false;
  @Input() showTime = false;
  @Input() showClear = false;

  constructor(
    @Host() private readonly datePicker: DatePicker,
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
  ) {
    this.datePicker.appendTo = 'body';
    this.datePicker.baseZIndex = 10000;
  }

  ngAfterViewInit(): void {
    const inputEl = this.el.nativeElement.querySelector('input');
    if (!inputEl) return;

    if (this.showClear) {
      this.renderer.addClass(this.el.nativeElement, 'has-clear-icon');
    }

    let iconName: string;
    if (this.timeOnly) {
      iconName = 'clock-activity';
    } else if (this.showTime) {
      iconName = 'calendar-clock';
    } else {
      iconName = 'calendar-plus';
    }

    const icon = this.renderer.createElement('span');
    this.renderer.setStyle(icon, 'position', 'absolute');
    this.renderer.setStyle(icon, 'right', '0.75rem');
    this.renderer.setStyle(icon, 'top', '50%');
    this.renderer.setStyle(icon, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(icon, 'pointer-events', 'none');
    this.renderer.setStyle(icon, 'display', 'inline-block');
    this.renderer.setStyle(icon, 'width', '1.25rem');
    this.renderer.setStyle(icon, 'height', '1.25rem');
    this.renderer.setStyle(icon, 'background-color', 'var(--p-text-muted-color)');
    this.renderer.setStyle(icon, '-webkit-mask-image', `url('/icons/${iconName}.svg')`);
    this.renderer.setStyle(icon, '-webkit-mask-size', 'contain');
    this.renderer.setStyle(icon, '-webkit-mask-repeat', 'no-repeat');
    this.renderer.setStyle(icon, '-webkit-mask-position', 'center');
    this.renderer.setStyle(icon, 'mask-image', `url('/icons/${iconName}.svg')`);
    this.renderer.setStyle(icon, 'mask-size', 'contain');
    this.renderer.setStyle(icon, 'mask-repeat', 'no-repeat');
    this.renderer.setStyle(icon, 'mask-position', 'center');

    const wrapper = inputEl.parentElement;
    if (wrapper) {
      this.renderer.setStyle(wrapper, 'position', 'relative');
      this.renderer.appendChild(wrapper, icon);
    }
  }
}
