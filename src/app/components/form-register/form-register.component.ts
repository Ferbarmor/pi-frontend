import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RalliesService } from '../../services/rallies.service';
import { UsuarioService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Rally } from '../../models/rally';
import { Usuario } from '../../models/usuario';
import { NotificationsService } from '../../services/notifications.service';
import { Input, Output, EventEmitter, OnInit } from '@angular/core'

@Component({
  selector: 'app-form-register',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './form-register.component.html',
  styleUrl: './form-register.component.css'
})
export class FormRegisterComponent {
  @ViewChild('dragHandle') dragHandle!: ElementRef;
  @ViewChild('dragTarget') dragTarget!: ElementRef;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  @Input() usuario: Usuario = <Usuario>{}
  @Output() formClosed = new EventEmitter<{ success: boolean, message?: string, usuario?: Usuario }>();
  public textBottom: string = "Registrar";
  public form!: FormGroup;//el ! significa “Voy a inicializar form más adelante (por ejemplo, en ngOnInit), así que no me des error ahora.”
  public rallies: Rally[] = [];
  public rally: string = 'Rally';
  public message: string = '';  //Mensaje de respuesta
  public messageType: 'success' | 'error' = 'success';  //Tipo de mensaje
  public isUploading: boolean = false;// Lo utilizamos para crear un "spinner" que muestre que se está "hacinedo algo". Se usa en casi todos los formularios

  constructor(private fb: FormBuilder, private serrally: RalliesService, private seruser: UsuarioService,
    private ruta: Router, private notifications: NotificationsService) {
    this.textBottom = "Registrar";
  }

  /**
  * Inicializa el formulario reactivo y carga datos si el usuario ya existe (edición).
  * También carga la lista de rallies para el selector.
  */
  ngOnInit() {
    //console.log("Este es el valor del usuario al empezar", this.usuario.id);
    //const usuarioId = this.route.snapshot.params["id"];
    const esNuevo = this.usuario.id === undefined;
    //He definido aquí el formulario para poder ponerle la coindición al password
    this.form = this.fb.group({
      //Declaramos los diferente campos del formulario
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: esNuevo ? ['', [Validators.required, Validators.minLength(6) /*Validators.pattern(/^[^sS\s]*$/) Expresión regular para los espacios*/]] : [''],
      rol: ['participante'], //Establecemos "participante" como valor por defecto
      id_rally: this.fb.control('', [Validators.required]),
    });

    if (this.usuario.id != undefined && this.usuario.id != -1) {
      this.textBottom = "Modificar"
      this.seruser.ObtenerUsuarioId(this.usuario.id).subscribe({
        next: (res) => {
          //console.log("Esto es lo que recibo de ObtenerUsuarioId", res);
          this.form.patchValue(res);//Así rellenamos los datos en el formulario con la respuesta del servidor
        },
        error: (error) => console.log("Esto es un error de selPersonaID")
      })
    }
    //console.log("Este el id del usuario que traigo a editar", this.usuario.id);
    this.serrally.ListarRallies().subscribe({
      next: res => {
        //console.log("Resultado de los rallies ", res)
        this.rallies = res;
      },
      error: error => console.log("Esto es un eror del servidor", error)
    });

  }

  /**
   * Configura la funcionalidad para arrastrar el formulario mediante el drag handle.
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
   * Maneja el movimiento del mouse mientras se arrastra el formulario.
   */
  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const target = this.dragTarget.nativeElement;
      target.style.left = `${event.clientX - this.offsetX}px`;
      target.style.top = `${event.clientY - this.offsetY}px`;
    }
  };

  /**
   * Finaliza el arrastre y remueve los listeners para evitar fugas de memoria.
   */
  private onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  /**
  * Envía los datos del formulario para crear o modificar un usuario.
  * 
  * - Marca el estado `isUploading` como true para mostrar un spinner o deshabilitar botón.
  * - Realiza una copia profunda del formulario para evitar modificar el objeto original.
  * - Convierte el campo `id_rally` a número para evitar problemas de tipo.
  * - Si el usuario tiene ID, asume que es una edición; elimina la contraseña para no enviarla si no se cambió.
  * - Se suscribe a la respuesta del servidor y maneja tanto éxito como error.
  * - Emite eventos a través de `formClosed` para informar al componente padre sobre el resultado.
  * - Utiliza `notifications.showToast` para mostrar mensajes breves y visuales al usuario:
  *    - En caso de éxito, muestra un toast verde con confirmación.
  *    - En caso de error, muestra un toast rojo con el mensaje recibido.
  * - En caso de registro nuevo exitoso, limpia el formulario y puede redirigir al login.
  */
  onSubmit() {
    this.isUploading = true;
    //Hacemos una copia profunda de lo que tenemos en el formulario
    const formData = JSON.parse(JSON.stringify(this.form.value));
    //Convierte id_rally a un número (puede ser entero o flotante dependiendo del valor)
    formData.id_rally = Number(formData.id_rally);
    //console.log("Esto es lo que mando en el formulario", formData);
    if (this.usuario.id != undefined && this.usuario.id != -1) {
      //console.log("Estoy editando el usuario", this.usuario.id);
      delete formData.password; //Borramos la propiedad password del objeto formData
      this.seruser.ModificaUsuario(formData, this.usuario.id).subscribe({

        next: res => {
          this.isUploading = false;
          //console.log("Respuesta del servidor al modficar Usuario", res);
          this.formClosed.emit({ success: true, message: "Editando", usuario: res });
          this.notifications.showToast("Usuario modificado con éxito", "success");
        },
        error: (err) => {
          this.isUploading = false;
          this.notifications.showToast(err.message, "danger");
        }
      });
    } else {
      this.seruser.AnadeUsuario(formData).subscribe({

        next: res => {
          this.isUploading = false;
          //console.log("Usuario registrado correctamente", res);
          this.formClosed.emit({ success: true, message: "Añadiendo", usuario: res });
          this.form.reset();  // Limpiamos el formulario tras el registro
          if (this.usuario.id === undefined) {
            this.ruta.navigate(["/login"]);
          }
          this.notifications.showToast("Usuario registrado con éxito", "success");
        },
        error: (err) => {
          this.isUploading = false;
          //console.log("Este es el mensaje de error", err);
          //Verifica si existe el error de validación en datos.email
          if (err?.error?.errors?.['datos.email']) {
            this.message = "Este email ya ha sido registardo";  // Primer mensaje de error
          } else if (err?.error?.message) {
            this.message = err.error.message;  // Mensaje general de error
          } else {
            this.message = 'Error al registrar el usuario. Intenta nuevamente.';
          }

          this.messageType = 'error';  // Define el tipo de mensaje como error
        }
      });
    }
  }

  /**
   * Cancela la acción actual y emite evento para cerrar el formulario.
   * Si no hay usuario definido (registro nuevo), redirige a la página principal.
   */
  onCancel() {
    this.formClosed.emit({ success: false, usuario: this.usuario });
    if (this.usuario.id === undefined) {
      this.ruta.navigate(["/"]);
    }
  }
}
