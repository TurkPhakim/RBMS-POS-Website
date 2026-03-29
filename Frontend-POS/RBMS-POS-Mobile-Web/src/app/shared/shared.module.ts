import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { DialogService } from 'primeng/dynamicdialog';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import { GenericIconComponent } from './components/generic-icon/generic-icon.component';
import { CardHeaderComponent } from './components/card-header/card-header.component';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { InfoModalComponent } from './modals/info-modal/info-modal.component';
import { CancelModalComponent } from './modals/cancel-modal/cancel-modal.component';
import { SuccessModalComponent } from './modals/success-modal/success-modal.component';
import { NicknameDialogComponent } from './dialogs/nickname-dialog/nickname-dialog.component';
import { DropdownBaseComponent } from './dropdowns/dropdown-base/dropdown-base.component';
import { SourceTableFilterDropdownComponent } from './dropdowns/source-table-filter-dropdown/source-table-filter-dropdown.component';
import { OrderedByFilterDropdownComponent } from './dropdowns/ordered-by-filter-dropdown/ordered-by-filter-dropdown.component';

const PRIMENG_MODULES = [
  ButtonModule,
  DialogModule,
  BadgeModule,
  TagModule,
  InputTextModule,
  RadioButtonModule,
  CheckboxModule,
  RippleModule,
  InputNumberModule,
  TextareaModule,
  ProgressSpinnerModule,
  SelectModule,
];

@NgModule({
  declarations: [
    GenericIconComponent,
    CardHeaderComponent,
    GlobalLoadingComponent,
    InfoModalComponent,
    CancelModalComponent,
    SuccessModalComponent,
    NicknameDialogComponent,
    DropdownBaseComponent,
    SourceTableFilterDropdownComponent,
    OrderedByFilterDropdownComponent,
  ],
  imports: [
    ...PRIMENG_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LottieComponent,
  ],
  exports: [
    ...PRIMENG_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GenericIconComponent,
    CardHeaderComponent,
    GlobalLoadingComponent,
    DropdownBaseComponent,
    SourceTableFilterDropdownComponent,
    OrderedByFilterDropdownComponent,
    LottieComponent,
  ],
  providers: [
    DialogService,
    provideLottieOptions({ player: () => import('lottie-web') }),
  ],
})
export class SharedModule {}
