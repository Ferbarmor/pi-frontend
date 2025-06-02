import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PasswordresetService {
  private url = environment.API_URL;
  constructor(private http: HttpClient) { }

  /**
  * Solicita al backend que envíe un enlace de reseteo de contraseña al email proporcionado.
  * 
  * @param email Dirección de correo electrónico del usuario.
  * @returns Observable con la respuesta del servidor.
  */
  requestResetLink(email: string) {
    return this.http.post(`${this.url}/forgot-password`, { email });
  }

  /**
  * Envía al backend los datos necesarios para realizar el reseteo de la contraseña.
  * Requiere un objeto que contenga el token, email, nueva contraseña y confirmación.
  * 
  * @param data Objeto con los datos del formulario: token, email, password, password_confirmation.
  * @returns Observable con la respuesta del servidor.
  */
  resetPassword(data: any) {
    return this.http.post(`${this.url}/reset-password`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
}

