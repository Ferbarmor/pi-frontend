import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RalliesService } from '../../services/rallies.service';
import { NotificationsService } from '../../services/notifications.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-form-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent {
  /**
 * Decorador `@ViewChild` que obtiene una referencia al elemento del DOM con la plantilla local 'dragHandle'.
 * 
 * Esto permite manipular directamente el elemento HTML que actúa como "manija" para arrastrar el cuadro de login.
 * 
 * `ElementRef` es un wrapper que proporciona acceso directo al elemento nativo del DOM.
 * Usando `dragHandle.nativeElement` podemos añadir eventos o modificar el estilo del elemento.
 * 
 * En este caso, `dragHandle` es el punto donde el usuario puede "agarrar" con el ratón para mover el formulario.
 */
  @ViewChild('dragHandle') dragHandle!: ElementRef;
  /**
 * Decorador `@ViewChild` que obtiene una referencia al elemento del DOM con la plantilla local 'dragTarget'.
 * 
 * Este elemento es el que se mueve visualmente cuando el usuario arrastra el formulario.
 * `ElementRef` permite acceder al nodo DOM para actualizar las propiedades CSS `left` y `top` durante el arrastre.
 */
  @ViewChild('dragTarget') dragTarget!: ElementRef;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  public form: FormGroup;
  public message: string = '';
  public messageType: 'success' | 'error' = 'success';
  public isUploading: boolean = false;

  constructor(private fb: FormBuilder, private notifications: NotificationsService,
    private serviceauth: AuthService, private ruta: Router) {
    this.form = this.fb.group({
      //Declaramos los diferente campos del formulario
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit() {
  }

  /**
   * Se ejecuta tras la inicialización completa de la vista del componente.
   * 
   * Configura la funcionalidad de arrastrar el formulario mediante los eventos del mouse,
   * permitiendo que el usuario mueva el cuadro de login por la pantalla si así lo desea.
   */
  ngAfterViewInit() {
    const handle = this.dragHandle.nativeElement;
    const target = this.dragTarget.nativeElement;

    handle.addEventListener('mousedown', (event: MouseEvent) => {
      this.isDragging = true;
      this.offsetX = event.clientX - target.getBoundingClientRect().left;
      this.offsetY = event.clientY - target.getBoundingClientRect().top;

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    });
  }

  /**
   * Evento de movimiento del mouse para reposicionar el cuadro de login
   * mientras el usuario arrastra con el botón del mouse presionado.
   */
  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const target = this.dragTarget.nativeElement;
      target.style.left = `${event.clientX - this.offsetX}px`;
      target.style.top = `${event.clientY - this.offsetY}px`;
    }
  };

  /**
  * Evento que detiene el arrastre del cuadro de login cuando el usuario
  * suelta el botón del mouse.
  */
  private onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  /**
   * Envía los datos del formulario de inicio de sesión al servicio de autenticación.
   * 
   * Este método utiliza `AuthService` para autenticar al usuario. Si el login es exitoso,
   * muestra una notificación de éxito y redirige al inicio. En caso de error,
   * muestra un mensaje informativo para el usuario.
   */
  onSubmit() {
    this.isUploading = true;
    this.serviceauth.login(this.form.value).subscribe({

      next: res => {
        this.isUploading = false;
        //console.log("Usuario logeado correctamente", res);
        this.notifications.showToast("Logueado con éxito", "success");
        this.ruta.navigate(["/"]);
      },
      error: (err) => {
        this.isUploading = false;
        console.log("Error al logearse", err);
        this.message = err.message;
        this.messageType = 'error';
        //this.form.reset();
        //this.notifications.showToast(this.message, "danger");
      }
    });
  }
}
