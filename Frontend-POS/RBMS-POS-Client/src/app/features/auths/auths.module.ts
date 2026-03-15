import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';

import { SharedModule } from '@app/shared/shared.module';

import { AuthsRoutingModule } from './auths-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordDialogComponent } from './dialogs/forgot-password-dialog/forgot-password-dialog.component';
import { VerifyOtpDialogComponent } from './dialogs/verify-otp-dialog/verify-otp-dialog.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordDialogComponent,
    VerifyOtpDialogComponent,
    ResetPasswordComponent,
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RecaptchaModule,
    AuthsRoutingModule
  ]
})
export class AuthsModule { }
