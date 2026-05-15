import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEntry } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly url = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  findUpcoming(from: string, to: string): Observable<CalendarEntry[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarEntry[]>(this.url, { params });
  }
}
