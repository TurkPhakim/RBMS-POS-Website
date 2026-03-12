// 1. Angular core
import { Component, OnInit, DestroyRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// 2. API (generated)
import { AuthService } from '@app/core/api/services';
import { LoginRequestModel, LoginResponseModelBaseResponseModel } from '@app/core/api/models';

// 3. Core services
import { AuthService as AppAuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal('');
  successUsername = '';
  returnUrl = '/';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly appAuthService: AppAuthService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const { username, password } = this.loginForm.value;

    const loginRequest: LoginRequestModel = {
      username,
      password,
      rememberMe: false,
    };

    this.authService.apiAdminAuthLoginPost({ body: loginRequest })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          this.loading.set(false);

          if (err.status === 0) {
            this.errorMessage.set('Cannot connect to server. Please check your connection.');
          } else if (err.status === 401) {
            this.errorMessage.set(err.error?.error?.message || 'Invalid username or password');
          } else if (err.status === 423) {
            this.errorMessage.set(err.error?.error?.message || 'Account is locked');
          } else if (err.status === 403) {
            this.errorMessage.set('Account is disabled. Contact administrator');
          } else if (err.status >= 500) {
            this.errorMessage.set('Server error. Please try again later.');
          } else {
            this.errorMessage.set(err.error?.error?.message || 'An error occurred during login');
          }

          this.showErrorModal.set(true);
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (response: LoginResponseModelBaseResponseModel) => {
          this.loading.set(false);

          if (response.result) {
            localStorage.setItem('access_token', response.result.accessToken || '');
            localStorage.setItem('refresh_token', response.result.refreshToken || '');
            localStorage.setItem('current_user', JSON.stringify(response.result.user));

            this.appAuthService.updateAuthState();
            this.successUsername = response.result.user?.username || 'User';
            this.showSuccessModal.set(true);
          }
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal.set(false);
    this.router.navigate([this.returnUrl]);
  }

  onErrorModalClosed(): void {
    this.showErrorModal.set(false);
  }
}
