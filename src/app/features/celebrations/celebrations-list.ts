import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CelebrationService } from '../../core/services/celebration.service';
import { CelebrationResponse, CelebrationStatus, CelebrationType, Page } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-celebrations-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Celebraciones</h1>
        @if (auth.canWrite()) {
          <a mat-flat-button color="primary" routerLink="/celebrations/new">
            <mat-icon>add</mat-icon> Nueva celebración
          </a>
        }
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Desde</mat-label>
              <input matInput type="date" [formControl]="fromCtrl" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Hasta</mat-label>
              <input matInput type="date" [formControl]="toCtrl" />
            </mat-form-field>
            <button mat-flat-button (click)="load()">
              <mat-icon>search</mat-icon> Buscar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card>
        <mat-card-content class="table-card-content">
          <table mat-table [dataSource]="data().content" class="full-width">

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let c">
                <div class="type-cell">
                  <mat-icon [style.color]="typeColor(c.type)">{{ typeIcon(c.type) }}</mat-icon>
                  {{ typeLabel(c.type) }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="scheduledAt">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let c">{{ c.scheduledAt | date:'d MMM yyyy, HH:mm':'':'es' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let c">
                <span [class]="'status-badge status-' + c.status.toLowerCase()">
                  {{ statusLabel(c.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <a mat-icon-button [routerLink]="['/celebrations', c.id]" title="Ver detalle">
                  <mat-icon>chevron_right</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            @if (data().content.length === 0) {
              <tr class="no-data-row">
                <td [colSpan]="columns.length" class="no-data-cell">
                  No hay celebraciones en el período seleccionado.
                </td>
              </tr>
            }
          </table>

          <mat-paginator
            [length]="data().totalElements"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)" />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 1.6rem; font-weight: 500; }
    .filters-card { margin-bottom: 16px; }
    .filters-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .date-field { flex: 1; min-width: 140px; }
    .full-width { width: 100%; }
    .table-card-content { padding: 0; }
    .type-cell { display: flex; align-items: center; gap: 8px; }
    .no-data-cell { text-align: center; padding: 32px; color: var(--mat-sys-on-surface-variant); }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
    .status-draft     { color: #666; background: #eee; }
    .status-confirmed { color: #1565c0; background: #e3f2fd; }
    .status-completed { color: #2e7d32; background: #e8f5e9; }
    .status-cancelled { color: #c62828; background: #ffebee; }
  `]
})
export class CelebrationsListComponent implements OnInit {
  readonly columns = ['type', 'scheduledAt', 'status', 'actions'];
  readonly data = signal<Page<CelebrationResponse>>({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true });
  readonly pageIndex = signal(0);
  readonly pageSize = 20;

  readonly fromCtrl = new FormControl(this.defaultFrom());
  readonly toCtrl   = new FormControl(this.defaultTo());

  constructor(
    private svc: CelebrationService,
    readonly auth: AuthService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    const from = this.fromCtrl.value + 'T00:00:00';
    const to   = this.toCtrl.value   + 'T23:59:59';
    this.svc.findBetween(from, to, this.pageIndex(), this.pageSize).subscribe({
      next: page => this.data.set(page),
      error: () => this.snack.open('Error cargando celebraciones', 'OK', { duration: 3000 }),
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.load();
  }

  typeIcon(type: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: 'volunteer_activism', BAPTISM: 'water_drop', WEDDING: 'favorite', FUNERAL: 'sentiment_neutral', CONFIRMATION: 'how_to_reg', FIRST_COMMUNION: 'star' };
    return m[type] ?? 'event';
  }
  typeLabel(type: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: 'Misa', BAPTISM: 'Bautizo', WEDDING: 'Boda', FUNERAL: 'Funeral', CONFIRMATION: 'Confirmación', FIRST_COMMUNION: 'Primera Comunión' };
    return m[type] ?? type;
  }
  typeColor(type: CelebrationType): string {
    const m: Record<CelebrationType, string> = { MASS: '#1976d2', BAPTISM: '#0097a7', WEDDING: '#e91e63', FUNERAL: '#616161', CONFIRMATION: '#7b1fa2', FIRST_COMMUNION: '#f57c00' };
    return m[type] ?? '#666';
  }
  statusLabel(s: CelebrationStatus): string {
    const m: Record<CelebrationStatus, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmada', COMPLETED: 'Celebrada', CANCELLED: 'Cancelada' };
    return m[s] ?? s;
  }

  private defaultFrom(): string {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  }
  private defaultTo(): string {
    const d = new Date(); d.setMonth(d.getMonth() + 2); d.setDate(0);
    return d.toISOString().slice(0, 10);
  }
}
