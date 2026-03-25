import {
  AfterContentInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { Footer } from 'primeng/api';
@Component({
  selector: 'app-card-template',
  standalone: false,
  template: `
    @if (headerLabel || hasCustomHeader) {
      <div
        class="px-6 py-4 border-b border-surface-border flex items-center"
        [ngClass]="headerClass"
      >
        @if (hasCustomHeader) {
          <ng-content select="[cardHeader]"></ng-content>
        } @else {
          <h3 [ngClass]="headerLabelClass">
            {{ headerLabel }}
          </h3>
        }
      </div>
    }
    <div class="p-6 card-template-body" [ngClass]="contentClass">
      <ng-content></ng-content>
    </div>
    @if (hasFooter) {
      <div class="p-4 border-t border-surface-border flex gap-2 justify-center">
        <ng-content select="p-footer"></ng-content>
      </div>
    }
  `,
})
export class CardTemplateComponent implements AfterContentInit {
  @ContentChild('cardHeader', { read: ElementRef }) headerContent?: ElementRef;
  @ContentChild(Footer) footerContent?: Footer;

  @Input() headerLabel = '';
  @Input() headerLabelClass = 'text-xl font-semibold text-primary-dark';
  @Input() headerClass = '';
  @Input() contentClass = '';

  hasCustomHeader = false;
  hasFooter = false;

  ngAfterContentInit(): void {
    this.hasCustomHeader = !!this.headerContent;
    this.hasFooter = !!this.footerContent;
  }
}
