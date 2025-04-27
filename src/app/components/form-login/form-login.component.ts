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
  @ViewChild('dragHandle') dragHandle!: ElementRef;
  @ViewChild('dragTarget') dragTarget!: ElementRef;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  public form: FormGroup;
  public message: string = '';  // Mensaje de respuesta
  public messageType: 'success' | 'error' = 'success';  // Tipo de mensaje
  constructor(private fb: FormBuilder, private notifications: NotificationsService,
    private serviceauth: AuthService, private ruta: Router) {
    this.form = this.fb.group({
      //Declaramos los diferente campos del formulario
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit() {
  }

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

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const target = this.dragTarget.nativeElement;
      target.style.left = `${event.clientX - this.offsetX}px`;
      target.style.top = `${event.clientY - this.offsetY}px`;
    }
  };

  private onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  onSubmit() {

    this.serviceauth.login(this.form.value).subscribe({

      next: res => {

        console.log("Usuario logeado correctamente", res);
        this.notifications.showToast("Logueado con éxito", "success");
        this.ruta.navigate(["/"]);
      },
      error: (err) => {
        console.log("Error al logearse", err);
        this.message = err.message;
        this.messageType = 'error';
        //this.form.reset();
        //this.notifications.showToast(this.message, "danger");
      }
    });
  }

}
