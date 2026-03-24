import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-generic-icon',
  standalone: false,
  template: `<span [innerHTML]="svgContent"></span>`,
  host: { style: 'display: inline-flex; align-items: center; justify-content: center;' },
})
export class GenericIconComponent {
  @Input() name = '';
  @Input() svgClass = 'w-5 h-5';

  svgContent: SafeHtml = '';

  private static cache = new Map<string, string>();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(): void {
    if (!this.name) return;

    const cached = GenericIconComponent.cache.get(this.name);
    if (cached) {
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.processSvg(cached));
      return;
    }

    this.http.get(`icons/${this.name}.svg`, { responseType: 'text' }).subscribe({
      next: (svg) => {
        GenericIconComponent.cache.set(this.name, svg);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.processSvg(svg));
      },
    });
  }

  private processSvg(svg: string): string {
    return svg
      .replace(/width="[^"]*"/, '')
      .replace(/height="[^"]*"/, '')
      .replace('<svg', `<svg class="${this.svgClass}" style="color: inherit; fill: currentColor;"`);
  }
}
