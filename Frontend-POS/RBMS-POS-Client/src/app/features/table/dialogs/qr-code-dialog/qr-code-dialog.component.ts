import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';
import { environment } from '@env/environment';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-qr-code-dialog',
  standalone: false,
  templateUrl: './qr-code-dialog.component.html',
})
export class QrCodeDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLDivElement>;

  headerLabel: string;
  table: TableResponseModel;
  qrToken: string;
  shopName: string;
  shopNameThai: string;
  logoUrl: string;
  openedDate: string;
  qrUrl = '';
  isDev = !environment.production;

  private qrCode!: QRCodeStyling;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly branding: ShopBrandingService,
  ) {
    this.table = this.config.data.table;
    this.qrToken = this.config.data.qrToken;
    this.headerLabel = this.config.header!;
    this.shopName = this.branding.shopName();
    this.shopNameThai = this.branding.shopNameThai();
    this.logoUrl = this.branding.logoUrl();

    this.openedDate = this.table.openedAt
      ? new Date(this.table.openedAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  }

  ngAfterViewInit(): void {
    const selfOrderBase = environment.selfOrderUrl.startsWith('http')
      ? environment.selfOrderUrl
      : `${window.location.origin}${environment.selfOrderUrl}`;
    this.qrUrl = `${selfOrderBase}/auth?token=${encodeURIComponent(this.qrToken)}`;

    this.qrCode = new QRCodeStyling({
      width: 240,
      height: 240,
      data: this.qrUrl,
      dotsOptions: {
        type: 'rounded',
        color: '#1e293b',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#1e293b',
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#1e293b',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      qrOptions: {
        errorCorrectionLevel: 'L',
      },
    });

    this.qrCode.append(this.qrCanvas.nativeElement);
  }

  onDownload(): void {
    const qrSize = 280;
    const canvasW = 400;
    const topPadding = 40;
    const bottomPadding = 40;

    // คำนวณความสูงตามจำนวนบรรทัด
    let textBlockH = 0;
    textBlockH += 28; // ชื่อร้าน EN
    if (this.shopNameThai) textBlockH += 24; // ชื่อร้าน TH
    textBlockH += 20; // gap
    textBlockH += 36; // ชื่อโต๊ะ (ใหญ่)
    textBlockH += 22; // โซน
    textBlockH += 16; // gap
    textBlockH += 20; // "สแกนเพื่อสั่งอาหาร"

    const canvasH = topPadding + qrSize + 24 + textBlockH + bottomPadding;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;

    // พื้นหลังขาว
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // วาด QR Code ตรงกลาง
    const qrX = (canvasW - qrSize) / 2;
    const qrSourceEl = this.qrCanvas.nativeElement.querySelector('canvas');
    if (qrSourceEl) {
      ctx.drawImage(qrSourceEl, qrX, topPadding, qrSize, qrSize);
    }

    // วาดข้อความด้านล่าง
    const centerX = canvasW / 2;
    ctx.textAlign = 'center';
    let y = topPadding + qrSize + 32;

    // ชื่อร้าน EN
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(this.shopName, centerX, y);
    y += 28;

    // ชื่อร้าน TH
    if (this.shopNameThai) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#7c2d12';
      ctx.fillText(this.shopNameThai, centerX, y);
      y += 24;
    }

    y += 12;

    // ชื่อโต๊ะ (ใหญ่เด่น)
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(this.table.tableName ?? '', centerX, y);
    y += 28;

    // โซน
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(this.table.zoneName ?? '', centerX, y);
    y += 28;

    // ข้อความสแกน
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText('สแกนเพื่อสั่งอาหาร', centerX, y);

    // ดาวน์โหลด
    const link = document.createElement('a');
    link.download = `qr-${this.table.tableName ?? 'table'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  onClose(): void {
    this.ref.close();
  }

  ngOnDestroy(): void {
    if (this.qrCanvas?.nativeElement) {
      this.qrCanvas.nativeElement.innerHTML = '';
    }
  }
}
