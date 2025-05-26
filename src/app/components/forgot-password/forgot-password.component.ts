import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordresetService } from '../../services/passwordreset.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private resetService: PasswordresetService) {
    //Se crea el formulario reactivo con validación: el campo "email" es requerido y debe tener formato válido de correo
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
  * Se ejecuta una vez al iniciar el componente.
  * En este caso, solo muestra un mensaje de depuración en la consola.
  */
  ngOnInit(): void {
    console.log('ForgotPasswordComponent initialized');
  }

  /**
   * Envía el formulario al servicio de recuperación de contraseña.
   * 
   * Usa el servicio `PasswordresetService` para solicitar el envío de un enlace de restablecimiento
   * al correo electrónico proporcionado en el formulario. Este método maneja tanto la respuesta
   * exitosa como los posibles errores, actualizando los mensajes visibles al usuario en consecuencia.
   */
  onSubmit() {
    this.resetService.requestResetLink(this.form.value.email).subscribe({
      next: res => {
        this.message = 'Correo de recuperación enviado';
        this.error = '';
      },
      error: err => {
        this.error = 'Error al enviar el correo';
        this.message = '';
      },
    });
  }
}
