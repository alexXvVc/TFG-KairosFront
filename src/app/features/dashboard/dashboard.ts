import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { CalendarService } from '../../core/services/calendar.service';
import { CalendarEntry, CelebrationType } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Inicio</h1>

      <!-- Quick access cards -->
      <div class="quick-actions">
        @for (action of quickActions; track action.label) {
          <mat-card [routerLink]="action.route" class="action-card">
            <mat-card-content>
              <mat-icon>{{ action.icon }}</mat-icon>
              <span>{{ action.label }}</span>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Upcoming confirmed celebrations -->
      <mat-card class="upcoming-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>upcoming</mat-icon>
          <mat-card-title>Próximas celebraciones</mat-card-title>
          <mat-card-subtitle>Confirmadas en los próximos 30 días</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <p class="hint">Cargando…</p>
          } @else if (upcoming().length === 0) {
            <p class="hint">No hay celebraciones confirmadas próximamente.</p>
          } @else {
            <mat-list>
              @for (entry of upcoming(); track entry.celebrationId) {
                <mat-list-item>
                  <mat-icon matListItemIcon [style.color]="typeColor(entry.type)">
                    {{ typeIcon(entry.type) }}
                  </mat-icon>
                  <span matListItemTitle>
                    {{ typeLabel(entry.type) }}
                  </span>
                  <span matListItemLine>
                    {{ entry.scheduledAt | date:'EEE d MMM yyyy, HH:mm':'':'es' }}
                    · {{ entry.locationName }}
                    · {{ entry.presidingPriestName }}
                  </span>
                </mat-list-item>
              }
            </mat-list>
          }
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/calendar">Ver calendario completo</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-title { margin: 0 0 24px; font-size: 1.6rem; font-weight: 500; }

    .quick-actions {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .action-card {
      cursor: pointer; min-width: 140px; flex: 1;
      &:hover { box-shadow: var(--mat-sys-level3); }
      mat-card-content { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px; }
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--mat-sys-primary); }
      span { font-size: 0.9rem; }
    }
    .upcoming-card { margin-bottom: 24px; }
    .hint { color: var(--mat-sys-on-surface-variant); padding: 8px 0; }
  `]
})
export class DashboardComponent implements OnInit {
  readonly upcoming = signal<CalendarEntry[]>([]);
  readonly loading = signal(true);

  readonly quickActions = [
    { label: 'Celebraciones', icon: 'event',          route: '/celebrations' },
    { label: 'Registros',     icon: 'menu_book',      route: '/records' },
    { label: 'Personas',      icon: 'people',         route: '/persons' },
    { label: 'Calendario',    icon: 'calendar_month', route: '/calendar' },
  ];

  constructor(private calendarSvc: CalendarService) {}

  ngOnInit() {
    const now   = new Date();
    const later = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.calendarSvc.findUpcoming(now.toISOString().slice(0, 19), later.toISOString().slice(0, 19))
      .subscribe({
        next: entries => { this.upcoming.set(entries); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  typeIcon(type: CelebrationType): string {
    const map: Record<CelebrationType, string> = {
      MASS: 'volunteer_activism', BAPTISM: 'water_drop', WEDDING: 'favorite',
      FUNERAL: 'sentiment_neutral', CONFIRMATION: 'how_to_reg', FIRST_COMMUNION: 'star',
    };
    return map[type] ?? 'event';
  }

  typeLabel(type: CelebrationType): string {
    const map: Record<CelebrationType, string> = {
      MASS: 'Misa', BAPTISM: 'Bautizo', WEDDING: 'Boda',
      FUNERAL: 'Funeral', CONFIRMATION: 'Confirmación', FIRST_COMMUNION: 'Primera Comunión',
    };
    return map[type] ?? type;
  }

  typeColor(type: CelebrationType): string {
    const map: Record<CelebrationType, string> = {
      MASS: '#1976d2', BAPTISM: '#0097a7', WEDDING: '#e91e63',
      FUNERAL: '#616161', CONFIRMATION: '#7b1fa2', FIRST_COMMUNION: '#f57c00',
    };
    return map[type] ?? '#666';
  }
}
