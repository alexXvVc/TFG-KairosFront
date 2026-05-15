import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly base = '/api/locations';

  constructor(private http: HttpClient) {}

  findAll(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[]>(this.base);
  }
}
