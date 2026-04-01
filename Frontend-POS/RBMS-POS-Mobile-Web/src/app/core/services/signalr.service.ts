import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';
import { CustomerAuthService } from './customer-auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentGroup: string | null = null;
  private visibilityHandler: (() => void) | null = null;

  /** Emits whenever the server tells this table to refresh order data */
  refreshOrders = signal(0);

  /** Emits when staff voids the bill */
  billVoided = signal(0);

  constructor(private customerAuth: CustomerAuthService) {}

  async connect(): Promise<void> {
    if (this.connection) return;

    const token = this.customerAuth.getToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/order`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets
          | signalR.HttpTransportType.ServerSentEvents
          | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000, 15000, 30000])
      .build();

    // Listen for events that should trigger a refresh
    this.connection.on('RefreshOrders', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('NewOrderItems', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('ItemStatusChanged', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('BillPrepared', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('PaymentCompleted', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('ItemCancelled', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('SlipUploaded', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('BillClaimed', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('BillReleased', () => {
      this.refreshOrders.update((v) => v + 1);
    });

    this.connection.on('BillVoided', () => {
      this.billVoided.update((v) => v + 1);
      this.refreshOrders.update((v) => v + 1);
    });

    // Rejoin group หลัง reconnect (SignalR ไม่ auto-rejoin groups)
    this.connection.onreconnected(async () => {
      console.log('[SignalR] Reconnected, rejoining group...');
      if (this.currentGroup) {
        try {
          await this.connection!.invoke('JoinGroup', this.currentGroup);
          console.log('[SignalR] Rejoined group:', this.currentGroup);
        } catch (err) {
          console.error('[SignalR] Failed to rejoin group:', err);
        }
      }
    });

    this.connection.onreconnecting(() => {
      console.warn('[SignalR] Reconnecting...');
    });

    // Reset state เมื่อ connection ตายถาวร (reconnect ล้มเหลวทั้งหมด)
    this.connection.onclose(() => {
      console.warn('[SignalR] Connection closed');
      this.connection = null;
      this.currentGroup = null;
    });

    // iOS Safari: reconnect เมื่อกลับมา active (WebSocket อาจถูก suspend)
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.connection?.state === signalR.HubConnectionState.Disconnected) {
        console.log('[SignalR] Page visible again, reconnecting...');
        this.connection = null;
        this.connect();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    try {
      await this.connection.start();
      console.log('[SignalR] Connected to hub');

      // Join table group
      const session = this.customerAuth.getSession();
      if (session) {
        this.currentGroup = `table_${session.tableId}`;
        await this.connection.invoke('JoinGroup', this.currentGroup);
        console.log('[SignalR] Joined group:', this.currentGroup);
      }
    } catch (err) {
      console.error('[SignalR] Connection failed:', err);
      this.connection = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (!this.connection) return;

    if (this.currentGroup) {
      try {
        await this.connection.invoke('LeaveGroup', this.currentGroup);
      } catch {
        /* ignore */
      }
      this.currentGroup = null;
    }

    await this.connection.stop();
    this.connection = null;
  }
}
