import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonResponse, PersonRole, CreatePersonRequest, Page } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly url = `${environment.apiUrl}/persons`;

  constructor(private http: HttpClient) {}

  findById(id: string): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(`${this.url}/${id}`);
  }

  findAll(page = 0, size = 20): Observable<Page<PersonResponse>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'lastName');
    return this.http.get<Page<PersonResponse>>(this.url, { params });
  }

  findByRole(role: PersonRole, page = 0, size = 20): Observable<Page<PersonResponse>> {
    const params = new HttpParams().set('role', role).set('page', page).set('size', size);
    return this.http.get<Page<PersonResponse>>(this.url, { params });
  }

  search(q: string, page = 0, size = 20): Observable<Page<PersonResponse>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<PersonResponse>>(this.url, { params });
  }

  create(req: CreatePersonRequest): Observable<void> {
    return this.http.post<void>(this.url, req);
  }
}
