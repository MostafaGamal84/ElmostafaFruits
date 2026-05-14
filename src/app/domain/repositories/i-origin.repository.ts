import { Observable } from 'rxjs';
import { Origin } from '../models/origin.model';

export interface IOriginRepository {
  getOrigins(): Observable<Origin[]>;
}
