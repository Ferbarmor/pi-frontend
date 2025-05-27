// services/loader.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';

/**
 * Interceptor HTTP para gestionar un spinner de carga (loader) durante las solicitudes HTTP.
 *
 * - Muestra el loader al iniciar una solicitud.
 * - Oculta el loader cuando todas las solicitudes pendientes han finalizado.
 * - Usa un contador para manejar múltiples solicitudes simultáneas.
 * 
 * @param req La solicitud HTTP entrante.
 * @param next El siguiente manejador en la cadena de interceptores.
 * @returns El observable de la solicitud, con lógica para mostrar y ocultar el loader.
 */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loaderService = inject(LoaderService);  // Inyectar el servicio de loader

    //Contador para manejar las solicitudes
    let totalRequests = 0;
    totalRequests++;

    //Muestra el spinner cuando la solicitud empieza
    loaderService.show();

    return next(req).pipe(
        finalize(() => {
            //Cuando la solicitud termina (éxito o error), decrementa el contador
            totalRequests--;
            if (totalRequests === 0) {
                //Oculta el spinner cuando todas las solicitudes hayan terminado
                loaderService.hide();
            }
        })
    );
};