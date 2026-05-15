import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordResponse, RecordType, Page } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly url = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  findById(id: string): Observable<RecordResponse> {
    return this.http.get<RecordResponse>(`${this.url}/${id}`);
  }

  findByCelebration(celebrationId: string): Observable<RecordResponse[]> {
    return this.http.get<RecordResponse[]>(`${this.url}/by-celebration/${celebrationId}`);
  }

  findByType(type: RecordType, page = 0, size = 20): Observable<Page<RecordResponse>> {
    const params = new HttpParams().set('type', type).set('page', page).set('size', size).set('sort', 'registeredOn,desc');
    return this.http.get<Page<RecordResponse>>(this.url, { params });
  }

  downloadCertificate(id: string): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/certificate`, { responseType: 'blob' });
  }
}
