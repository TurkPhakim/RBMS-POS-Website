import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import {
  EDayOfWeek,
  MyProfileResponseModel,
  OperatingHourModel,
  UserModel,
  WelcomeShopInfoResponseModel,
} from '@app/core/api/models';
import { HumanResourceService } from '@app/core/api/services/human-resource.service';
import { ShopSettingsService } from '@app/core/api/services/shop-settings.service';
import { AuthService } from '@app/core/services/auth.service';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';
import { DAY_LABELS } from '@app/shared/component-interfaces';

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentUser = signal<UserModel | null>(null);
  myProfile = signal<MyProfileResponseModel | null>(null);
  shopInfo = signal<WelcomeShopInfoResponseModel | null>(null);
  currentTime = signal(new Date());
  isLoading = signal(true);
  activeTab = signal(0);
  private timeInterval: ReturnType<typeof setInterval> | null = null;

  greeting = computed(() => {
    const hour = this.currentTime().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  });

  displayName = computed(() => {
    const profile = this.myProfile();
    return (
      profile?.nickname ||
      this.currentUser()?.nickname ||
      this.currentUser()?.username ||
      'User'
    );
  });

  fullNameThai = computed(() => this.myProfile()?.fullNameThai || '');

  positionName = computed(
    () =>
      this.myProfile()?.positionName ||
      this.currentUser()?.positionName ||
      'User',
  );

  profileImageUrl = computed(() => {
    const fileId =
      this.myProfile()?.imageFileId || this.currentUser()?.profileImageFileId;
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  });

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    public readonly brandingService: ShopBrandingService,
    private readonly destroyRef: DestroyRef,
    private readonly humanResourceService: HumanResourceService,
    private readonly shopSettingsService: ShopSettingsService,
  ) {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.currentUser.set(user));
  }

  ngOnInit(): void {
    this.timeInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);

    this.loadWelcomeData();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  getDayName(day: EDayOfWeek): string {
    return DAY_LABELS[day] || '';
  }

  getTimeRange(hour: OperatingHourModel): string {
    if (!hour.isOpen) return '-';
    const p1 =
      hour.openTime1 && hour.closeTime1
        ? `${hour.openTime1} - ${hour.closeTime1}`
        : '';
    const p2 =
      hour.openTime2 && hour.closeTime2
        ? `${hour.openTime2} - ${hour.closeTime2}`
        : '';
    return p2 ? `${p1}, ${p2}` : p1 || '-';
  }

  private loadWelcomeData(): void {
    forkJoin({
      shopInfo: this.shopSettingsService.shopSettingsGetWelcomeShopInfoGet(),
      profile: this.humanResourceService.humanResourceGetMyProfileGet(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ shopInfo, profile }) => {
          this.shopInfo.set(shopInfo.result ?? null);
          this.myProfile.set(profile.result ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
}
