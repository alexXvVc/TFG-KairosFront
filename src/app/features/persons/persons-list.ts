import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PersonService } from '../../core/services/person.service';
import { PersonResponse, Page } from '../../core/models';

@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Personas</h1>

      <mat-card class="filters-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar por nombre</mat-label>
            <input matInput [formControl]="searchCtrl" placeholder="Ej: García" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="table-card-content">
          <table mat-table [dataSource]="data().content" class="full-width">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let p">{{ p.firstName }} {{ p.lastName }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip>{{ roleLabel(p.role) }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let p">{{ p.email ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Teléfono</th>
              <td mat-cell *matCellDef="let p">{{ p.phone ?? '—' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            @if (data().content.length === 0) {
              <tr><td [colSpan]="columns.length" class="no-data-cell">
                No se encontraron personas.
              </td></tr>
            }
          </table>

          <mat-paginator
            [length]="data().totalElements"
            [pageSize]="20"
            [pageIndex]="pageIndex()"
            (page)="onPage($event)" />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-title { margin: 0 0 20px; font-size: 1.6rem; font-weight: 500; }
    .filters-card { margin-bottom: 16px; }
    .search-field { width: 360px; }
    .full-width { width: 100%; }
    .table-card-content { padding: 0; }
    .no-data-cell { text-align: center; padding: 32px; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class PersonsListComponent implements OnInit {
  readonly columns = ['name', 'role', 'email', 'phone'];
  readonly data = signal<Page<PersonResponse>>({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true });
  readonly pageIndex = signal(0);
  readonly searchCtrl = new FormControl('');

  constructor(private svc: PersonService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
  }

  load() {
    const q = this.searchCtrl.value?.trim() ?? '';
    const obs = q.length >= 2
      ? this.svc.search(q, this.pageIndex())
      : this.svc.findAll(this.pageIndex());
    obs.subscribe({
      next: page => this.data.set(page),
      error: () => this.snack.open('Error cargando personas', 'OK', { duration: 3000 }),
    });
  }

  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.load(); }

  roleLabel(r: string): string {
    const m: Record<string, string> = { FAITHFUL: 'Fiel', DEACON: 'Diácono', PRIEST: 'Sacerdote', BISHOP: 'Obispo' };
    return m[r] ?? r;
  }
}
