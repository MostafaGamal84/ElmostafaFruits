import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROOT_URL } from '../config/api.config';
import { ImageUploadResponse } from '../models/upload.model';

@Injectable({
  providedIn: 'root',
})
export class UploadsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_ROOT_URL}/uploads/images`;

  uploadImage(file: File, folder = 'products', maxWidth = 2000): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('folder', folder);
    formData.append('maxWidth', String(maxWidth));

    return this.http.post<ImageUploadResponse>(this.url, formData);
  }
}

