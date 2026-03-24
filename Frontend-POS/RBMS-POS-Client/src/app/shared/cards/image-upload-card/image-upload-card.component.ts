import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-image-upload-card',
  standalone: false,
  template: `
    <div
      class="relative bg-primary-subtle rounded-xl border border-surface-border py-6 overflow-hidden"
    >
      <!-- Decorative Circles -->
      <div
        class="absolute -top-6 -left-6 w-40 h-40 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute -top-4 left-[15%] w-32 h-32 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute -top-10 left-[39%] w-28 h-28 rounded-full bg-primary opacity-[0.12]"
      ></div>
      <div
        class="absolute -top-4 right-[32%] w-32 h-32 rounded-full bg-primary opacity-[0.12]"
      ></div>
      <div
        class="absolute -top-2 right-[10%] w-28 h-28 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute top-[70%] left-[1%] w-28 h-28 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute -bottom-10 left-[20%] w-32 h-32 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute -bottom-12 left-[32%] w-28 h-28 rounded-full bg-primary opacity-[0.12]"
      ></div>
      <div
        class="absolute -bottom-3 right-[35%] w-30 h-30 rounded-full bg-primary opacity-[0.12]"
      ></div>
      <div
        class="absolute -bottom-2 right-[20%] w-28 h-28 rounded-full bg-primary opacity-15"
      ></div>
      <div
        class="absolute top-[25%] left-[30%] w-12 h-12 rounded-full bg-primary opacity-[0.15]"
      ></div>
      <div
        class="absolute top-4 right-[22%] w-10 h-10 rounded-full bg-primary opacity-[0.18]"
      ></div>
      <div
        class="absolute bottom-2 right-[35%] w-10 h-10 rounded-full bg-primary opacity-[0.18]"
      ></div>
      <div
        class="absolute -bottom-4 right-[8%] w-32 h-32 rounded-full bg-primary opacity-15"
      ></div>

      <input
        #fileInput
        type="file"
        [accept]="allowedTypes.join(',')"
        (change)="onFileChange($event)"
        class="hidden"
      />

      <div class="relative z-10 flex flex-col items-center gap-4">
        @if (variant === 'circle') {
          <!-- ===== Circle Variant ===== -->
          <div class="relative">
            @if (displayUrl) {
              <img
                [src]="displayUrl"
                [alt]="label"
                class="w-48 h-48 rounded-full object-cover border-4 border-white"
              />
            } @else {
              <div
                class="w-48 h-48 rounded-full bg-white flex items-center justify-center border-4 border-primary-subtle"
              >
                <app-generic-icon
                  [name]="placeholderIcon"
                  svgClass="w-20 h-20"
                  class="text-primary opacity-60"
                ></app-generic-icon>
              </div>
            }
            @if (!readOnly) {
              <button
                type="button"
                (click)="fileInput.click()"
                class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                [pTooltip]="displayUrl ? 'เปลี่ยนรูป' : 'อัพโหลดรูป'"
                tooltipPosition="top"
              >
                <app-generic-icon
                  name="pen-edit"
                  svgClass="w-4 h-4"
                  class="text-white"
                ></app-generic-icon>
              </button>
              @if (displayUrl) {
                <button
                  type="button"
                  (click)="onRemove()"
                  class="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-danger flex items-center justify-center"
                  pTooltip="ลบรูป"
                  tooltipPosition="top"
                >
                  <app-generic-icon
                    name="trash"
                    svgClass="w-5 h-5"
                    class="text-white"
                  ></app-generic-icon>
                </button>
              }
            }
          </div>
          <p class="text-2xl font-bold text-surface-sub mt-2">{{ label }}</p>
        } @else {
          <!-- ===== Square Variant ===== -->
          @if (displayUrl) {
            <div class="relative">
              <img
                [src]="displayUrl"
                [alt]="label"
                class="w-72 rounded-xl border-4 border-white"
              />
              @if (!readOnly) {
                <button
                  type="button"
                  (click)="fileInput.click()"
                  class="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                  pTooltip="เปลี่ยนรูป"
                  tooltipPosition="top"
                >
                  <app-generic-icon
                    name="pen-edit"
                    svgClass="w-5 h-5"
                    class="text-white"
                  ></app-generic-icon>
                </button>
                <button
                  type="button"
                  (click)="onRemove()"
                  class="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-danger flex items-center justify-center"
                  pTooltip="ลบรูป"
                  tooltipPosition="top"
                >
                  <app-generic-icon
                    name="trash"
                    svgClass="w-5 h-5"
                    class="text-white"
                  ></app-generic-icon>
                </button>
              }
            </div>
            <p class="text-2xl font-bold text-surface-sub mt-2">
              {{ uploadedLabel || label }}
            </p>
          } @else {
            <button
              type="button"
              [disabled]="readOnly"
              (click)="fileInput.click()"
              class="min-w-72 min-h-72 px-12 border-2 border-dashed border-surface-border rounded-xl hover:border-primary transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-white/70 hover:bg-white group disabled:opacity-60 disabled:pointer-events-none"
            >
              <app-generic-icon
                [name]="placeholderIcon"
                svgClass="w-24 h-24"
                class="text-surface-sub group-hover:text-primary transition-colors"
              ></app-generic-icon>
              @if (label) {
                <p
                  class="text-2xl font-bold group-hover:text-primary transition-colors"
                >
                  {{ label }}
                </p>
              }
            </button>
          }
        }
      </div>
    </div>
  `,
})
export class ImageUploadCardComponent {
  @Input() variant: 'circle' | 'square' = 'circle';
  @Input() imageUrl: string | null = null;
  @Input() label = '';
  @Input() uploadedLabel = '';
  @Input() placeholderIcon = '';
  @Input() readOnly = false;
  @Input() maxSizeMb = 5;
  @Input() allowedTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  @Output() fileSelected = new EventEmitter<File>();
  @Output() imageRemoved = new EventEmitter<void>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private previewUrl: string | null = null;
  private removed = false;

  constructor(private readonly modalService: ModalService) {}

  get displayUrl(): string | null {
    if (this.removed) return null;
    return this.previewUrl ?? this.imageUrl;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!this.allowedTypes.includes(file.type)) {
      const allowed = this.allowedTypes
        .map((t) => this.toExtLabel(t))
        .join(', ');
      this.modalService.cancel({
        title: 'ผิดพลาด !',
        message: `รองรับเฉพาะไฟล์ ${allowed} เท่านั้น`,
      });
      input.value = '';
      return;
    }

    const maxSize = this.maxSizeMb * 1024 * 1024;
    if (file.size > maxSize) {
      this.modalService.cancel({
        title: 'ผิดพลาด !',
        message: `ขนาดรูปภาพต้องไม่เกิน ${this.maxSizeMb} MB`,
      });
      input.value = '';
      return;
    }

    this.removed = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.fileSelected.emit(file);
  }

  private toExtLabel(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/webp': 'WebP',
    };
    return map[mime] ?? mime;
  }

  onRemove(): void {
    this.previewUrl = null;
    this.removed = true;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.imageRemoved.emit();
  }
}
