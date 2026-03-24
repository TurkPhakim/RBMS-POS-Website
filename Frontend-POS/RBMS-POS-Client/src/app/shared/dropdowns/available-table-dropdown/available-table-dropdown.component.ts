import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { take, takeUntil } from 'rxjs';
import { TablesService } from '@app/core/api/services/tables.service';
import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-available-table-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvailableTableDropdownComponent),
      multi: true,
    },
  ],
})
export class AvailableTableDropdownComponent
  extends DropdownBaseComponent
  implements OnInit, OnChanges
{
  @Input() excludeTableId: number | null = null;

  constructor(private readonly tablesService: TablesService) {
    super();
    this.placeholder = 'เลือกโต๊ะที่ว่าง';
    this.showClear = true;
    this.filter = false;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['excludeTableId'] && !changes['excludeTableId'].firstChange) {
      this.loadOptions();
    }
  }

  private loadOptions(): void {
    this.tablesService
      .tablesGetTablesGet({ status: 'Available', ItemPerPage: 999 })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.options = (res.results ?? [])
            .filter((t) => t.tableId !== this.excludeTableId)
            .map((t) => ({
              value: t.tableId,
              label: `${t.tableName} (${t.zoneName}, ${t.capacity} ที่นั่ง)`,
            }));
        },
      });
  }
}
