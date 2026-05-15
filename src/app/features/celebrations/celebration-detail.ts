import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CelebrationService } from '../../core/services/celebration.service';
import { PersonService } from '../../core/services/person.service';
import { CelebrationResponse } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-celebration-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/celebrations">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">
          {{ c() ? typeLabel(c()!.type) : 'Cargando…' }}
        </h1>
        @if (c()) {
          <span [class]="'status-badge status-' + c()!.status.toLowerCase()">
            {{ statusLabel(c()!.status) }}
          </span>
        }
      </div>

      @if (c(); as cel) {
        <mat-card class="detail-card">
          <mat-card-content>
            <dl class="fields">
              <dt>Fecha</dt>
              <dd>{{ cel.scheduledAt | date:'EEEE d MMMM yyyy, HH:mm' }}</dd>

              <dt>Sacerdote</dt>
              <dd>{{ name(cel.presidingPriestId) }}</dd>

              @if (cel.intention)   { <dt>Intención</dt>   <dd>{{ cel.intention }}</dd> }
              @if (cel.childId)     { <dt>Bautizado</dt>   <dd>{{ name(cel.childId) }}</dd> }
              @if (cel.spouseAId)   { <dt>Cónyuge A</dt>   <dd>{{ name(cel.spouseAId) }}</dd> }
              @if (cel.spouseBId)   { <dt>Cónyuge B</dt>   <dd>{{ name(cel.spouseBId) }}</dd> }
              @if (cel.deceasedId)  { <dt>Difunto</dt>     <dd>{{ name(cel.deceasedId) }}</dd> }
              @if (cel.burialLocation) { <dt>Cementerio</dt> <dd>{{ cel.burialLocation }}</dd> }
              @if (cel.notes)       { <dt>Notas</dt>       <dd>{{ cel.notes }}</dd> }
            </dl>
          </mat-card-content>
        </mat-card>

        @if (auth.canWrite()) {
          <mat-card class="actions-card">
            <mat-card-header><mat-card-title>Acciones</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="action-buttons">

                @if (cel.status === 'DRAFT') {
                  <button mat-flat-button color="primary" (click)="confirm()">
                    <mat-icon>check_circle</mat-icon> Confirmar
                  </button>
                }

                @if (cel.status === 'CONFIRMED') {
                  <button mat-flat-button color="accent" (click)="complete()">
                    <mat-icon>task_alt</mat-icon> Marcar como celebrada
                  </button>
                }

                @if (cel.status !== 'COMPLETED' && cel.status !== 'CANCELLED') {
                  <button mat-stroked-button color="warn" (click)="showCancelForm.set(true)">
                    <mat-icon>cancel</mat-icon> Cancelar
                  </button>
                }

              </div>

              @if (showCancelForm()) {
                <div class="cancel-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Motivo de cancelación</mat-label>
                    <textarea matInput [formControl]="cancelReason" rows="3"></textarea>
                  </mat-form-field>
                  <div class="cancel-actions">
                    <button mat-button (click)="showCancelForm.set(false)">Cancelar</button>
                    <button mat-flat-button color="warn" (click)="cancelConfirm()"
                            [disabled]="cancelReason.invalid">Confirmar cancelación</button>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 1.5rem; flex: 1; }
    .detail-card, .actions-card { margin-bottom: 16px; }
    .fields { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; margin: 0; }
    dt { font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    dd { margin: 0; }
    .action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .cancel-form { margin-top: 16px; }
    .full-width { width: 100%; }
    .cancel-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .status-badge     { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; }
    .status-draft     { color: #666;    background: #eee; }
    .status-confirmed { color: #1565c0; background: #e3f2fd; }
    .status-completed { color: #2e7d32; background: #e8f5e9; }
    .status-cancelled { color: #c62828; background: #ffebee; }
  `]
})
export class CelebrationDetailComponent implements OnInit {
  readonly c = signal<CelebrationResponse | null>(null);
  readonly names = signal<Record<string, string>>({});
  readonly showCancelForm = signal(false);
  readonly cancelReason = new FormControl('', Validators.required);

  constructor(
    private route: ActivatedRoute,
    private svc: CelebrationService,
    private personSvc: PersonService,
    readonly auth: AuthService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load(this.route.snapshot.paramMap.get('id')!);
  }

  private load(id: string) {
    this.svc.findById(id).subscribe({
      next: cel => {
        this.c.set(cel);
        this.resolveNames(cel);
      }
    });
  }

  private resolveNames(cel: CelebrationResponse) {
    const ids = [
      cel.presidingPriestId, cel.childId, cel.spouseAId,
      cel.spouseBId, cel.deceasedId,
    ].filter((id): id is string => !!id);

    if (ids.length === 0) return;

    const requests = ids.map(id =>
      this.personSvc.findById(id).pipe(
        map(p => ({ id, name: `${p.firstName} ${p.lastName}` })),
        catchError(() => of({ id, name: id }))
      )
    );

    forkJoin(requests).subscribe(results => {
      const map: Record<string, string> = {};
      results.forEach(r => map[r.id] = r.name);
      this.names.set(map);
    });
  }

  confirm() {
    this.svc.confirm(this.c()!.id).subscribe({
      next: () => { this.snack.open('Celebración confirmada', '', { duration: 2500 }); this.load(this.c()!.id); },
      error: (e) => this.snack.open(e.error?.detail ?? 'Error', 'OK', { duration: 4000 }),
    });
  }

  complete() {
    this.svc.complete(this.c()!.id).subscribe({
      next: () => { this.snack.open('Marcada como celebrada', '', { duration: 2500 }); this.load(this.c()!.id); },
      error: (e) => this.snack.open(e.error?.detail ?? 'Error', 'OK', { duration: 4000 }),
    });
  }

  cancelConfirm() {
    if (this.cancelReason.invalid) return;
    this.svc.cancel(this.c()!.id, { reason: this.cancelReason.value! }).subscribe({
      next: () => {
        this.snack.open('Celebración cancelada', '', { duration: 2500 });
        this.showCancelForm.set(false);
        this.load(this.c()!.id);
      },
      error: (e) => this.snack.open(e.error?.detail ?? 'Error', 'OK', { duration: 4000 }),
    });
  }

  name(id: string | undefined): string {
    if (!id) return '—';
    return this.names()[id] ?? id;
  }

  typeLabel(type: string): string {
    const m: Record<string, string> = { MASS: 'Misa', BAPTISM: 'Bautizo', WEDDING: 'Boda', FUNERAL: 'Funeral', CONFIRMATION: 'Confirmación', FIRST_COMMUNION: 'Primera Comunión' };
    return m[type] ?? type;
  }
  statusLabel(s: string): string {
    const m: Record<string, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmada', COMPLETED: 'Celebrada', CANCELLED: 'Cancelada' };
    return m[s] ?? s;
  }
}
