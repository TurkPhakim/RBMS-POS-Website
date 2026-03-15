import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { ServiceChargesService } from '@app/core/api/services';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-service-charge-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ServiceChargeDropdownComponent),
      multi: true,
    },
  ],
})
export class ServiceChargeDropdownComponent
  extends DropdownBaseComponent
  implements OnInit
{
  constructor(private readonly serviceChargesService: ServiceChargesService) {
    super();
    this.placeholder = 'เลือก Service Charge';
  }

  override ngOnInit(): void {
    this.serviceChargesService
      .serviceChargesGetDropdownListGet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.options = (response.results ?? []).map((item) => ({
            value: item.value,
            label: item.label,
          }));
        },
      });

    super.ngOnInit();
  }
}
