import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormRegisterComponent } from "../form-register/form-register.component";
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonModule, MenubarModule, AvatarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  public items: any[] = [];
  public commonItems: any[] = [];
  public isAdmin: boolean = false;
  public showForm: boolean = false;
  public userName: string = '';
  public userSubscription: Subscription = new Subscription();//Para subscriirnos a lo que emitte el BEHAviorSubject en login de auth.service.ts
  constructor(private serAuth: AuthService, private primeng: PrimeNG, private ruta: Router) {
  }

  /**
  * Inicializa el componente de navegación.
  * - Activa el efecto ripple de PrimeNG.
  * - Configura ítems comunes.
  * - Se suscribe al `BehaviorSubject` expuesto por el servicio de autenticación
  *   para mantenerse actualizado con los cambios en el estado del usuario.
  */
  ngOnInit() {
    this.primeng.ripple.set(true); //Activamos el efecto de ripple en los botones de PrimeNG
    // Nos suscribimos al BehaviorSubject para obtener el nombre del usuario
    this.commonItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        styleClass: 'menu-inicio',
        command: () => this.ruta.navigate(['/'])
      },
      {
        label: 'Estadísticas',
        icon: 'pi pi-chart-line',
        styleClass: 'menu-estadisticas',
        command: () => this.ruta.navigate(['/estadisticas'])
      },
      {
        label: 'Reglas del concurso',
        icon: 'pi pi-book',
        styleClass: 'menu-reglas',
        command: () => this.ruta.navigate(['/contest-rules'])
      }
    ];

    /**
    * Suscripción al observable del usuario expuesto como `BehaviorSubject` en `AuthService`.
    * 
    * ¿Por qué se usa `BehaviorSubject`?
    * - `BehaviorSubject` permite emitir el estado actual del usuario y notificar a todos los
    *   componentes suscritos ante cualquier cambio (login, logout, actualización).
    * - A diferencia de un simple `Subject`, `BehaviorSubject` **mantiene el último valor emitido**
    *   y lo entrega inmediatamente a nuevos suscriptores.
    * - Esto es crucial en este caso, ya que `NavbarComponent` NO es hijo del componente que ejecuta el login
    *   (`FormLoginComponent`). Por tanto, no podría enterarse del cambio si no se propaga globalmente.
    * 
    * `getUserObservable()` devuelve ese `BehaviorSubject` como `Observable`.
    * Así, cada vez que el usuario cambia, se actualiza dinámicamente el menú.
    */
    this.userSubscription = this.serAuth.getUserObservable().subscribe(user => {//Nos traemos el usuario mediante el BEhaviorSubject
      this.items = []; //limpiar para regenerar.
      //console.log("El usuario que traemsos es: ", user);

      if (user) {
        this.userName = user.nombre;
        this.isAdmin = user.rol === 'administrador'; //Verificamos si el usuario es admin

        this.items = [
          ...this.commonItems,
          ...(!this.isAdmin ? [{
            label: 'Subir Foto',
            icon: 'pi pi-upload',
            styleClass: 'p-button-text p-button-lg text-white',
            command: () => this.ruta.navigate(['/upload-photo'])
          }] : []),
          {
            label: `Bienvenido, ${this.userName}`,
            icon: 'pi pi-user',
            styleClass: 'p-menuitem-user',
            items: [
              ...(this.isAdmin ? [] : [{
                label: 'Mis Perfil',
                icon: 'pi pi-id-card',
                command: () => this.ruta.navigate(['/admin', { id: user.id }])
              }]),
              ...(this.isAdmin ? [] : [{
                label: 'Votar Fotos',
                icon: 'pi pi-star',
                command: () => this.ruta.navigate(['/photos', { id: -1 }])
              }]),
              ...(this.isAdmin ? [] : [{
                label: 'Mis Fotos',
                icon: 'pi pi-images',
                command: () => this.ruta.navigate(['/photos', { id: user.id }])
              }]),

              ...(this.isAdmin ? [{
                label: 'Configuración',
                icon: 'pi pi-cog',
                command: () => this.ruta.navigate(['/configuration'])
              }] : []),

              ...(this.isAdmin ? [{
                label: 'Panel Admin',
                icon: 'pi pi-shield',
                command: () => this.ruta.navigate(['/admin'])
              }] : []),
              {
                separator: true
              },
              {
                label: 'Cerrar Sesión',
                icon: 'pi pi-sign-out',
                command: () => this.logout(),
                styleClass: 'text-danger'
              }
            ]
          }
        ];
      } else {
        // Usuario no logeado
        this.userName = '';
        this.items = [
          ...this.commonItems,
          {
            label: 'Registrarse',
            icon: 'pi pi-user-plus',
            styleClass: 'p-button-outlined p-button-lg',
            command: () => this.ruta.navigate(['/register'])
          },
          {
            label: 'Iniciar Sesión',
            icon: 'pi pi-sign-in',
            command: () => this.ruta.navigate(['/login'])
          },

        ];
      }
    });
    /*Obtener el usuario directamente desde el AuthService sin usar suscripción. Así, tengo que recargar la página para que se vea el 
    usuario leggeado porque form-login no es hijo de NavbarComponent. Por esta razón utilizo el Subcription al observable que envío del BeHAviorSubject
    const user = this.serAuth.getCurrentUserDirect();
    console.log("Este es el usuario", user)
    if (user) {
      this.userName = user.nombre;
      this.isAdmin = user.rol === 'administrador'; //Verificamos si el usuario es admin

      this.items = [
        ...this.commonItems,
        {
          label: 'Subir Foto',
          icon: 'pi pi-upload',
          styleClass: 'p-button-text p-button-lg text-white',
          command: () => this.ruta.navigate(['/upload-photo'])
        },
        {
          label: `Bienvenido, ${this.userName}`,
          icon: 'pi pi-user',
          styleClass: 'p-menuitem-user',
          items: [
            {
              label: 'Mi Perfil',
              icon: 'pi pi-id-card',
              command: () => this.ruta.navigate(['/listado-tests-photos'])
            },
            {
              label: 'Votar Fotos',
              icon: 'pi pi-star',
              command: () => this.ruta.navigate(['/photos', { id: -1 }])
            },
            ...(this.isAdmin ? [] : [{
              label: 'Mis Fotos',
              icon: 'pi pi-images',
              command: () => this.ruta.navigate(['/photos', { id: user.id }])
            }]),
            {
              label: 'Configuración',
              icon: 'pi pi-cog',
              command: () => this.ruta.navigate(['/configuracion'])
            },
            ...(this.isAdmin ? [{
              label: 'Panel Admin',
              icon: 'pi pi-shield',
              command: () => this.ruta.navigate(['/admin'])
            }] : []),
            {
              separator: true
            },
            {
              label: 'Cerrar Sesión',
              icon: 'pi pi-sign-out',
              command: () => this.logout(),
              styleClass: 'text-danger'
            }
          ]
        }
      ];
    } else {
      // Usuario no logeado
      this.userName = '';
      this.items = [
        ...this.commonItems,
        {
          label: 'Registrarse',
          icon: 'pi pi-user-plus',
          styleClass: 'p-button-outlined p-button-lg',
          command: () => this.ruta.navigate(['/register'])
        },
        {
          label: 'Iniciar Sesión',
          icon: 'pi pi-sign-in',
          command: () => this.ruta.navigate(['/login'])
        },

      ];
    };*/
  }

  /**
  * Cierra la sesión del usuario actual.
  * También limpia el nombre visible en el menú.
  */
  logout() {
    this.serAuth.logout();
    this.userName = '';  // Limpiamos el nombre del usuario al cerrar sesión
  }
}
