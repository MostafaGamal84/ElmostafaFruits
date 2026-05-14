import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ROOT_URL } from '../config/api.config';
import { AdminMilestone, Milestone, MilestonePayload } from '../models/milestone.model';
import { AdminMockFallbackService } from './admin-mock-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class MilestonesApiService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AdminMockFallbackService);
  private readonly url = `${API_ROOT_URL}/milestones`;

  getPublicMilestones(): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(this.url);
  }

  getAdminMilestones(): Observable<AdminMilestone[]> {
    return this.http.get<AdminMilestone[]>(`${this.url}/admin`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'load milestones', () =>
          this.mock.list<AdminMilestone>('milestones'),
        ),
      ),
    );
  }

  createMilestone(payload: MilestonePayload): Observable<AdminMilestone> {
    return this.http.post<AdminMilestone>(this.url, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'create milestone', () =>
          this.mock.create<AdminMilestone>('milestones', payload),
        ),
      ),
    );
  }

  updateMilestone(id: number, payload: MilestonePayload): Observable<AdminMilestone> {
    return this.http.put<AdminMilestone>(`${this.url}/${id}`, payload).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'update milestone', () =>
          this.mock.update<AdminMilestone>('milestones', id, payload),
        ),
      ),
    );
  }

  deleteMilestone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error) =>
        this.mock.fallback(error, 'delete milestone', () => {
          this.mock.delete('milestones', id);
        }),
      ),
    );
  }
}
