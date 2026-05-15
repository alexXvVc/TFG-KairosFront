import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">

      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <img src="logo.svg" alt="Kairos" class="brand-logo" />
          <span>Kairos</span>
        </div>

        <mat-nav-list>
          @for (item of visibleNav(); track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <span class="user-email">{{ auth.email() }}</span>
          <button mat-icon-button (click)="auth.logout()" title="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }

    .sidenav {
      width: 220px;
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-surface-container-low);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 20px 4px 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--mat-sys-primary);
    }
    .brand-logo { width: 104px; height: 104px; object-fit: contain; }

    .active-link { background: var(--mat-sys-secondary-container); border-radius: 8px; }

    .sidenav-footer {
      margin-top: auto;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .user-email { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }

    .main-content { background: var(--mat-sys-surface); }
  `]
})
export class ShellComponent {
  constructor(readonly auth: AuthService) {}

  private readonly nav: NavItem[] = [
    { label: 'Inicio',        icon: 'dashboard',     route: '/dashboard' },
    { label: 'Calendario',    icon: 'calendar_month', route: '/calendar' },
    { label: 'Celebraciones', icon: 'event',          route: '/celebrations' },
    { label: 'Registros',     icon: 'menu_book',      route: '/records' },
    { label: 'Personas',      icon: 'people',         route: '/persons' },
    { label: 'Ubicaciones',   icon: 'location_on',    route: '/locations', adminOnly: true },
  ];

  readonly visibleNav = computed(() =>
    this.nav.filter(n => !n.adminOnly || this.auth.isAdmin())
  );
}
