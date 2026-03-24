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
  selector: 'app-table-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableDropdownComponent),
      multi: true,
    },
  ],
})
export class TableDropdownComponent
  extends DropdownBaseComponent
  implements OnInit, OnChanges
{
  @Input() zoneId: number | null = null;

  constructor(private readonly tablesService: TablesService) {
    super();
    this.placeholder = 'โต๊ะที่นั่ง';
    this.showClear = true;
    this.filter = false;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['zoneId'] && !changes['zoneId'].firstChange) {
      this.loadOptions();
    }
  }

  private loadOptions(): void {
    this.tablesService
      .tablesGetTablesGet({
        zoneId: this.zoneId ?? undefined,
        ItemPerPage: 999,
      })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.options = (res.results ?? []).map((table) => ({
            value: table.tableId,
            label: table.tableName,
          }));
        },
      });
  }
}
