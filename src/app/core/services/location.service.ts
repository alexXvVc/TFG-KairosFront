import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly url = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[]>(this.url);
  }
}
