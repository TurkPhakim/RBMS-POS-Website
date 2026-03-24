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
  private joinedGroups = new Set<string>();

  readonly tableStatusChanged$ = new Subject<{ tableId: number; status: string }>();
  readonly newOrderItems$ = new Subject<{ orderId: number; tableId: number }>();
  readonly itemStatusChanged$ = new Subject<{ orderId: number; orderItemId: number; status: string }>();
  readonly itemCancelled$ = new Subject<{ orderId: number; orderItemId: number }>();

  async start(group: 'floor' | 'kitchen'): Promise<void> {
    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/hubs/order`)
        .withAutomaticReconnect()
        .build();

      this.registerListeners();

      try {
        await this.hubConnection.start();
        this.started = true;
      } catch (err) {
        console.error('SignalR connection failed:', err);
        return;
      }
    }

    if (!this.joinedGroups.has(group)) {
      try {
        await this.hubConnection.invoke('JoinGroup', group);
        this.joinedGroups.add(group);
      } catch (err) {
        console.error(`Failed to join group ${group}:`, err);
      }
    }
  }

  async leaveGroup(group: string): Promise<void> {
    if (!this.hubConnection || !this.started || !this.joinedGroups.has(group)) return;

    try {
      await this.hubConnection.invoke('LeaveGroup', group);
      this.joinedGroups.delete(group);
    } catch {
      // ignore errors on leave
    }

    if (this.joinedGroups.size === 0) {
      await this.stopConnection();
    }
  }

  private registerListeners(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('TableStatusChanged', (data: { tableId: number; status: string }) => {
      this.tableStatusChanged$.next(data);
    });

    this.hubConnection.on('NewOrderItems', (data: { orderId: number; tableId: number }) => {
      this.newOrderItems$.next(data);
    });

    this.hubConnection.on('ItemStatusChanged', (data: { orderId: number; orderItemId: number; status: string }) => {
      this.itemStatusChanged$.next(data);
    });

    this.hubConnection.on('ItemCancelled', (data: { orderId: number; orderItemId: number }) => {
      this.itemCancelled$.next(data);
    });
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
  }
}
