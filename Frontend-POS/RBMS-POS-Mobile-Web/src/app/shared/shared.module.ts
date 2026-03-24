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
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';

import { GenericIconComponent } from './components/generic-icon/generic-icon.component';
import { CardHeaderComponent } from './components/card-header/card-header.component';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

const PRIMENG_MODULES = [
  ButtonModule,
  DialogModule,
  BadgeModule,
  TagModule,
  InputTextModule,
  RadioButtonModule,
  CheckboxModule,
  ToastModule,
  RippleModule,
  InputNumberModule,
  TextareaModule,
  ProgressSpinnerModule,
  TooltipModule,
];

@NgModule({
  declarations: [GenericIconComponent, CardHeaderComponent, GlobalLoadingComponent, ConfirmDialogComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES, LottieComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
    GenericIconComponent,
    CardHeaderComponent,
    ConfirmDialogComponent,
    GlobalLoadingComponent,
    LottieComponent,
  ],
  providers: [
    DialogService,
    MessageService,
    provideLottieOptions({ player: () => import('lottie-web') }),
  ],
})
export class SharedModule {}
