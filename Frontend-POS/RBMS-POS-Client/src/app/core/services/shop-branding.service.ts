import { DestroyRef, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { ShopSettingsService } from '@app/core/api/services';

@Injectable({
  providedIn: 'root',
})
export class ShopBrandingService {
  readonly shopName = signal<string>('RBMS POS');
  readonly shopNameThai = signal<string>('');
  readonly logoUrl = signal<string>('images/RBMS_Logo.png');
  readonly hasCustomLogo = signal(false);
  readonly hasTwoPeriods = signal(false);

  private loaded = false;

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly destroyRef: DestroyRef,
    private readonly shopSettingsService: ShopSettingsService,
  ) {}

  load(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.shopSettingsService
      .shopSettingsGetBrandingGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.result;
          if (data?.shopNameEnglish) {
            this.shopName.set(data.shopNameEnglish);
          }
          if (data?.shopNameThai) {
            this.shopNameThai.set(data.shopNameThai);
          }
          if (data?.logoFileId) {
            this.logoUrl.set(`${this.apiConfig.rootUrl}/api/admin/file/${data.logoFileId}`);
            this.hasCustomLogo.set(true);
          } else {
            this.hasCustomLogo.set(false);
          }
          this.hasTwoPeriods.set(data?.hasTwoPeriods ?? false);
        },
      });
  }

  refresh(): void {
    this.loaded = false;
    this.load();
  }
}
