import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CelebrationResponse, Page,
  ScheduleMassRequest, ScheduleBaptismRequest, ScheduleWeddingRequest,
  ScheduleFuneralRequest, ScheduleConfirmationRequest, ScheduleFirstCommunionRequest,
  RescheduleRequest, CancelRequest,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CelebrationService {
  private readonly url = `${environment.apiUrl}/celebrations`;

  constructor(private http: HttpClient) {}

  findBetween(from: string, to: string, page = 0, size = 20): Observable<Page<CelebrationResponse>> {
    const params = new HttpParams()
      .set('from', from).set('to', to).set('page', page).set('size', size).set('sort', 'scheduledAt');
    return this.http.get<Page<CelebrationResponse>>(this.url, { params });
  }

  findById(id: string): Observable<CelebrationResponse> {
    return this.http.get<CelebrationResponse>(`${this.url}/${id}`);
  }

  findByPriest(priestId: string, page = 0, size = 20): Observable<Page<CelebrationResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CelebrationResponse>>(`${this.url}/by-priest/${priestId}`, { params });
  }

  scheduleMass(req: ScheduleMassRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/masses`, req);
  }

  scheduleBaptism(req: ScheduleBaptismRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/baptisms`, req);
  }

  scheduleWedding(req: ScheduleWeddingRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/weddings`, req);
  }

  scheduleFuneral(req: ScheduleFuneralRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/funerals`, req);
  }

  scheduleConfirmation(req: ScheduleConfirmationRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/confirmations`, req);
  }

  scheduleFirstCommunion(req: ScheduleFirstCommunionRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/first-communions`, req);
  }

  confirm(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/confirm`, {});
  }

  complete(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/complete`, {});
  }

  cancel(id: string, req: CancelRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cancel`, req);
  }

  reschedule(id: string, req: RescheduleRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/reschedule`, req);
  }

  markDocumentationComplete(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/mark-documentation-complete`, {});
  }

  assignBishop(id: string, bishopId: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/assign-bishop`, { bishopId });
  }

  markCatechismComplete(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/mark-catechism-complete`, {});
  }
}
