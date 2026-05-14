import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { IOriginRepository } from '../../domain/repositories/i-origin.repository';
import { Origin } from '../../domain/models/origin.model';
import { OriginMapper } from '../mappers/origin.mapper';
import { API_V1_BASE_URL } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class OriginRepositoryImpl implements IOriginRepository {
  private http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/origins`;

  getOrigins(): Observable<Origin[]> {
    return this.http.get<any[]>(this.url).pipe(
      catchError(() => this.http.get<{ origins: any[] }>('assets/data.json').pipe(map((data) => data.origins))),
      map((origins) => origins.map((o) => OriginMapper.fromJson(o))),
    );
  }
}
