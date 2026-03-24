import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { OrderBillResponseModel } from '@app/core/api/models/order-bill-response-model';
import { OrdersService } from '@app/core/api/services/orders.service';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-cash-payment-dialog',
  standalone: false,
  templateUrl: './cash-payment-dialog.component.html',
})
export class CashPaymentDialogComponent implements OnInit {
  bills = signal<OrderBillResponseModel[]>([]);
  selectedBill = signal<OrderBillResponseModel | null>(null);
  isSaving = signal(false);
  form: FormGroup;
  changeAmount = signal(0);

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private modalService: ModalService,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group({
      amountReceived: [null, [Validators.required, Validators.min(0.01)]],
      note: [null],
    });
  }

  ngOnInit(): void {
    this.loadBills();
  }

  private loadBills(): void {
    const orderId = this.config.data.orderId;
    this.ordersService.ordersGetBillsGet({ orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const pendingBills = (res.result ?? []).filter(b => b.status === 'Pending');
          this.bills.set(pendingBills);
          if (pendingBills.length === 1) {
            this.selectBill(pendingBills[0]);
          }
        },
      });
  }

  selectBill(bill: OrderBillResponseModel): void {
    this.selectedBill.set(bill);
    this.form.patchValue({ amountReceived: null });
    this.changeAmount.set(0);
  }

  onAmountChange(): void {
    const bill = this.selectedBill();
    const received = this.form.get('amountReceived')?.value ?? 0;
    const due = bill?.grandTotal ?? 0;
    this.changeAmount.set(Math.max(0, received - due));
  }

  onPay(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    const bill = this.selectedBill();
    if (!bill) return;

    const amountReceived = this.form.get('amountReceived')?.value;
    if (amountReceived < (bill.grandTotal ?? 0)) {
      this.modalService.cancel({
        title: 'จำนวนเงินไม่พอ',
        message: `จำนวนเงินที่รับ (${amountReceived.toFixed(2)}) น้อยกว่ายอดบิล (${(bill.grandTotal ?? 0).toFixed(2)})`,
      });
      return;
    }

    this.isSaving.set(true);
    this.paymentsService.paymentsPayCashPost({
      body: {
        orderBillId: bill.orderBillId!,
        amountReceived,
        note: this.form.get('note')?.value,
      },
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => this.isSaving.set(false),
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
