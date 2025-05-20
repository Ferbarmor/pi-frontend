import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PasswordresetService } from '../../services/passwordreset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private resetService: PasswordresetService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      //this.email = params['email'] || '';

      /*if (!this.token || !this.email) {
        this.error = 'Token o email no proporcionados';
      }*/
      if (!this.token) {
        this.error = 'Token no proporcionado';
      }
    });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('password_confirmation')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token) {
      this.error = 'Por favor complete todos los campos correctamente';
      return;
    }

    const formData = {
      token: this.token,
      email: this.form.value.email,
      password: this.form.value.password,
      password_confirmation: this.form.value.password_confirmation
    };

    this.resetService.resetPassword(formData).subscribe({
      next: (res) => {
        this.message = 'Contraseña actualizada correctamente';
        this.error = '';
        this.form.reset();
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 422) {
          // Manejo de errores de validación del servidor
          const errors = err.error.errors;
          this.error = '';
          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              this.error += errors[key].join('\n') + '\n';
            }
          }
        } else {
          this.error = err.error?.message || 'Error al actualizar la contraseña';
        }
      }
    });
  }
}