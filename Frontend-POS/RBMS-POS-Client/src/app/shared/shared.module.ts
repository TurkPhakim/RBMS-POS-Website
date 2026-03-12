// src/app/shared/shared.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 2. PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { TabViewModule } from 'primeng/tabview';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Textarea } from 'primeng/textarea';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DatePickerModule } from 'primeng-buddhist-year-datepicker';

// 3. Shared components
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { HeaderComponent } from './components/header/header.component';
import { TopBreadcrumbComponent } from './components/top-breadcrumb/top-breadcrumb.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { NationalIdMaskPipe } from './pipes/national-id-mask.pipe';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { SuccessModalComponent } from './modals/success-modal/success-modal.component';
import { ErrorModalComponent } from './modals/error-modal/error-modal.component';
import { GenericIconComponent } from './components/generic-icon/generic-icon.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { NotificationPanelComponent } from './components/notification-panel/notification-panel.component';
import { PositionDropdownComponent } from './components/position-dropdown/position-dropdown.component';
import { DatePickerIconDirective } from './directives/datepicker-icon.directive';
import { DateFormatPipe } from './pipes/date-format.pipe';

const PRIMENG_MODULES = [
  ButtonModule,
  InputTextModule,
  InputNumberModule,
  DropdownModule,
  TableModule,
  CardModule,
  DialogModule,
  ToastModule,
  ConfirmDialogModule,
  MenuModule,
  BadgeModule,
  TagModule,
  ProgressSpinnerModule,
  FileUploadModule,
  ImageModule,
  TabViewModule,
  ChipModule,
  TooltipModule,
  AvatarModule,
  BreadcrumbModule,
  TieredMenuModule,
  InputSwitchModule,
  Textarea,
  DynamicDialogModule,
  DatePickerModule,
];

@NgModule({
  declarations: [
    SideBarComponent,
    HeaderComponent,
    TopBreadcrumbComponent,
    WelcomeComponent,
    NationalIdMaskPipe,
    ConfirmModalComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    GenericIconComponent,
    AccessDeniedComponent,
    GlobalLoadingComponent,
    NotificationPanelComponent,
    PositionDropdownComponent,
    DatePickerIconDirective,
    DateFormatPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...PRIMENG_MODULES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...PRIMENG_MODULES,
    SideBarComponent,
    HeaderComponent,
    TopBreadcrumbComponent,
    WelcomeComponent,
    NationalIdMaskPipe,
    ConfirmModalComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    GenericIconComponent,
    AccessDeniedComponent,
    GlobalLoadingComponent,
    NotificationPanelComponent,
    PositionDropdownComponent,
    DatePickerIconDirective,
    DateFormatPipe,
  ],
})
export class SharedModule {}
