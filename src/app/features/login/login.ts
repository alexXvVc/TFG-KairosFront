import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>church</mat-icon>
          <mat-card-title>Kairos</mat-card-title>
          <mat-card-subtitle>Gestión de celebraciones parroquiales</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required')) {
                <mat-error>El correo es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required')) {
                <mat-error>La contraseña es obligatoria</mat-error>
              }
            </mat-form-field>

            @if (errorMsg()) {
              <p class="error-msg">{{ errorMsg() }}</p>
            }

            <button mat-flat-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Entrar
              }
            </button>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--mat-sys-surface-container-lowest);
    }
    .login-card { width: 380px; padding: 16px; }
    mat-card-avatar { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 44px; }
    .error-msg { color: var(--mat-sys-error); font-size: 0.85rem; margin: 4px 0; }
    mat-spinner { display: inline-block; }
  `]
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly errorMsg = signal('');
  readonly showPassword = signal(false);

  readonly form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 401 ? 'Credenciales incorrectas' : 'Error de conexión. Inténtelo de nuevo.'
        );
      },
    });
  }
}
