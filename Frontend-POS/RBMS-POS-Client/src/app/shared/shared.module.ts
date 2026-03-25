import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatePickerModule } from 'primeng-buddhist-year-datepicker';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ImageModule } from 'primeng/image';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import { AuditFooterComponent } from './cards/audit-footer/audit-footer.component';
import { CardTemplateComponent } from './cards/card-template/card-template.component';
import { GradientCardComponent } from './cards/gradient-card/gradient-card.component';
import { EmptyViewComponent } from './cards/empty-view/empty-view.component';
import { ImageUploadCardComponent } from './cards/image-upload-card/image-upload-card.component';
import { SectionCardComponent } from './cards/section-card/section-card.component';
import { SectionMiniCardComponent } from './cards/section-mini-card/section-mini-card.component';
import { FieldErrorComponent } from './cards/field-error/field-error.component';
import { GenericIconComponent } from './components/generic-icon/generic-icon.component';
import { PinKeypadComponent } from './components/pin-keypad/pin-keypad.component';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { HeaderComponent } from './components/header/header.component';
import { NotificationDrawerComponent } from './components/notification-drawer/notification-drawer.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { TopBreadcrumbComponent } from './components/top-breadcrumb/top-breadcrumb.component';
import { DatePickerIconDirective } from './directives/datepicker-icon.directive';
import { ActiveStatusDropdownComponent } from './dropdowns/active-status-dropdown/active-status-dropdown.component';
import { AddressTypeDropdownComponent } from './dropdowns/address-type-dropdown/address-type-dropdown.component';
import { DropdownBaseComponent } from './dropdowns/dropdown-base/dropdown-base.component';
import { GenderDropdownComponent } from './dropdowns/gender-dropdown/gender-dropdown.component';
import { MenuCategoryDropdownComponent } from './dropdowns/menu-category-dropdown/menu-category-dropdown.component';
import { NationalityDropdownComponent } from './dropdowns/nationality-dropdown/nationality-dropdown.component';
import { PositionDropdownComponent } from './dropdowns/position-dropdown/position-dropdown.component';
import { ReligionDropdownComponent } from './dropdowns/religion-dropdown/religion-dropdown.component';
import { ServiceChargeDropdownComponent } from './dropdowns/service-charge-dropdown/service-charge-dropdown.component';
import { TitleDropdownComponent } from './dropdowns/title-dropdown/title-dropdown.component';
import { AvailabilityStatusDropdownComponent } from './dropdowns/availability-status-dropdown/availability-status-dropdown.component';
import { PeriodDropdownComponent } from './dropdowns/period-dropdown/period-dropdown.component';
import { SubCategoryDropdownComponent } from './dropdowns/sub-category-dropdown/sub-category-dropdown.component';
import { UserStatusDropdownComponent } from './dropdowns/user-status-dropdown/user-status-dropdown.component';
import { NotificationTableDropdownComponent } from './dropdowns/notification-table-dropdown/notification-table-dropdown.component';
import { OrderStatusDropdownComponent } from './dropdowns/order-status-dropdown/order-status-dropdown.component';
import { TableDropdownComponent } from './dropdowns/table-dropdown/table-dropdown.component';
import { ZoneDropdownComponent } from './dropdowns/zone-dropdown/zone-dropdown.component';
import { TableStatusDropdownComponent } from './dropdowns/table-status-dropdown/table-status-dropdown.component';
import { ReservationStatusDropdownComponent } from './dropdowns/reservation-status-dropdown/reservation-status-dropdown.component';
import { ShiftPeriodDropdownComponent } from './dropdowns/shift-period-dropdown/shift-period-dropdown.component';
import { TableSizeDropdownComponent } from './dropdowns/table-size-dropdown/table-size-dropdown.component';
import { FloorObjectTypeDropdownComponent } from './dropdowns/floor-object-type-dropdown/floor-object-type-dropdown.component';
import { AvailableTableDropdownComponent } from './dropdowns/available-table-dropdown/available-table-dropdown.component';
import { AddressDialogComponent } from './dialogs/address-dialog/address-dialog.component';
import { EducationDialogComponent } from './dialogs/education-dialog/education-dialog.component';
import { WorkHistoryDialogComponent } from './dialogs/work-history-dialog/work-history-dialog.component';
import { CancelModalComponent } from './modals/cancel-modal/cancel-modal.component';
import { InfoModalComponent } from './modals/info-modal/info-modal.component';
import { SessionTimeoutComponent } from './dialogs/session-timeout/session-timeout.component';
import { SuccessModalComponent } from './modals/success-modal/success-modal.component';
import { VerifyPasswordDialogComponent } from './dialogs/verify-password/verify-password.component';
import { VerifyPinDialogComponent } from './dialogs/verify-pin/verify-pin-dialog.component';
import { ChangePasswordDialogComponent } from './dialogs/change-password/change-password-dialog.component';
import { SplitBillDialogComponent } from './dialogs/split-bill-dialog/split-bill-dialog.component';
import { KpiCardComponent } from '../features/dashboard/components/kpi-card/kpi-card.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { FormatPhonePipe } from './pipes/mask-phone.pipe';
import { NationalIdMaskPipe } from './pipes/national-id-mask.pipe';

const PRIMENG_MODULES = [
  ButtonModule,
  InputTextModule,
  InputMaskModule,
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
  FileUploadModule,
  IconFieldModule,
  InputIconModule,
  ImageModule,
  InputGroup,
  InputGroupAddon,
  ChipModule,
  TooltipModule,
  AvatarModule,
  BreadcrumbModule,
  TieredMenuModule,
  InputSwitchModule,
  Textarea,
  DynamicDialogModule,
  DatePickerModule,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  RadioButton,
  CheckboxModule,
];

@NgModule({
  declarations: [
    SideBarComponent,
    HeaderComponent,
    TopBreadcrumbComponent,
    WelcomeComponent,
    NationalIdMaskPipe,
    InfoModalComponent,
    CancelModalComponent,
    SuccessModalComponent,
    SessionTimeoutComponent,
    VerifyPasswordDialogComponent,
    VerifyPinDialogComponent,
    ChangePasswordDialogComponent,
    GenericIconComponent,
    PinKeypadComponent,
    AccessDeniedComponent,
    GlobalLoadingComponent,
    NotificationDrawerComponent,
    DropdownBaseComponent,
    GenderDropdownComponent,
    MenuCategoryDropdownComponent,
    PositionDropdownComponent,
    TitleDropdownComponent,
    NationalityDropdownComponent,
    ReligionDropdownComponent,
    ServiceChargeDropdownComponent,
    ActiveStatusDropdownComponent,
    AddressTypeDropdownComponent,
    UserStatusDropdownComponent,
    AvailabilityStatusDropdownComponent,
    PeriodDropdownComponent,
    SubCategoryDropdownComponent,
    NotificationTableDropdownComponent,
    OrderStatusDropdownComponent,
    TableDropdownComponent,
    ZoneDropdownComponent,
    TableStatusDropdownComponent,
    ReservationStatusDropdownComponent,
    ShiftPeriodDropdownComponent,
    TableSizeDropdownComponent,
    FloorObjectTypeDropdownComponent,
    AvailableTableDropdownComponent,
    DatePickerIconDirective,
    DateFormatPipe,
    FormatPhonePipe,
    FieldErrorComponent,
    AddressDialogComponent,
    EducationDialogComponent,
    WorkHistoryDialogComponent,
    CardTemplateComponent,
    GradientCardComponent,
    SectionCardComponent,
    EmptyViewComponent,
    ImageUploadCardComponent,
    AuditFooterComponent,
    SplitBillDialogComponent,
    KpiCardComponent,
    SectionMiniCardComponent,
  ],
  imports: [
    ...PRIMENG_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    LottieComponent,
  ],
  exports: [
    ...PRIMENG_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    SideBarComponent,
    HeaderComponent,
    TopBreadcrumbComponent,
    WelcomeComponent,
    NationalIdMaskPipe,
    GenericIconComponent,
    PinKeypadComponent,
    AccessDeniedComponent,
    GlobalLoadingComponent,
    NotificationDrawerComponent,
    DropdownBaseComponent,
    GenderDropdownComponent,
    MenuCategoryDropdownComponent,
    PositionDropdownComponent,
    TitleDropdownComponent,
    NationalityDropdownComponent,
    ReligionDropdownComponent,
    ServiceChargeDropdownComponent,
    ActiveStatusDropdownComponent,
    AddressTypeDropdownComponent,
    UserStatusDropdownComponent,
    AvailabilityStatusDropdownComponent,
    PeriodDropdownComponent,
    SubCategoryDropdownComponent,
    NotificationTableDropdownComponent,
    OrderStatusDropdownComponent,
    TableDropdownComponent,
    ZoneDropdownComponent,
    TableStatusDropdownComponent,
    ReservationStatusDropdownComponent,
    ShiftPeriodDropdownComponent,
    TableSizeDropdownComponent,
    FloorObjectTypeDropdownComponent,
    AvailableTableDropdownComponent,
    DatePickerIconDirective,
    DateFormatPipe,
    FormatPhonePipe,
    FieldErrorComponent,
    AddressDialogComponent,
    EducationDialogComponent,
    WorkHistoryDialogComponent,
    CardTemplateComponent,
    GradientCardComponent,
    SectionCardComponent,
    EmptyViewComponent,
    ImageUploadCardComponent,
    AuditFooterComponent,
    KpiCardComponent,
    SectionMiniCardComponent,
    LottieComponent,
  ],
  providers: [
    DialogService,
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
})
export class SharedModule {}
