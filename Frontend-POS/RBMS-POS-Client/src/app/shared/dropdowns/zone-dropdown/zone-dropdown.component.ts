import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { take, takeUntil } from 'rxjs';
import { ZonesService } from '@app/core/api/services/zones.service';
import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-zone-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZoneDropdownComponent),
      multi: true,
    },
  ],
})
export class ZoneDropdownComponent
  extends DropdownBaseComponent
  implements OnInit
{
  constructor(private readonly zonesService: ZonesService) {
    super();
    this.placeholder = 'โซนร้าน';
    this.showClear = true;
    this.filter = false;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  private loadOptions(): void {
    this.zonesService
      .zonesGetActiveZonesGet()
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.options = (res.results ?? []).map((zone) => ({
            value: zone.zoneId,
            label: zone.zoneName,
          }));
        },
      });
  }
}
