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
import { ShopSettingsService } from '@app/core/api/services/shop-settings.service';
import { environment } from '@env/environment';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-qr-code-dialog',
  standalone: false,
  templateUrl: './qr-code-dialog.component.html',
})
export class QrCodeDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLDivElement>;

  table: TableResponseModel;
  qrToken: string;
  shopName: string;
  shopNameThai: string;
  logoUrl: string;
  openedDate: string;
  qrUrl = '';
  qrDataUrl = '';
  isDev = !environment.production;
  wifiSsid = '';
  wifiPassword = '';

  private qrCode!: QRCodeStyling;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly branding: ShopBrandingService,
    private readonly shopSettingsService: ShopSettingsService,
  ) {
    this.table = this.config.data.table;
    this.qrToken = this.config.data.qrToken;
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

    // Fetch WiFi info
    this.shopSettingsService.shopSettingsGetGet().subscribe({
      next: (res) => {
        this.wifiSsid = res.result?.wifiSsid ?? '';
        this.wifiPassword = res.result?.wifiPassword ?? '';
      },
    });
  }

  ngAfterViewInit(): void {
    // ใช้ short code URL ถ้ามี → QR สั้นลงจาก ~400 เหลือ ~40 ตัวอักษร
    if (this.table.qrShortCode) {
      const apiBase = environment.apiUrl.startsWith('http')
        ? environment.apiUrl
        : `${window.location.origin}${environment.apiUrl}`;
      this.qrUrl = `${apiBase}/q/${this.table.qrShortCode}`;
    } else {
      // Fallback: ใช้ long URL กรณี short code ยังไม่มี
      const selfOrderBase = environment.selfOrderUrl.startsWith('http')
        ? environment.selfOrderUrl
        : `${window.location.origin}${environment.selfOrderUrl}`;
      this.qrUrl = `${selfOrderBase}/auth?token=${encodeURIComponent(this.qrToken)}`;
    }

    this.qrCode = new QRCodeStyling({
      width: 600,
      height: 600,
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

    // แปลง canvas → data URL สำหรับ p-image preview
    setTimeout(() => {
      const canvas = this.qrCanvas.nativeElement.querySelector('canvas');
      if (canvas) {
        this.qrDataUrl = canvas.toDataURL('image/png');
      }
    }, 100);
  }

  onDownload(): void {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => this.drawAndDownload(logoImg);
    logoImg.onerror = () => {
      // fallback — วาดโดยไม่มี logo
      this.drawAndDownload(null);
    };
    logoImg.src = this.logoUrl;
  }

  private drawAndDownload(logoImg: HTMLImageElement | null): void {
    const canvasW = 400;
    const padding = 32;
    const centerX = canvasW / 2;
    const qrSize = 200;
    const qrFramePad = 12;

    // --- คำนวณ height ---
    const logoSize = 80;
    const headerH = logoImg ? logoSize + 8 : 0; // header row (logo + text)
    // ถ้าไม่มี logo → แสดงชื่อร้านแบบ center
    const nameOnlyH = !logoImg ? ((this.shopNameThai ? 34 : 0) + (this.shopName ? 28 : 0)) : 0;

    let totalH = padding;
    totalH += headerH || nameOnlyH;
    totalH += 14; // gap before QR
    totalH += qrFramePad * 2 + qrSize; // QR frame
    totalH += 18; // gap
    totalH += 40; // badge
    totalH += 14; // gap
    totalH += 32; // โซน-โต๊ะ
    totalH += 24; // วันที่
    if (this.wifiSsid) {
      totalH += 16; // gap
      totalH += this.wifiPassword ? 68 : 48; // WiFi box (2 lines or 1)
    }
    totalH += padding;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d')!;

    // พื้นหลังขาว
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, totalH);

    let y = padding;

    // === Header: Logo (ซ้าย) + ชื่อร้าน (ขวา จัดกลางแนวตั้ง) ===
    if (logoImg) {
      const logoX = padding;

      // Logo วงกลม (พื้นขาว + วาด logo มี padding ด้านใน)
      const logoPad = 6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(logoX, y, logoSize, logoSize);
      ctx.drawImage(logoImg, logoX + logoPad, y + logoPad, logoSize - logoPad * 2, logoSize - logoPad * 2);
      ctx.restore();

      // Border วงกลม
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // ชื่อร้าน (ขวาของ logo, จัดกลางแนวตั้งกับ logo)
      const textX = logoX + logoSize + 10;
      const textAreaW = canvasW - textX - padding;
      const textCenterX = textX + textAreaW / 2;

      ctx.textAlign = 'center';
      if (this.shopNameThai && this.shopName) {
        // 2 บรรทัด — จัดกลางแนวตั้ง
        const textBlockH = 34 + 26;
        const textStartY = y + (logoSize - textBlockH) / 2;
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#ea7600';
        ctx.fillText(this.shopNameThai, textCenterX, textStartY + 26);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(this.shopName, textCenterX, textStartY + 26 + 30);
      } else if (this.shopNameThai) {
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#ea7600';
        ctx.fillText(this.shopNameThai, textCenterX, y + logoSize / 2 + 9);
      } else if (this.shopName) {
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(this.shopName, textCenterX, y + logoSize / 2 + 9);
      }

      y += logoSize + 8;
    } else {
      // ไม่มี logo → ชื่อร้าน center
      ctx.textAlign = 'center';
      if (this.shopNameThai) {
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#ea7600';
        ctx.fillText(this.shopNameThai, centerX, y + 26);
        y += 34;
      }
      if (this.shopName) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(this.shopName, centerX, y + 20);
        y += 28;
      }
    }

    y += 14; // gap before QR

    // === QR Code กรอบ ===
    ctx.textAlign = 'center';
    const frameW = qrSize + qrFramePad * 2;
    const frameX = centerX - frameW / 2;
    const frameH = qrSize + qrFramePad * 2;

    this.roundRect(ctx, frameX, y, frameW, frameH, 16);
    ctx.fillStyle = '#fff7ed';
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 2;
    ctx.stroke();

    const qrSourceEl = this.qrCanvas.nativeElement.querySelector('canvas');
    if (qrSourceEl) {
      ctx.drawImage(qrSourceEl, frameX + qrFramePad, y + qrFramePad, qrSize, qrSize);
    }
    y += frameH + 18;

    // === Badge "สแกนเพื่อสั่งอาหาร" ===
    const badgeText = 'สแกนเพื่อสั่งอาหาร';
    ctx.font = 'bold 18px sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 48;
    const badgeH = 36;
    const badgeX = centerX - badgeW / 2;

    this.roundRect(ctx, badgeX, y, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = '#ea7600';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, centerX, y + 24);
    y += badgeH + 14;

    // === โซน - โต๊ะ ===
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`โซน${this.table.zoneName ?? ''} - โต๊ะ${this.table.tableName ?? ''}`, centerX, y + 22);
    y += 32;

    // === วันที่ ===
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(this.openedDate, centerX, y + 16);
    y += 24;

    // === WiFi (กรอบ rounded) ===
    if (this.wifiSsid) {
      y += 16;
      const wifiBoxW = 240;
      const wifiBoxX = centerX - wifiBoxW / 2;
      const wifiBoxH = this.wifiPassword ? 68 : 48;

      this.roundRect(ctx, wifiBoxX, y, wifiBoxW, wifiBoxH, 12);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#475569';
      if (this.wifiPassword) {
        ctx.fillText(`WiFi: ${this.wifiSsid}`, centerX, y + 28);
        ctx.fillText(`รหัส: ${this.wifiPassword}`, centerX, y + 50);
      } else {
        ctx.fillText(`WiFi: ${this.wifiSsid}`, centerX, y + 30);
      }
    }

    // ดาวน์โหลด
    const link = document.createElement('a');
    link.download = `QR-Zone${this.table.zoneName ?? ''}-Table${this.table.tableName ?? ''}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
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
