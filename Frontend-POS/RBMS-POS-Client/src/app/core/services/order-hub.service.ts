import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderHubService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;
  private started = false;
  private connectingPromise: Promise<void> | null = null;
  private joinedGroups = new Set<string>();

  readonly tableStatusChanged$ = new Subject<{
    tableId: number;
    status: string;
  }>();
  readonly newOrderItems$ = new Subject<{ orderId: number; tableId: number }>();
  readonly itemStatusChanged$ = new Subject<{
    orderId: number;
    orderItemId: number;
    status: string;
  }>();
  readonly itemCancelled$ = new Subject<{
    orderId: number;
    orderItemId: number;
  }>();
  readonly orderUpdated$ = new Subject<{
    orderId: number;
    status: string;
  }>();
  readonly paymentCompleted$ = new Subject<{
    tableId: number;
    orderBillId: number;
  }>();
  readonly slipUploaded$ = new Subject<{
    tableId: number;
    orderBillId: number;
  }>();

  async start(group: 'floor' | 'kitchen'): Promise<void> {
    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/hubs/order`)
        .withAutomaticReconnect()
        .build();

      this.registerListeners();

      // Rejoin groups หลัง reconnect (SignalR ไม่ auto-rejoin groups)
      this.hubConnection.onreconnected(async () => {
        for (const group of this.joinedGroups) {
          try {
            await this.hubConnection!.invoke('JoinGroup', group);
          } catch {
            // ignore
          }
        }
      });

      // Reset state เมื่อ connection ตายถาวร (reconnect ล้มเหลวทั้งหมด)
      this.hubConnection.onclose(() => {
        this.started = false;
        this.hubConnection = null;
        this.connectingPromise = null;
        this.joinedGroups.clear();
      });

      this.connectingPromise = this.hubConnection.start();
      try {
        await this.connectingPromise;
        this.started = true;
      } catch (err) {
        console.error('SignalR connection failed:', err);
        this.hubConnection = null;
        this.connectingPromise = null;
        return;
      }
    } else if (this.connectingPromise) {
      // รอ connection ที่กำลังสร้างอยู่ให้เสร็จก่อน
      await this.connectingPromise;
    }

    if (!this.started) return;

    if (!this.joinedGroups.has(group)) {
      try {
        await this.hubConnection!.invoke('JoinGroup', group);
        this.joinedGroups.add(group);
      } catch (err) {
        console.error(`Failed to join group ${group}:`, err);
      }
    }
  }

  async leaveGroup(group: string): Promise<void> {
    // ลบจาก joinedGroups ทันทีก่อน async invoke
    // ป้องกัน race condition: start() อาจถูกเรียกก่อน invoke เสร็จ
    // แล้วเห็นว่า group ยังอยู่ → ข้าม JoinGroup
    this.joinedGroups.delete(group);
    if (!this.hubConnection || !this.started) return;

    try {
      await this.hubConnection.invoke('LeaveGroup', group);
    } catch {
      // ignore errors on leave
    }
  }

  private registerListeners(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on(
      'TableStatusChanged',
      (data: { tableId: number; status: string }) => {
        this.tableStatusChanged$.next(data);
      },
    );

    this.hubConnection.on(
      'NewOrderItems',
      (data: { orderId: number; tableId: number }) => {
        this.newOrderItems$.next(data);
      },
    );

    this.hubConnection.on(
      'ItemStatusChanged',
      (data: { orderId: number; orderItemId: number; status: string }) => {
        this.itemStatusChanged$.next(data);
      },
    );

    this.hubConnection.on(
      'ItemCancelled',
      (data: { orderId: number; orderItemId: number }) => {
        this.itemCancelled$.next(data);
      },
    );

    this.hubConnection.on(
      'OrderUpdated',
      (data: { orderId: number; status: string }) => {
        this.orderUpdated$.next(data);
      },
    );

    this.hubConnection.on(
      'PaymentCompleted',
      (data: { tableId: number; orderBillId: number }) => {
        this.paymentCompleted$.next(data);
      },
    );

    this.hubConnection.on(
      'SlipUploaded',
      (data: { tableId: number; orderBillId: number }) => {
        this.slipUploaded$.next(data);
      },
    );
  }

  async stop(): Promise<void> {
    if (!this.hubConnection || !this.started) return;

    for (const group of this.joinedGroups) {
      try {
        await this.hubConnection.invoke('LeaveGroup', group);
      } catch {
        // ignore
      }
    }
    this.joinedGroups.clear();
    await this.stopConnection();
  }

  private async stopConnection(): Promise<void> {
    try {
      await this.hubConnection?.stop();
    } catch {
      // ignore errors on stop
    }
    this.started = false;
    this.hubConnection = null;
  }

  ngOnDestroy(): void {
    this.stop();
    this.tableStatusChanged$.complete();
    this.newOrderItems$.complete();
    this.itemStatusChanged$.complete();
    this.itemCancelled$.complete();
    this.orderUpdated$.complete();
    this.paymentCompleted$.complete();
    this.slipUploaded$.complete();
  }
}
