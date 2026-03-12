// 1. Angular core
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-generic-icon',
  standalone: false,
  template: '<span [innerHTML]="svgIcon"></span>',
})
export class GenericIconComponent implements OnInit, OnChanges {
  @Input() name = '';
  @Input() svgClass = 'w-5 h-5';

  svgIcon: SafeHtml = '';

  private static svgCache = new Map<string, string>();

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSvg();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] && !changes['name'].firstChange) {
      this.loadSvg();
    }
  }

  private loadSvg(): void {
    if (!this.name) return;

    const cached = GenericIconComponent.svgCache.get(this.name);
    if (cached) {
      this.svgIcon = this.buildSafeHtml(cached);
      return;
    }

    const path = `images/icons/${this.name}.svg`;
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (svgText) => {
        const cleaned = svgText
          .replace(/width="[^"]*"/, '')
          .replace(/height="[^"]*"/, '');
        GenericIconComponent.svgCache.set(this.name, cleaned);
        this.svgIcon = this.buildSafeHtml(cleaned);
        this.cdr.markForCheck();
      },
    });
  }

  private buildSafeHtml(svgText: string): SafeHtml {
    const withClass = svgText.replace('<svg', `<svg class="${this.svgClass}"`);
    return this.sanitizer.bypassSecurityTrustHtml(withClass);
  }
}
