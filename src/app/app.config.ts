import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
//import { provideRouter } from '@angular/router';
import { provideRouter, withInMemoryScrolling, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
//import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
//Temas de PrimeNG disponibles
import Aura from '@primeng/themes/aura';
import Material from '@primeng/themes/material';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';
import { loaderInterceptor } from './interceptors/loader.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,
    withInMemoryScrolling({//Para arreglar tema del posicionamiento en la página
      scrollPositionRestoration: 'top',  //Restaura la posición al tope al navegar
      anchorScrolling: 'enabled', //Permite desplazamiento por anclas (#id)
    })
  ),
  //Configura el cliente HTTP con interceptores personalizados
  provideHttpClient(
    withInterceptors([authInterceptor, loaderInterceptor]) //Añade el token de autenticación a cada solicitud y uestra/oculta un spinner de carga global, si activamos la configuración en los otros componentes
  ), provideAnimations(),
  providePrimeNG({
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.my-app-dark'
      }
    }
  })
  ]
};
