import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V1_BASE_URL } from '../config/api.config';
import {
  AdminMessage,
  ContactMessagePayload,
  ContactMessageResponse,
} from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessagesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_V1_BASE_URL}/messages`;

  submitMessage(payload: ContactMessagePayload): Observable<ContactMessageResponse> {
    return this.http.post<ContactMessageResponse>(this.url, payload);
  }

  getMessages(): Observable<AdminMessage[]> {
    return this.http.get<AdminMessage[]>(this.url);
  }
}

