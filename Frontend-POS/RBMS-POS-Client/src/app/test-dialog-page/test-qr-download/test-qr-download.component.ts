import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-test-qr-download',
  standalone: false,
  templateUrl: './test-qr-download.component.html',
})
export class TestQrDownloadComponent implements AfterViewInit {
  @ViewChild('previewWithShop') previewWithShop!: ElementRef<HTMLDivElement>;
  @ViewChild('previewNoShop') previewNoShop!: ElementRef<HTMLDivElement>;
  @ViewChild('qrCanvas1') qrCanvas1!: ElementRef<HTMLDivElement>;
  @ViewChild('qrCanvas2') qrCanvas2!: ElementRef<HTMLDivElement>;

  private qr1!: QRCodeStyling;
  private qr2!: QRCodeStyling;

  ngAfterViewInit(): void {
    const qrOpts = {
      width: 240,
      height: 240,
      data: 'https://172.16.8.240/mobile/auth?token=mock-token-12345',
      dotsOptions: { type: 'rounded' as const, color: '#1e293b' },
      cornersSquareOptions: { type: 'extra-rounded' as const, color: '#1e293b' },
      cornersDotOptions: { type: 'dot' as const, color: '#1e293b' },
      backgroundOptions: { color: '#ffffff' },
      qrOptions: { errorCorrectionLevel: 'L' as const },
    };

    this.qr1 = new QRCodeStyling(qrOpts);
    this.qr1.append(this.qrCanvas1.nativeElement);

    this.qr2 = new QRCodeStyling(qrOpts);
    this.qr2.append(this.qrCanvas2.nativeElement);

    // รอ QR render เสร็จแล้วค่อยวาด canvas preview
    setTimeout(() => {
      this.renderPreview(
        this.previewWithShop.nativeElement,
        this.qrCanvas1.nativeElement.querySelector('canvas'),
        'RBMS POS',
        'ร้านอาหาร RBMS',
        'A1',
        'ชั้น 1',
      );
      this.renderPreview(
        this.previewNoShop.nativeElement,
        this.qrCanvas2.nativeElement.querySelector('canvas'),
        '',
        '',
        'B3',
        'ดาดฟ้า',
      );
    }, 500);
  }

  onDownload(containerEl: HTMLDivElement): void {
    const canvas = containerEl.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-preview.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private renderPreview(
    container: HTMLDivElement,
    qrSourceEl: HTMLCanvasElement | null,
    shopNameEn: string,
    shopNameTh: string,
    tableName: string,
    zoneName: string,
  ): void {
    const qrSize = 280;
    const canvasW = 400;
    const topPadding = 40;
    const bottomPadding = 40;

    let textBlockH = 0;
    if (shopNameEn) textBlockH += 28;
    if (shopNameTh) textBlockH += 24;
    textBlockH += 20;
    textBlockH += 36;
    textBlockH += 22;
    textBlockH += 16;
    textBlockH += 20;

    const canvasH = topPadding + qrSize + 24 + textBlockH + bottomPadding;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.border = '1px solid #e2e8f0';
    canvas.style.borderRadius = '8px';
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    const qrX = (canvasW - qrSize) / 2;
    if (qrSourceEl) {
      ctx.drawImage(qrSourceEl, qrX, topPadding, qrSize, qrSize);
    }

    const centerX = canvasW / 2;
    ctx.textAlign = 'center';
    let y = topPadding + qrSize + 32;

    if (shopNameEn) {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(shopNameEn, centerX, y);
      y += 28;
    }

    if (shopNameTh) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#7c2d12';
      ctx.fillText(shopNameTh, centerX, y);
      y += 24;
    }

    y += 12;

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(tableName, centerX, y);
    y += 28;

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(zoneName, centerX, y);
    y += 28;

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText('สแกนเพื่อสั่งอาหาร', centerX, y);

    container.appendChild(canvas);
  }
}
