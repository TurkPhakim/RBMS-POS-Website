import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { PositionsService } from '@app/core/api/services';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-position-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PositionDropdownComponent),
      multi: true,
    },
  ],
})
export class PositionDropdownComponent
  extends DropdownBaseComponent
  implements OnInit
{
  constructor(private readonly positionsService: PositionsService) {
    super();
    this.placeholder = 'ตำแหน่ง';
  }

  override ngOnInit(): void {
    this.positionsService
      .positionsGetPositionDropdownGet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.options = (response.results ?? []).map((item) => ({
            value: item.positionId,
            label: item.positionName,
          }));
        },
      });

    super.ngOnInit();
  }
}
