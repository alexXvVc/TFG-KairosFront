import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LocationService } from '../../core/services/location.service';
import { LocationResponse } from '../../core/models';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Ubicaciones</h1>
      </div>

      <mat-card>
        <mat-card-content class="table-card-content">
          <table mat-table [dataSource]="locations()" class="full-width">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let l">
                <div class="name-cell">
                  <mat-icon>location_on</mat-icon>
                  {{ l.name }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Dirección</th>
              <td mat-cell *matCellDef="let l">{{ l.address ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef>Aforo</th>
              <td mat-cell *matCellDef="let l">{{ l.capacity ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let l">
                <span [class]="l.active ? 'badge-active' : 'badge-inactive'">
                  {{ l.active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            @if (locations().length === 0) {
              <tr>
                <td [colSpan]="columns.length" class="no-data-cell">No hay ubicaciones registradas.</td>
              </tr>
            }
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 1.6rem; font-weight: 500; }
    .table-card-content { padding: 0; }
    .full-width { width: 100%; }
    .name-cell { display: flex; align-items: center; gap: 8px; }
    .no-data-cell { text-align: center; padding: 32px; }
    .badge-active   { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; color: #2e7d32; background: #e8f5e9; }
    .badge-inactive { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; color: #c62828; background: #ffebee; }
  `]
})
export class LocationsListComponent implements OnInit {
  readonly columns = ['name', 'address', 'capacity', 'active'];
  readonly locations = signal<LocationResponse[]>([]);

  constructor(private svc: LocationService) {}

  ngOnInit() {
    this.svc.findAll().subscribe({ next: data => this.locations.set(data) });
  }
}
