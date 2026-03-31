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
  private connectingPromise: Promise<void> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly notiStore: NotiStoreService,
  ) {}

  async connect(): Promise<void> {
    if (this.started) return;
    if (this.connectingPromise) {
      await this.connectingPromise;
      return;
    }

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

    this.hubConnection.onclose(() => {
      this.started = false;
      this.hubConnection = null;
      this.connectingPromise = null;
    });

    this.connectingPromise = this.hubConnection.start();
    try {
      await this.connectingPromise;
      this.started = true;
      this.notiStore.loadNotifications();
    } catch (err) {
      console.error('Notification SignalR connection failed:', err);
      this.hubConnection = null;
      this.connectingPromise = null;
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
