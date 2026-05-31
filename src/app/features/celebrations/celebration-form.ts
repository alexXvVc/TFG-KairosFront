import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CelebrationService } from '../../core/services/celebration.service';
import { PersonService } from '../../core/services/person.service';
import { LocationService } from '../../core/services/location.service';
import { PersonResponse, LocationResponse, CelebrationType } from '../../core/models';

@Component({
  selector: 'app-celebration-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/celebrations">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">Nueva celebración</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">

            <!-- Tipo -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo de celebración</mat-label>
              <mat-select formControlName="type">
                @for (t of types; track t.value) {
                  <mat-option [value]="t.value">{{ t.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Fecha y hora -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha y hora</mat-label>
              <input matInput type="datetime-local" formControlName="scheduledAt" />
            </mat-form-field>

            <!-- Ubicación -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ubicación</mat-label>
              <mat-select formControlName="locationId">
                @for (l of locations(); track l.id) {
                  <mat-option [value]="l.id">{{ l.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Sacerdote -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sacerdote celebrante</mat-label>
              <mat-select formControlName="presidingPriestId">
                @for (p of priests(); track p.id) {
                  <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- ── MISA ── -->
            @if (type() === 'MASS') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Intención (opcional)</mat-label>
                <input matInput formControlName="intention" />
              </mat-form-field>
              <mat-checkbox formControlName="sundayMass" class="checkbox-field">
                Misa dominical
              </mat-checkbox>
            }

            <!-- ── BAUTIZO ── -->
            @if (type() === 'BAPTISM') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bautizado</mat-label>
                <mat-select formControlName="childId">
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Padres</mat-label>
                <mat-select formControlName="parentIds" multiple>
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Padrinos</mat-label>
                <mat-select formControlName="godparentIds" multiple>
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- ── BODA ── -->
            @if (type() === 'WEDDING') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cónyuge A</mat-label>
                <mat-select formControlName="spouseAId">
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cónyuge B</mat-label>
                <mat-select formControlName="spouseBId">
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Testigos</mat-label>
                <mat-select formControlName="witnessIds" multiple>
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- ── FUNERAL ── -->
            @if (type() === 'FUNERAL') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Difunto</mat-label>
                <mat-select formControlName="deceasedId">
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Lugar de entierro (opcional)</mat-label>
                <input matInput formControlName="burialLocation" />
              </mat-form-field>
            }

            <!-- ── CONFIRMACIÓN ── -->
            @if (type() === 'CONFIRMATION') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Candidatos</mat-label>
                <mat-select formControlName="candidateIds" multiple>
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Obispo (opcional)</mat-label>
                <mat-select formControlName="bishopId">
                  <mat-option [value]="null">— Ninguno —</mat-option>
                  @for (p of bishops(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- ── PRIMERA COMUNIÓN ── -->
            @if (type() === 'FIRST_COMMUNION') {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Candidatos</mat-label>
                <mat-select formControlName="candidateIds" multiple>
                  @for (p of faithful(); track p.id) {
                    <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- Notas -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas internas (opcional)</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <!-- Botones -->
            <div class="form-actions">
              <button mat-button type="button" routerLink="/celebrations">Cancelar</button>
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || saving()">
                <mat-icon>save</mat-icon>
                {{ saving() ? 'Guardando…' : 'Guardar borrador' }}
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 640px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 1.5rem; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .checkbox-field { margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
  `],
})
export class CelebrationFormComponent implements OnInit {
  readonly saving = signal(false);
  readonly locations = signal<LocationResponse[]>([]);
  readonly priests   = signal<PersonResponse[]>([]);
  readonly bishops   = signal<PersonResponse[]>([]);
  readonly faithful  = signal<PersonResponse[]>([]);

  readonly types: { value: CelebrationType; label: string }[] = [
    { value: 'MASS',            label: 'Misa' },
    { value: 'BAPTISM',         label: 'Bautizo' },
    { value: 'WEDDING',         label: 'Boda' },
    { value: 'FUNERAL',         label: 'Funeral' },
    { value: 'CONFIRMATION',    label: 'Confirmación' },
    { value: 'FIRST_COMMUNION', label: 'Primera Comunión' },
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: CelebrationService,
    private personSvc: PersonService,
    private locationSvc: LocationService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      type:              ['MASS', Validators.required],
      scheduledAt:       ['', Validators.required],
      locationId:        ['', Validators.required],
      presidingPriestId: ['', Validators.required],
      // MASS
      intention:         [''],
      sundayMass:        [false],
      // BAPTISM
      childId:           [''],
      parentIds:         [[]],
      godparentIds:      [[]],
      // WEDDING
      spouseAId:         [''],
      spouseBId:         [''],
      witnessIds:        [[]],
      // FUNERAL
      deceasedId:        [''],
      burialLocation:    [''],
      // CONFIRMATION / FIRST_COMMUNION
      candidateIds:      [[]],
      bishopId:          [null],
      // common
      notes:             [''],
    });
  }

  type(): CelebrationType {
    return this.form.get('type')!.value;
  }

  ngOnInit() {
    forkJoin([
      this.locationSvc.findAll(),
      this.personSvc.findAll(0, 200),
    ]).subscribe({
      next: ([locs, persons]) => {
        this.locations.set(locs);
        const all = persons.content;
        this.priests.set( all.filter(p => p.role === 'PRIEST'));
        this.bishops.set( all.filter(p => p.role === 'BISHOP'));
        this.faithful.set(all.filter(p => p.role === 'FAITHFUL' || p.role === 'DEACON'));
      },
      error: () => this.snack.open('Error cargando datos', 'OK', { duration: 3000 }),
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const scheduledAt = v.scheduledAt.includes('T') ? v.scheduledAt + ':00' : v.scheduledAt;
    const base = { scheduledAt: scheduledAt.substring(0, 19), locationId: v.locationId, presidingPriestId: v.presidingPriestId };

    this.saving.set(true);
    let call$;
    switch (v.type as CelebrationType) {
      case 'MASS':
        call$ = this.svc.scheduleMass({ ...base, intention: v.intention || undefined, sundayMass: v.sundayMass });
        break;
      case 'BAPTISM':
        call$ = this.svc.scheduleBaptism({ ...base, childId: v.childId, parentIds: v.parentIds, godparentIds: v.godparentIds });
        break;
      case 'WEDDING':
        call$ = this.svc.scheduleWedding({ ...base, spouseAId: v.spouseAId, spouseBId: v.spouseBId, witnessIds: v.witnessIds });
        break;
      case 'FUNERAL':
        call$ = this.svc.scheduleFuneral({ ...base, deceasedId: v.deceasedId, burialLocation: v.burialLocation || undefined });
        break;
      case 'CONFIRMATION':
        call$ = this.svc.scheduleConfirmation({ ...base, candidateIds: v.candidateIds, bishopId: v.bishopId || undefined });
        break;
      case 'FIRST_COMMUNION':
        call$ = this.svc.scheduleFirstCommunion({ ...base, candidateIds: v.candidateIds });
        break;
    }

    call$.subscribe({
      next: () => {
        this.snack.open('Celebración creada', '', { duration: 2500 });
        this.router.navigate(['/celebrations']);
      },
      error: (e: { error?: { detail?: string } }) => {
        this.snack.open(e.error?.detail ?? 'Error al crear la celebración', 'OK', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }
}
