import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CalendarService } from '../../core/services/calendar.service';
import { CalendarEntry, CelebrationType } from '../../core/models';

interface MonthGroup {
  label: string;
  entries: CalendarEntry[];
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Calendario</h1>
        <div class="nav-buttons">
          <button mat-icon-button (click)="prevMonth()" title="Mes anterior">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="month-label">{{ monthLabel() }}</span>
          <button mat-icon-button (click)="nextMonth()" title="Mes siguiente">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      @if (groups().length === 0) {
        <mat-card>
          <mat-card-content class="empty-state">
            <mat-icon>event_busy</mat-icon>
            <p>No hay celebraciones confirmadas en este período.</p>
          </mat-card-content>
        </mat-card>
      }

      @for (group of groups(); track group.label) {
        <div class="month-section">
          <h2 class="month-heading">{{ group.label }}</h2>
          @for (entry of group.entries; track entry.celebrationId) {
            <mat-card class="entry-card" [routerLink]="['/celebrations', entry.celebrationId]">
              <mat-card-content>
                <div class="entry-row">
                  <div class="entry-date">
                    <span class="day">{{ entry.scheduledAt | date:'d' }}</span>
                    <span class="weekday">{{ entry.scheduledAt | date:'EEE' }}</span>
                  </div>
                  <div class="entry-icon" [style.color]="typeColor(entry.type)">
                    <mat-icon>{{ typeIcon(entry.type) }}</mat-icon>
                  </div>
                  <div class="entry-info">
                    <span class="entry-type">{{ typeLabel(entry.type) }}</span>
                    <span class="entry-time">{{ entry.scheduledAt | date:'HH:mm' }}</span>
                    @if (entry.locationName) {
                      <span class="entry-location">
                        <mat-icon class="inline-icon">location_on</mat-icon>
                        {{ entry.locationName }}
                      </span>
                    }
                    @if (entry.presidingPriestName) {
                      <span class="entry-priest">
                        <mat-icon class="inline-icon">person</mat-icon>
                        {{ entry.presidingPriestName }}
                      </span>
                    }
                  </div>
                  <mat-icon class="entry-arrow">chevron_right</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-title { margin: 0; font-size: 1.6rem; font-weight: 500; }
    .nav-buttons { display: flex; align-items: center; gap: 8px; }
    .month-label { font-size: 1rem; font-weight: 500; min-width: 160px; text-align: center; }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--mat-sys-on-surface-variant); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

    .month-section { margin-bottom: 28px; }
    .month-heading { font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mat-sys-on-surface-variant); margin: 0 0 12px; }

    .entry-card { margin-bottom: 8px; cursor: pointer; transition: box-shadow 0.15s; }
    .entry-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .entry-row { display: flex; align-items: center; gap: 16px; }

    .entry-date { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
    .day { font-size: 1.5rem; font-weight: 700; line-height: 1; }
    .weekday { font-size: 0.75rem; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }

    .entry-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }

    .entry-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .entry-type { font-weight: 600; font-size: 1rem; }
    .entry-time { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
    .entry-location, .entry-priest { font-size: 0.82rem; color: var(--mat-sys-on-surface-variant); display: flex; align-items: center; gap: 2px; }
    .inline-icon { font-size: 14px; width: 14px; height: 14px; }

    .entry-arrow { color: var(--mat-sys-on-surface-variant); margin-left: auto; }
  `]
})
export class CalendarPageComponent implements OnInit {
  private readonly entries = signal<CalendarEntry[]>([]);
  readonly currentDate = signal(new Date());

  readonly monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('es', { month: 'long', year: 'numeric' })
             .replace(/^./, c => c.toUpperCase());
  });

  readonly groups = computed<MonthGroup[]>(() => {
    const all = this.entries();
    if (all.length === 0) return [];

    const map = new Map<string, CalendarEntry[]>();
    for (const e of all) {
      const key = new Date(e.scheduledAt).toLocaleDateString('es', { month: 'long', year: 'numeric' });
      const label = key.replace(/^./, c => c.toUpperCase());
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(e);
    }
    return [...map.entries()].map(([label, entries]) => ({ label, entries }));
  });

  constructor(private svc: CalendarService) {}

  ngOnInit() { this.load(); }

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
    this.load();
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
    this.load();
  }

  private load() {
    const d = this.currentDate();
    const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10) + 'T00:00:00';
    const to   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10) + 'T23:59:59';
    this.svc.findUpcoming(from, to).subscribe({ next: data => this.entries.set(data) });
  }

  typeIcon(t: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: 'church', BAPTISM: 'water_drop', WEDDING: 'favorite', FUNERAL: 'person', CONFIRMATION: 'how_to_reg', FIRST_COMMUNION: 'star' };
    return m[t] ?? 'event';
  }
  typeLabel(t: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: 'Misa', BAPTISM: 'Bautizo', WEDDING: 'Boda', FUNERAL: 'Funeral', CONFIRMATION: 'Confirmación', FIRST_COMMUNION: 'Primera Comunión' };
    return m[t] ?? t;
  }
  typeColor(t: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: '#1976d2', BAPTISM: '#0097a7', WEDDING: '#e91e63', FUNERAL: '#616161', CONFIRMATION: '#7b1fa2', FIRST_COMMUNION: '#f57c00' };
    return m[t] ?? '#666';
  }
}
