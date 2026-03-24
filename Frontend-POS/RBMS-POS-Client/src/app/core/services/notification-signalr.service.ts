import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';
import { NotificationResponseModel } from '@app/core/api/models';
import { AuthService } from './auth.service';
import { NotiStoreService } from './noti-store.service';

@Injectable({ providedIn: 'root' })
export class NotificationSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private started = false;

  constructor(
    private readonly authService: AuthService,
    private readonly notiStore: NotiStoreService,
  ) {}

  async connect(): Promise<void> {
    if (this.started) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/notification`, {
        accessTokenFactory: () => this.authService.getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on(
      'ReceiveNotification',
      (noti: NotificationResponseModel) => {
        this.notiStore.addNotification(noti);
      },
    );

    this.hubConnection.onreconnected(() => {
      this.notiStore.loadNotifications();
    });

    try {
      await this.hubConnection.start();
      this.started = true;
      this.notiStore.loadNotifications();
    } catch (err) {
      console.error('Notification SignalR connection failed:', err);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.hubConnection || !this.started) return;

    try {
      await this.hubConnection.stop();
    } catch {
      // ignore errors on stop
    }
    this.started = false;
    this.hubConnection = null;
  }
}
