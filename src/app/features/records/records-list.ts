import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RecordService } from '../../core/services/record.service';
import { RecordResponse, RecordType, Page } from '../../core/models';

@Component({
  selector: 'app-records-list',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Registros sacramentales</h1>

      <mat-card class="filters-card">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Tipo de registro</mat-label>
            <mat-select [formControl]="typeCtrl" (selectionChange)="load()">
              @for (t of types; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="table-card-content">
          <table mat-table [dataSource]="data().content" class="full-width">

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let r">{{ typeLabel(r.recordType) }}</td>
            </ng-container>

            <ng-container matColumnDef="registeredOn">
              <th mat-header-cell *matHeaderCellDef>Fecha registro</th>
              <td mat-cell *matCellDef="let r">{{ r.registeredOn | date:'d MMM yyyy':'':'es' }}</td>
            </ng-container>

            <ng-container matColumnDef="certificate">
              <th mat-header-cell *matHeaderCellDef>Certificado</th>
              <td mat-cell *matCellDef="let r">
                <button mat-icon-button color="primary" (click)="downloadCert(r)" title="Descargar PDF">
                  <mat-icon>picture_as_pdf</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
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
    .full-width { width: 100%; }
    .table-card-content { padding: 0; }
  `]
})
export class RecordsListComponent implements OnInit {
  readonly columns = ['type', 'registeredOn', 'certificate'];
  readonly data = signal<Page<RecordResponse>>({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true });
  readonly pageIndex = signal(0);

  readonly types: { value: RecordType; label: string }[] = [
    { value: 'BAPTISM',         label: 'Bautismos' },
    { value: 'MARRIAGE',        label: 'Matrimonios' },
    { value: 'FUNERAL',         label: 'Funerales' },
    { value: 'CONFIRMATION',    label: 'Confirmaciones' },
    { value: 'FIRST_COMMUNION', label: 'Primeras Comuniones' },
  ];
  readonly typeCtrl = new FormControl<RecordType>('BAPTISM', { nonNullable: true });

  constructor(private svc: RecordService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.svc.findByType(this.typeCtrl.value, this.pageIndex(), 20).subscribe({
      next: page => this.data.set(page),
      error: () => this.snack.open('Error cargando registros', 'OK', { duration: 3000 }),
    });
  }

  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.load(); }

  downloadCert(record: RecordResponse) {
    this.svc.downloadCertificate(record.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `certificado-${record.id}.pdf`;
        a.click(); URL.revokeObjectURL(url);
      },
      error: () => this.snack.open('Error descargando certificado', 'OK', { duration: 3000 }),
    });
  }

  typeLabel(t: RecordType): string {
    return this.types.find(x => x.value === t)?.label ?? t;
  }
}
