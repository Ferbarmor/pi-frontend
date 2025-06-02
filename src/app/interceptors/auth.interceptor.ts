// services/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para agregar el token de autenticación en las cabeceras de las solicitudes.
 * 
 * - Obtiene el token desde el AuthService.
 * - No añade el token a las solicitudes cuyo URL incluye '/login' (para no interferir en el login).
 * - Si el token existe y la solicitud no es de login, clona la solicitud original y añade
 *   la cabecera 'Authorization' con el token en formato Bearer.
 * 
 * @param req La solicitud HTTP original.
 * @param next El siguiente manejador en la cadena de interceptores.
 * @returns La solicitud modificada (con token) o la original si no se aplica.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  //Evita agregar el token a solicitudes de login o si no hay token disponible
  if (req.url.includes('/login') || !token) {
    return next(req);
  }

  //Clona la solicitud original y agrega el token en la cabecera Authorizatio
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  //Continúa con la solicitud modificada
  return next(authReq);
};