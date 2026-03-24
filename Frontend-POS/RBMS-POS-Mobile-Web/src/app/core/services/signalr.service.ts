import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';
import { CustomerAuthService } from './customer-auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentGroup: string | null = null;

  /** Emits whenever the server tells this table to refresh order data */
  refreshOrders = signal(0);

  constructor(private customerAuth: CustomerAuthService) {}

  async connect(): Promise<void> {
    if (this.connection) return;

    const token = this.customerAuth.getToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/order`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // Listen for events that should trigger a refresh
    this.connection.on('RefreshOrders', () => {
      this.refreshOrders.update(v => v + 1);
    });

    this.connection.on('NewOrderItems', () => {
      this.refreshOrders.update(v => v + 1);
    });

    this.connection.on('ItemStatusChanged', () => {
      this.refreshOrders.update(v => v + 1);
    });

    this.connection.on('BillPrepared', () => {
      this.refreshOrders.update(v => v + 1);
    });

    this.connection.on('PaymentCompleted', () => {
      this.refreshOrders.update(v => v + 1);
    });

    try {
      await this.connection.start();

      // Join table group
      const session = this.customerAuth.getSession();
      if (session) {
        this.currentGroup = `table_${session.tableId}`;
        await this.connection.invoke('JoinGroup', this.currentGroup);
      }
    } catch {
      this.connection = null;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    if (this.currentGroup) {
      try {
        await this.connection.invoke('LeaveGroup', this.currentGroup);
      } catch { /* ignore */ }
      this.currentGroup = null;
    }

    await this.connection.stop();
    this.connection = null;
  }
}
