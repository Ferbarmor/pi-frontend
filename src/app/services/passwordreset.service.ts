import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PasswordresetService {
  private url = environment.API_URL;
  constructor(private http: HttpClient) { }

  requestResetLink(email: string) {
    return this.http.post(`${this.url}/forgot-password`, { email });
  }

  resetPassword(data: any) {
    return this.http.post(`${this.url}/reset-password`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
}

