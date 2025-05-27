import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { NotificationsService } from './notifications.service';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root' // Registra el servicio a nivel de aplicación
})
export class AuthService {
  //URL base de la API tomada desde environment
  private readonly API_URL = environment.API_URL;
  //Clave para almacenar el token JWT en sessionStorage
  private readonly TOKEN_KEY = 'auth_token';
  //Clave para almacenar los datos del usuario en sessionStorage
  private readonly USER_KEY = 'user_data';
  //Creamos un BehaviorSubject para emitir el nombre del usuario
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.getCurrentUser());//Valor inicial es el usuario que tenga this.getCurrentUser
  constructor(
    private http: HttpClient, // Para hacer peticiones HTTP
    private router: Router, // Para navegación programática
    private notifications: NotificationsService // Para mostrar notificaciones
  ) { }

  /**
   * Maneja el proceso de login
   * @param credentials Objeto con email y password
   * @returns Observable con la respuesta del servidor
   */
  login(credentials: { email: string, password: string }): Observable<{ access_token: string, user: any }> {
    return this.http.post<{ access_token: string, user: any }>(
      `${this.API_URL}/login`,
      credentials
    ).pipe(//pipe es un método que te permite encadenar operadores para transformar, filtrar, o manejar los datos que emite un Observable.
      //Si la petición es exitosa:
      tap(response => {//tap se usa para hacer algo con la respuesta cuando llega (guardar datos, emitir eventos, logging) sin afectar el flujo del observable.En este caso, sirve para almacenar el token y actualizar el estado del usuario cuando se loguea.
        this.setAuthData(response.access_token, response.user); //Guarda los datos del usuario
        this.userSubject.next(response.user); //Emitimos el usuario logueado
      }),
      // Si hay errores:
      catchError(error => {
        if (error.status === 401) {
          throw new Error('Credenciales incorrectas');
        }
        throw new Error(error.error?.message || 'Error en el servidor');
      })
    );
  }

  /**
   * Almacena el token y datos del usuario en sessionStorage
   * @param token Token JWT recibido del backend
   * @param user Datos del usuario autenticado
   */
  private setAuthData(token: string, user: any): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene el token JWT almacenado
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene los datos del usuario logueado
   * @returns Objeto con datos del usuario o null si no está logueado
   */
  getCurrentUser(): any {
    const user = sessionStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  
  /**
   * Método para obtener el BehaviorSubject del usuario
   * @returns El nombre del usuario logueado o null si no hay usuario
   */
  getUserObservable() {
    return this.userSubject.asObservable();
  }

  /**
   * Método para obtener el usuario directamente sin subcripcionesI
   * @returns 
   */
  getCurrentUserDirect() {
    return this.userSubject.getValue();
  }

   /**
   * Método para actualizar el usuario actual en el BehaviorSubject
   * @param user 
   */
   updateCurrentUser(user: Usuario) {
    this.userSubject.next(user);
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns true si existe un token válido, false en caso contrario
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Cierra la sesión actual
   * 1. Intenta invalidar el token en el backend
   * 2. Limpia los datos de autenticación del frontend
   * 3. Redirige al login
   */
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      complete: () => {
        this.clearAuth();
        this.notifications.showToast('Sesión cerrada correctamente', 'success');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.clearAuth();
        this.notifications.showToast('Error al cerrar sesión', 'danger');
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Limpia todos los datos de autenticación
   * 1. Elimina el token de sessionStorage
   * 2. Elimina los datos del usuario
   * 3. Redirige a la página de login
   */
  private clearAuth(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null); // Emitir valor nulo para que otros componentes reaccionen
  }
}