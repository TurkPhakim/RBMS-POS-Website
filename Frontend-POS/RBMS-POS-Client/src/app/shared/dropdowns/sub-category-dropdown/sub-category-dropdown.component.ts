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
import { MenuCategoriesService } from '@app/core/api/services/menu-categories.service';
import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-sub-category-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SubCategoryDropdownComponent),
      multi: true,
    },
  ],
})
export class SubCategoryDropdownComponent
  extends DropdownBaseComponent
  implements OnInit, OnChanges
{
  @Input() categoryType: number | null = null;

  constructor(private readonly menuCategoriesService: MenuCategoriesService) {
    super();
    this.placeholder = 'หมวดหมู่เมนูย่อย';
    this.showClear = true;
    this.filter = false;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryType'] && !changes['categoryType'].firstChange) {
      this.selectedValue = null;
      this.onValueChange(null);
      this.loadOptions();
    }
  }

  private loadOptions(): void {
    if (!this.categoryType) {
      this.options = [];
      return;
    }
    this.menuCategoriesService
      .menuCategoriesGetSubCategoriesGet({
        categoryType: this.categoryType,
        ItemPerPage: 100,
      })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.options = (res.results ?? []).map((sc) => ({
            value: sc.subCategoryId,
            label: sc.name,
          }));
        },
      });
  }
}
