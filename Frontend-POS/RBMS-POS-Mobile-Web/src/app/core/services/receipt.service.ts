import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, of, map } from 'rxjs';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ReceiptDataModel } from '@core/api/models/receipt-data-model';
import { CustomerAuthService } from './customer-auth.service';
import { environment } from '../../../environments/environment';
import pdfMake from 'pdfmake/build/pdfmake';
import { sarabunVfs } from './receipt-fonts';

// pdfmake 0.3.7 — ใช้ addVirtualFileSystem + addFonts
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
      switchMap(() =>
        this.selfOrderService.selfOrderGetReceiptGet({ orderBillId }),
      ),
      map((res) => {
        if (res.result) {
          this.generatePdf(res.result);
        }
      }),
    );
  }

  downloadConsolidatedReceipt(): Observable<void> {
    return this.ensureLogo().pipe(
      switchMap(() =>
        this.selfOrderService.selfOrderGetConsolidatedReceiptGet(),
      ),
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
    pdfMake
      .createPdf(docDefinition as any)
      .download(`receipt-${data.billNumber ?? data.paymentId}.pdf`);
  }

  private buildDocDefinition(d: ReceiptDataModel): object {
    const W = CONTENT_WIDTH;
    const content: any[] = [];

    // ═══════════════ HEADER ═══════════════
    content.push(this.thickLine(W));

    // Logo
    if (this.logoBase64) {
      content.push({
        image: this.logoBase64,
        width: 60,
        alignment: 'center',
        margin: [0, 6, 0, 2],
      });
    }

    // Shop name (Thai)
    content.push({
      text: d.shopNameThai ?? d.shopNameEnglish ?? '',
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 4, 0, 0],
    });

    // Shop name (English)
    if (d.shopNameEnglish && d.shopNameThai) {
      content.push({
        text: d.shopNameEnglish,
        fontSize: 10,
        alignment: 'center',
        color: '#555',
        margin: [0, 1, 0, 0],
      });
    }

    // Custom header text (แยกบรรทัด)
    if (d.receiptHeaderText) {
      content.push({
        text: d.receiptHeaderText,
        fontSize: 7,
        alignment: 'center',
        color: '#555',
        lineHeight: 1.3,
        margin: [0, 2, 0, 0],
      });
    }

    // Company name (ถ้ามี) — ไทย - อังกฤษ
    const companyName = d.companyNameThai
      ? d.companyNameEnglish
        ? `${d.companyNameThai} - ${d.companyNameEnglish}`
        : d.companyNameThai
      : d.companyNameEnglish ?? null;
    if (companyName) {
      content.push({
        text: companyName,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 2, 0, 0],
      });
    }

    // Phone
    if (d.phoneNumber) {
      content.push({
        text: `เบอร์โทรศัพท์: ${this.formatPhone(d.phoneNumber)}`,
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        margin: [0, 2, 0, 0],
      });
    }

    // TaxId
    if (d.taxId) {
      content.push({
        text: `เลขประจำตัวผู้เสียภาษี: ${this.formatTaxId(d.taxId)}`,
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        margin: [0, 2, 0, 0],
      });
    }

    content.push(this.thickLine(W));

    // ═══════════════ BILL INFO ═══════════════
    if (d.isConsolidated) {
      // แถว 1: ออเดอร์ที่ + วันที่
      content.push(
        this.infoRow(
          'ออเดอร์ที่',
          d.orderNumber ?? '-',
          'วันที่',
          d.paidAt ? this.formatDate(d.paidAt) : '-',
        ),
      );

      // แถว 2: โซน-โต๊ะ + แคชเชียร์
      const tableDisplay = d.tableName
        ? `${d.zoneName ?? ''} - ${d.tableName}${d.guestCount ? ` (${d.guestCount} คน)` : ''}`
        : '-';
      content.push(
        this.infoRow(
          'โซน-โต๊ะ',
          tableDisplay,
          'แคชเชียร์',
          d.cashierName ?? '-',
        ),
      );
    } else {
      const paymentMethodText =
        d.paymentMethod === 'Cash'
          ? 'เงินสด'
          : d.paymentMethod === 'QrPayment'
            ? 'QR-Payment'
            : (d.paymentMethod ?? '-');

      // แถว 1: บิลเลขที่ + วันที่
      content.push(
        this.infoRow(
          'บิลเลขที่',
          d.billNumber ?? '-',
          'วันที่',
          d.paidAt ? this.formatDate(d.paidAt) : '-',
        ),
      );

      // แถว 2: ออเดอร์ + โซน-โต๊ะ
      const tableDisplay = d.tableName
        ? `${d.zoneName ?? ''} - ${d.tableName}${d.guestCount ? ` (${d.guestCount} คน)` : ''}`
        : '-';
      content.push(
        this.infoRow(
          'ออเดอร์ที่',
          d.orderNumber ?? '-',
          'โซน-โต๊ะ',
          tableDisplay,
        ),
      );

      // แถว 3: ชำระด้วย + แคชเชียร์
      content.push(
        this.infoRow(
          'ชำระด้วย',
          paymentMethodText,
          'แคชเชียร์',
          d.cashierName ?? '-',
        ),
      );
    }

    // ═══════════════ ITEMS / SPLIT INFO ═══════════════
    content.push(this.thinLine(W));

    if (d.billType === 'ByAmount' && d.splitCount && d.splitCount > 0) {
      // หารเท่า — แสดงรายการออเดอร์ + ยอดรวมก่อนหาร + ข้อความหารเท่า
      this.pushItemsTable(content, d);
      content.push(this.thinLine(W));
      content.push(this.summaryRow('ยอดรวมก่อนหาร', this.fmt(d.originalSubTotal)));
      content.push({
        text: `หารเท่า ${d.splitCount} ส่วน`,
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 4, 0, 2],
      });
      content.push({
        text: `ส่วนที่ ${d.splitIndex} จาก ${d.splitCount}`,
        fontSize: 10,
        alignment: 'center',
        color: '#555',
        margin: [0, 0, 0, 4],
      });
    } else {
      // Full / ByItem / Consolidated — แสดงตารางรายการ
      this.pushItemsTable(content, d);
    }

    // ═══════════════ SUMMARY ═══════════════
    content.push(this.thinLine(W));

    const subTotalLabel =
      d.billType === 'ByAmount' && d.splitCount && d.splitCount > 0
        ? 'ยอดต่อส่วน'
        : 'ยอดรวมรายการ';
    content.push(this.summaryRow(subTotalLabel, this.fmt(d.subTotal)));

    if (d.totalDiscountAmount && d.totalDiscountAmount > 0) {
      content.push(
        this.summaryRow('ส่วนลด', '-' + this.fmt(d.totalDiscountAmount)),
      );
    }

    if (d.serviceChargeAmount && d.serviceChargeAmount > 0) {
      content.push(
        this.summaryRow(
          `ค่าบริการ (${this.fmt(d.serviceChargeRate)}%)`,
          this.fmt(d.serviceChargeAmount),
        ),
      );
    }

    if (d.vatAmount && d.vatAmount > 0) {
      content.push(
        this.summaryRow(
          `ภาษีมูลค่าเพิ่ม (${this.fmt(d.vatRate)}%)`,
          this.fmt(d.vatAmount),
        ),
      );
    }

    // ═══════════════ GRAND TOTAL ═══════════════
    content.push(this.thickLine(W));

    content.push({
      columns: [
        { text: 'ยอดชำระสุทธิ', fontSize: 14, bold: true, width: '*' },
        {
          text: this.fmt(d.grandTotal),
          fontSize: 14,
          bold: true,
          alignment: 'right',
          width: 'auto',
        },
      ],
      margin: [0, 4, 0, 4],
    });

    content.push(this.thickLine(W));

    // ═══════════════ PAYMENT INFO ═══════════════
    if (d.isConsolidated && d.payments && d.payments.length > 0) {
      // Consolidated — แสดงรายละเอียดการชำระแต่ละบิล
      const allEqual =
        d.payments.length > 1 &&
        d.payments.every((p) => p.amountPaid === d.payments![0].amountPaid);
      const splitLabel = allEqual
        ? `หารเท่า ${d.payments.length} บิล`
        : `แยก ${d.payments.length} บิล`;

      content.push({
        text: `รายละเอียดการชำระเงิน (${splitLabel})`,
        fontSize: 9,
        bold: true,
        margin: [0, 2, 0, 4],
      });

      const payRows: any[][] = [];
      payRows.push([
        { text: 'หมายเลขบิล', fontSize: 7, bold: true },
        { text: 'ชำระด้วย', fontSize: 7, bold: true, alignment: 'center' },
        { text: 'จำนวนเงิน', fontSize: 7, bold: true, alignment: 'right' },
      ]);
      d.payments.forEach((p) => {
        const method =
          p.paymentMethod === 'Cash'
            ? 'เงินสด'
            : p.paymentMethod === 'QrPayment'
              ? 'QR-Payment'
              : (p.paymentMethod ?? '-');
        payRows.push([
          { text: p.billNumber ?? '-', fontSize: 8 },
          { text: method, fontSize: 8, alignment: 'center' },
          { text: this.fmt(p.amountPaid), fontSize: 8, alignment: 'right' },
        ]);
      });
      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 50, 55],
          body: payRows,
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
        margin: [0, 0, 0, 2],
      });
    } else if (!d.isConsolidated) {
      content.push(this.summaryRow('รับเงิน', this.fmt(d.amountReceived)));

      if (d.changeAmount && d.changeAmount > 0) {
        content.push({
          columns: [
            { text: 'เงินทอน', fontSize: 10, bold: true, width: '*' },
            {
              text: this.fmt(d.changeAmount),
              fontSize: 10,
              bold: true,
              alignment: 'right',
              width: 'auto',
            },
          ],
          margin: [0, 1, 0, 1],
        });
      }
    }

    // ═══════════════ FOOTER ═══════════════
    content.push(this.thinLine(W));

    // Contact info (ถ้ามี)
    const contactLines: string[] = [];
    if (d.shopEmail) contactLines.push(`Email: ${d.shopEmail}`);
    if (d.facebook) contactLines.push(`Facebook: ${d.facebook}`);
    if (d.instagram) contactLines.push(`Instagram: ${d.instagram}`);
    if (d.lineId) contactLines.push(`LINE: ${d.lineId}`);
    if (d.website) contactLines.push(d.website);
    if (contactLines.length > 0) {
      content.push({
        text: contactLines.join('\n'),
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        lineHeight: 1.3,
        margin: [0, 3, 0, 0],
      });
    }

    // Shop address + footer text
    const footerLines: string[] = [];
    if (d.address) footerLines.push(d.address);
    if (d.receiptFooterText) footerLines.push(d.receiptFooterText);
    if (footerLines.length > 0) {
      content.push({
        text: footerLines.join('\n'),
        fontSize: 7,
        alignment: 'center',
        color: '#666',
        lineHeight: 1.3,
        margin: [0, 2, 0, 0],
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

    // Table header
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
          {},
          {},
          {},
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
          {},
          {},
          {},
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
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: w,
          y2: 0,
          lineWidth: 1.2,
          lineColor: '#333',
        },
      ],
      margin: [0, 4, 0, 4],
    };
  }

  private thinLine(w: number): object {
    return {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: w,
          y2: 0,
          dash: { length: 3, space: 2 },
          lineColor: '#aaa',
        },
      ],
      margin: [0, 4, 0, 4],
    };
  }

  private infoRow(
    label1: string,
    value1: string,
    label2?: string,
    value2?: string,
  ): object {
    const labelValue = (label: string, value: string) => ({
      text: [
        { text: `${label}: `, bold: true, fontSize: 8 },
        { text: value, fontSize: 8 },
      ],
    });

    if (label2 && value2) {
      return {
        columns: [
          { ...labelValue(label1, value1), width: '*' },
          { ...labelValue(label2, value2), width: 'auto' },
        ],
        margin: [0, 1, 0, 1],
      };
    }
    return {
      ...labelValue(label1, value1),
      margin: [0, 3, 0, 3],
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
    return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return phone;
  }

  private formatTaxId(taxId: string): string {
    const digits = taxId.replace(/\D/g, '');
    if (digits.length === 13) {
      return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits[12]}`;
    }
    return taxId;
  }
}
