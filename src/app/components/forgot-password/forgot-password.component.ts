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
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  ngOnInit(): void {
    console.log('ForgotPasswordComponent initialized');
  }
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
