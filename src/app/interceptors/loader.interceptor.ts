// services/loader.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loaderService = inject(LoaderService);  // Inyectar el servicio de loader

    // Contador para manejar las solicitudes
    let totalRequests = 0;
    totalRequests++;

    // Mostrar el spinner cuando la solicitud empieza
    loaderService.show();

    return next(req).pipe(
        finalize(() => {
            totalRequests--;
            if (totalRequests === 0) {
                // Ocultar el spinner cuando todas las solicitudes hayan terminado
                loaderService.hide();
            }
        })
    );
};