import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Rally } from '../../models/rally';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RalliesService } from '../../services/rallies.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-rally',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './form-rally.component.html',
  styleUrl: './form-rally.component.css'
})
export class FormRallyComponent {
  @ViewChild('dragHandle') dragHandle!: ElementRef;
  @ViewChild('dragTarget') dragTarget!: ElementRef;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  /**
 * Recibe un objeto Rally desde el componente padre para mostrar o editar.
 * Este decorador permite que el componente reciba datos externos.
 */
  @Input() rally: Rally = <Rally>{}
  /**
 * Emite un evento al componente padre cuando el formulario se cierra.
 * Envía un objeto con éxito, mensaje y el rally modificado o creado.
 * Este decorador permite que el componente hijo comunique cambios o acciones al padre.
 */
  @Output() formClosed = new EventEmitter<{ success: boolean, message?: string, rally?: Rally }>();
  public textBottom: string = "Registrar";
  public form!: FormGroup;//el ! significa “Voy a inicializar form más adelante (por ejemplo, en ngOnInit), así que no me des error ahora.”
  public rallies: Rally[] = [];
  public ralli: string = 'Rally';
  public message: string = '';  //Mensaje de respuesta
  public messageType: 'success' | 'error' = 'success';  //Tipo de mensaje

  constructor(private fb: FormBuilder, private serrally: RalliesService, private ruta: Router,
    private notifications: NotificationsService) {
    this.textBottom = "Registrar";
  }

  /**
   * Inicializa el formulario reactivo y carga datos si se está editando un rally existente.
   */
  ngOnInit() {
    //console.log("Este es el valor del usuario al empezar", this.rally.id);
    //const usuarioId = this.route.snapshot.params["id"];
    const esNuevo = this.rally.id === undefined;
    //He definido aquí el formulario para poder ponerle la coindición al password
    this.form = this.fb.group({
      //Declaramos los diferente campos del formulario
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      fecha_inicio: ['', [Validators.required]],
      fecha_fin: ['', [Validators.required]],
      limite_fotos_participante: ['', [Validators.required, Validators.min(1)]], // Establecer "participante" como valor por defecto
      fecha_fin_votacion: ['', [Validators.required]],
    }, {
      validators: [this.fechasValidas()]
    }
    );

    if (this.rally.id != undefined && this.rally.id != -1) {
      this.textBottom = "Modificar"
      this.serrally.ObtenerRallyId(this.rally.id).subscribe({
        next: (res) => {
          //console.log("Esto es lo que recibo de ObtenerUsuarioId", res);
          this.form.patchValue(res);//Así rellenamos los datos en el formulario con la respuesta del servidor
        },
        error: (error) => console.log("Esto es un error de selPersonaID")
      })
    }
    //console.log("Este el id del usuario que traigo a editar", this.rally.id);
  }

  /**
   * Configura los eventos para permitir el arrastre del formulario por el handle.
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
   * Evento que se ejecuta al mover el mouse durante el arrastre.
   * Actualiza la posición del formulario según el cursor.
   * @param {MouseEvent} event Evento del movimiento del mouse.
   */
  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const target = this.dragTarget.nativeElement;
      target.style.left = `${event.clientX - this.offsetX}px`;
      target.style.top = `${event.clientY - this.offsetY}px`;
    }
  };

  /**
  * Evento que se ejecuta al soltar el mouse.
  * Finaliza el arrastre y elimina los listeners.
  */
  private onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

 /**
   * Envía los datos del formulario para crear o modificar un rally.
   * 
   * - Realiza una copia profunda del formulario para evitar modificar el objeto original.
   * - Convierte el campo id_rally a número para evitar problemas de tipo.
   * - Si existe un id, se asume que es una modificación; si no, es un registro nuevo.
   * - En caso de modificación, elimina la propiedad password para no enviarla al backend.
   * - Se suscribe a la respuesta del servidor y maneja tanto el caso de éxito como el de error.
   * - Emite eventos a través de `formClosed` para informar al componente padre sobre el resultado.
   * - Utiliza `notifications.showToast` para mostrar mensajes breves y visuales al usuario:
   *    - En caso de éxito, muestra un toast verde indicando que la acción fue completada.
   *    - En caso de error, muestra un toast rojo con el mensaje del error recibido.
   * - Si es un registro nuevo exitoso, también limpia el formulario y puede redirigir al login.
   * 
   * Los **toasts** son pequeñas ventanas emergentes que se muestran temporalmente, usualmente en una esquina,
   * para notificar al usuario sin interrumpir su flujo de trabajo. Aquí se usan para confirmar que el rally
   * fue modificado o registrado correctamente, o para mostrar errores si ocurren.
   */
  onSubmit() {
    //Hacemos una copia profunda de lo que tenemos en el formulario
    const formData = JSON.parse(JSON.stringify(this.form.value));
    //Convierte id_rally a un número (puede ser entero o flotante dependiendo del valor)
    formData.id_rally = Number(formData.id_rally);
    //console.log("Esto es lo que mando en el formulario", formData);
    if (this.rally.id != undefined && this.rally.id != -1) {
      //console.log("Estoy editando el rally", this.rally.id);
      delete formData.password; //Borramos la propiedad password del objeto formData
      this.serrally.ModificaRally(formData, this.rally.id).subscribe({
        next: res => {
          //console.log("Respuesta del servidor al modficar rally", res);
          this.formClosed.emit({ success: true, message: "Editando", rally: res });
          this.notifications.showToast("Rally modificado con éxito", "success");
        },
        error: (err) => {
          this.notifications.showToast(err.message, "danger");
        }
      });
    } else {
      this.serrally.AnadeRally(formData).subscribe({
        next: res => {
          //console.log("Rally añadido correctamente", res);
          this.formClosed.emit({ success: true, message: "Añadiendo", rally: res });
          this.form.reset();  //Limpiamos el formulario tras el registro
          if (this.rally.id === undefined) {
            this.ruta.navigate(["/login"]);
          }
          this.notifications.showToast("Rally registrado con éxito", "success");
        },
        error: (err) => {
          //console.log("Este es el mensaje de error", err);
          //Verifica si existe el error de validación en datos.email
          if (err?.error?.errors?.['datos.email']) {
            this.message = "Este rally ya ha sido registardo";  //Primer mensaje de error
          } else if (err?.error?.message) {
            this.message = err.error.message;  //Mensaje general de error
          } else {
            this.message = 'Error al registrar el rally. Intenta nuevamente.';
          }

          this.messageType = 'error';  // Define el tipo de mensaje como error
        }
      });
    }
  }

   /**
   * Cancela la operación actual y emite un evento para cerrar el formulario.
   * Si es un rally nuevo, redirige a la página principal.
   */
  onCancel() {
    this.formClosed.emit({ success: false, rally: this.rally });
    if (this.rally.id === undefined) {
      this.ruta.navigate(["/"]);
    }
  }

  /**
   * Validador personalizado que verifica la validez de las fechas.
   * - La fecha de inicio no puede ser posterior a la fecha de fin.
   * - La fecha de fin de votación debe estar entre la fecha de inicio y fin.
   * @returns {(form: FormGroup) => {[key: string]: any} | null} Función validadora
   */
  fechasValidas() {
    return (form: FormGroup): { [key: string]: any } | null => {
      const inicio = new Date(form.get('fecha_inicio')?.value);
      const fin = new Date(form.get('fecha_fin')?.value);
      const finVotacion = new Date(form.get('fecha_fin_votacion')?.value);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || isNaN(finVotacion.getTime())) {
        return null; //No valida si las fechas no son válidas
      }

      if (inicio > fin) {
        return { fechaInvalida: 'La fecha de inicio no puede ser posterior a la fecha de fin' };
      }

      if (finVotacion < inicio || finVotacion > fin) {
        return { votacionFueraDeRango: 'La fecha de votación debe estar entre el inicio y el fin' };
      }

      return null; //Todo bien
    };
  }
}
