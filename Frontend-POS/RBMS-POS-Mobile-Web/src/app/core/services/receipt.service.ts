import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, of, map } from 'rxjs';

import { SelfOrderService } from '@core/api/services/self-order.service';
import { ReceiptDataModel } from '@core/api/models/receipt-data-model';
import { CustomerAuthService } from './customer-auth.service';
import { environment } from '../../../environments/environment';

import pdfMake from 'pdfmake/build/pdfmake';
import { sarabunVfs } from './receipt-fonts';

// pdfmake 0.3.7 — ใช้ addVirtualFileSystem + addFonts (ไม่ใช่ createPdf args 3-4)
(pdfMake as any).addVirtualFileSystem(sarabunVfs);
(pdfMake as any).addFonts({
  Sarabun: {
    normal: 'Sarabun-Regular.ttf',
    bold: 'Sarabun-Bold.ttf',
    italics: 'Sarabun-Regular.ttf',
    bolditalics: 'Sarabun-Bold.ttf',
  },
});

const CONTENT_WIDTH = 206; // pageWidth 226.77 - margins 10+10

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private logoBase64: string | null = null;
  private cachedLogoFileId: number | null = null;

  constructor(
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
    private http: HttpClient,
  ) {}

  downloadReceipt(orderBillId: number): Observable<void> {
    return this.ensureLogo().pipe(
      switchMap(() => this.selfOrderService.selfOrderGetReceiptGet({ orderBillId })),
      map((res) => {
        if (res.result) {
          this.generatePdf(res.result);
        }
      }),
    );
  }

  downloadConsolidatedReceipt(): Observable<void> {
    return this.ensureLogo().pipe(
      switchMap(() => this.selfOrderService.selfOrderGetConsolidatedReceiptGet()),
      map((res) => {
        if (res.result) {
          this.generatePdf(res.result);
        }
      }),
    );
  }

  private ensureLogo(): Observable<void> {
    const session = this.customerAuth.getSession();
    const logoFileId = session?.logoFileId;

    if (!logoFileId) {
      this.logoBase64 = null;
      return of(undefined);
    }

    if (this.logoBase64 && this.cachedLogoFileId === logoFileId) {
      return of(undefined);
    }

    const url = `${environment.apiUrl}/api/admin/file/${logoFileId}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap((blob) => {
        return new Observable<void>((observer) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.logoBase64 = reader.result as string;
            this.cachedLogoFileId = logoFileId;
            observer.next();
            observer.complete();
          };
          reader.onerror = () => {
            observer.next();
            observer.complete();
          };
          reader.readAsDataURL(blob);
        });
      }),
    );
  }

  private generatePdf(data: ReceiptDataModel): void {
    const docDefinition = this.buildDocDefinition(data);
    pdfMake.createPdf(docDefinition as any).download(
      `receipt-${data.billNumber ?? data.paymentId}.pdf`,
    );
  }

  private buildDocDefinition(d: ReceiptDataModel): object {
    const W = CONTENT_WIDTH;
    const content: any[] = [];

    // ═══════════════ HEADER ═══════════════
    content.push(this.thickLine(W));

    if (d.receiptHeaderText) {
      content.push({
        text: d.receiptHeaderText,
        fontSize: 7,
        alignment: 'center',
        color: '#555',
        margin: [0, 4, 0, 2],
      });
    }

    if (this.logoBase64) {
      content.push({
        image: this.logoBase64,
        width: 60,
        alignment: 'center',
        margin: [0, 6, 0, 2],
      });
    }

    content.push({
      text: d.shopNameThai ?? d.shopNameEnglish ?? '',
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 4, 0, 0],
    });

    if (d.shopNameEnglish && d.shopNameThai) {
      content.push({
        text: d.shopNameEnglish,
        fontSize: 9,
        alignment: 'center',
        color: '#555',
        margin: [0, 1, 0, 0],
      });
    }

    const contactParts: string[] = [];
    if (d.address) contactParts.push(d.address);
    if (d.phoneNumber) contactParts.push(`โทร ${d.phoneNumber}`);
    if (d.taxId) contactParts.push(`เลขผู้เสียภาษี ${d.taxId}`);
    if (contactParts.length > 0) {
      content.push({
        text: contactParts.join('\n'),
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        lineHeight: 1.3,
        margin: [0, 3, 0, 4],
      });
    }

    content.push(this.thickLine(W));

    // ═══════════════ BILL INFO ═══════════════
    if (d.isConsolidated) {
      content.push(this.infoRow('ใบเสร็จรวม', d.orderNumber ?? '-'));
    } else {
      const paymentMethodText =
        d.paymentMethod === 'Cash' ? 'เงินสด' :
        d.paymentMethod === 'QrCode' ? 'QR Code' :
        (d.paymentMethod ?? '-');

      content.push(this.infoRow('บิล', d.billNumber ?? '-', 'ออเดอร์', d.orderNumber ?? '-'));
      content.push(this.infoRow('โต๊ะ', d.tableName ?? '-', 'ชำระ', paymentMethodText));

      if (d.paidAt) {
        content.push(this.infoRow('วันที่', this.formatDate(d.paidAt)));
      }

      if (d.cashierName) {
        content.push(this.infoRow('แคชเชียร์', d.cashierName));
      }
    }

    // ═══════════════ ITEMS / SPLIT INFO ═══════════════
    content.push(this.thinLine(W));

    if (d.billType === 'ByAmount' && d.splitCount && d.splitCount > 0) {
      // หารเท่า — ไม่แสดงตารางรายการ แสดงข้อความแทน
      content.push({
        text: `หารเท่า ${d.splitCount} ส่วน`,
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 8, 0, 2],
      });
      content.push({
        text: `ส่วนที่ ${d.splitIndex} จาก ${d.splitCount}`,
        fontSize: 10,
        alignment: 'center',
        color: '#555',
        margin: [0, 0, 0, 8],
      });
    } else {
      // Full / ByItem / Consolidated — แสดงตารางรายการ
      this.pushItemsTable(content, d);
    }

    // ═══════════════ SUMMARY ═══════════════
    content.push(this.thinLine(W));

    content.push(this.summaryRow('ยอดรวมอาหาร', this.fmt(d.subTotal)));

    if (d.totalDiscountAmount && d.totalDiscountAmount > 0) {
      content.push(this.summaryRow('ส่วนลด', '-' + this.fmt(d.totalDiscountAmount)));
    }

    if (d.serviceChargeAmount && d.serviceChargeAmount > 0) {
      content.push(this.summaryRow(
        `ค่าบริการ (${this.fmt(d.serviceChargeRate)}%)`,
        this.fmt(d.serviceChargeAmount),
      ));
    }

    if (d.vatAmount && d.vatAmount > 0) {
      content.push(this.summaryRow(
        `ภาษีมูลค่าเพิ่ม (${this.fmt(d.vatRate)}%)`,
        this.fmt(d.vatAmount),
      ));
    }

    // ═══════════════ GRAND TOTAL ═══════════════
    content.push(this.thickLine(W));

    content.push({
      columns: [
        { text: 'ยอดชำระสุทธิ', fontSize: 14, bold: true, width: '*' },
        { text: this.fmt(d.grandTotal), fontSize: 14, bold: true, alignment: 'right', width: 'auto' },
      ],
      margin: [0, 4, 0, 4],
    });

    content.push(this.thickLine(W));

    // ═══════════════ PAYMENT INFO ═══════════════
    if (d.isConsolidated && d.payments && d.payments.length > 0) {
      // Consolidated — แสดงรายละเอียดการชำระแต่ละบิล
      content.push({
        text: 'รายละเอียดการชำระเงิน',
        fontSize: 9,
        bold: true,
        margin: [0, 2, 0, 4],
      });
      d.payments.forEach((p) => {
        const method = p.paymentMethod === 'Cash' ? 'เงินสด' :
          p.paymentMethod === 'QrCode' ? 'QR Code' : (p.paymentMethod ?? '-');
        content.push({
          columns: [
            { text: `${p.billNumber}  ${method}`, fontSize: 8, width: '*' },
            { text: this.fmt(p.amountPaid), fontSize: 8, alignment: 'right', width: 'auto' },
          ],
          margin: [0, 1, 0, 1],
        });
      });
    } else if (!d.isConsolidated) {
      content.push(this.summaryRow('รับเงิน', this.fmt(d.amountReceived)));

      if (d.changeAmount && d.changeAmount > 0) {
        content.push({
          columns: [
            { text: 'เงินทอน', fontSize: 10, bold: true, width: '*' },
            { text: this.fmt(d.changeAmount), fontSize: 10, bold: true, alignment: 'right', width: 'auto' },
          ],
          margin: [0, 1, 0, 1],
        });
      }
    }

    // ═══════════════ FOOTER ═══════════════
    content.push(this.thinLine(W));

    if (d.receiptFooterText) {
      content.push({
        text: d.receiptFooterText,
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        margin: [0, 3, 0, 0],
      });
    }

    // Shop address + phone (footer)
    const footerContact: string[] = [];
    if (d.address) footerContact.push(d.address);
    if (d.phoneNumber) footerContact.push(`โทร ${d.phoneNumber}`);
    if (footerContact.length > 0) {
      content.push({
        text: footerContact.join('\n'),
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        lineHeight: 1.3,
        margin: [0, 3, 0, 0],
      });
    }

    content.push({
      text: 'ขอบคุณที่ใช้บริการ',
      fontSize: 11,
      bold: true,
      alignment: 'center',
      margin: [0, 6, 0, 4],
    });

    content.push(this.thickLine(W));

    return {
      pageSize: { width: 226.77, height: 'auto' },
      pageMargins: [10, 10, 10, 10],
      content,
      defaultStyle: { font: 'Sarabun' },
    };
  }

  private pushItemsTable(content: any[], d: ReceiptDataModel): void {
    const items = d.items ?? [];
    const itemRows: any[][] = [];

    itemRows.push([
      { text: 'รายการ', fontSize: 8, bold: true },
      { text: 'จำนวน', fontSize: 8, bold: true, alignment: 'center' },
      { text: 'ราคา', fontSize: 8, bold: true, alignment: 'right' },
      { text: 'รวม', fontSize: 8, bold: true, alignment: 'right' },
    ]);

    items.forEach((item) => {
      itemRows.push([
        { text: item.menuName ?? '', fontSize: 9 },
        { text: `${item.quantity}`, fontSize: 9, alignment: 'center' },
        { text: this.fmt(item.unitPrice), fontSize: 9, alignment: 'right' },
        { text: this.fmt(item.totalPrice), fontSize: 9, alignment: 'right' },
      ]);

      if (item.options && item.options.length > 0) {
        itemRows.push([
          {
            text: '  + ' + item.options.join(', '),
            fontSize: 7,
            color: '#666',
            colSpan: 4,
          },
          {}, {}, {},
        ]);
      }

      if (item.note) {
        itemRows.push([
          {
            text: '  * ' + item.note,
            fontSize: 7,
            italics: true,
            color: '#888',
            colSpan: 4,
          },
          {}, {}, {},
        ]);
      }
    });

    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 28, 50, 50],
        body: itemRows,
      },
      layout: {
        hLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
        vLineWidth: () => 0,
        hLineColor: () => '#bbb',
        paddingLeft: () => 1,
        paddingRight: () => 1,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, 2, 0, 2],
    });
  }

  // ── Layout helpers ──

  private thickLine(w: number): object {
    return {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: w, y2: 0, lineWidth: 1.2, lineColor: '#333' }],
      margin: [0, 2, 0, 2],
    };
  }

  private thinLine(w: number): object {
    return {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: w, y2: 0, dash: { length: 3, space: 2 }, lineColor: '#aaa' }],
      margin: [0, 3, 0, 3],
    };
  }

  private infoRow(label1: string, value1: string, label2?: string, value2?: string): object {
    if (label2 && value2) {
      return {
        columns: [
          { text: `${label1}: ${value1}`, fontSize: 8, width: '*' },
          { text: `${label2}: ${value2}`, fontSize: 8, width: 'auto' },
        ],
        margin: [0, 1, 0, 1],
      };
    }
    return {
      text: `${label1}: ${value1}`,
      fontSize: 8,
      margin: [0, 1, 0, 1],
    };
  }

  private summaryRow(label: string, value: string): object {
    return {
      columns: [
        { text: label, fontSize: 9, width: '*' },
        { text: value, fontSize: 9, alignment: 'right', width: 'auto' },
      ],
      margin: [0, 1, 0, 1],
    };
  }

  private fmt(n?: number | null): string {
    if (n == null) return '0.00';
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
}
