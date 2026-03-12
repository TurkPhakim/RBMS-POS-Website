import { Directive, AfterViewInit, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: 'p-datepicker',
  standalone: false,
})
export class DatePickerIconDirective implements AfterViewInit {
  @Input() timeOnly = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const inputEl = this.el.nativeElement.querySelector('input');
    if (!inputEl) return;

    const iconClass = this.timeOnly ? 'pi-clock' : 'pi-calendar';

    const icon = this.renderer.createElement('i');
    this.renderer.addClass(icon, 'pi');
    this.renderer.addClass(icon, iconClass);
    this.renderer.setStyle(icon, 'position', 'absolute');
    this.renderer.setStyle(icon, 'right', '0.75rem');
    this.renderer.setStyle(icon, 'top', '50%');
    this.renderer.setStyle(icon, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(icon, 'pointer-events', 'none');
    this.renderer.setStyle(icon, 'color', 'var(--p-text-muted-color)');

    const wrapper = inputEl.parentElement;
    if (wrapper) {
      this.renderer.setStyle(wrapper, 'position', 'relative');
      this.renderer.appendChild(wrapper, icon);
    }
  }
}
