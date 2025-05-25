import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FotografiasService } from '../../services/fotografias.service';
import { Photo } from '../../models/photo';
import { Input, Output, EventEmitter, OnInit } from '@angular/core'
import { NotificationsService } from '../../services/notifications.service';
import { RalliesService } from '../../services/rallies.service';
import { Rally } from '../../models/rally';

@Component({
  selector: 'app-form-upload-photo',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './form-upload-photo.component.html',
  styleUrl: './form-upload-photo.component.css'
})
export class FormUploadPhotoComponent {
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  @Input() photo: Photo = <Photo>{};
  @Output() formClosed = new EventEmitter<{ success: boolean, message?: string, photo?: Photo }>();
  public textBottom: string = "Subir";
  public form!: FormGroup;
  public fImagen: File | null = null;
  public inputFile: any = null;
  public imagen64: string = "";
  public message: string = '';  // Mensaje de respuesta
  public messageType: 'success' | 'error' = 'success';  // Tipo de mensaje
  public navRegister: number = 0;
  public isUploaded: boolean = false;
  public usuId: number = 0;
  public rally: Rally = <Rally>{};
  public votacionFinalizada: Boolean = false;
  public isUploading: boolean = false;

  constructor(private fb: FormBuilder, private serAuth: AuthService, private serphoto: FotografiasService,
    private ruta: Router, private notifications: NotificationsService, private serrally: RalliesService) {
    this.textBottom = "Subir";
  }

  ngOnInit() {
    this.usuId = this.serAuth.getCurrentUser().id;
    console.log("Id de la foto", this.photo.id);
    //const usuario = this.serAuth.getCurrentUser();
    const esNueva = this.photo.id === undefined;
    this.serrally.ObtenerRallyId(1).subscribe({
      next: res => {
        console.log("Resultado de los rallies ", res)
        this.rally = res;
        this.votacionFinalizada = new Date(this.rally.fecha_fin_votacion) < new Date();
      },
      error: error => console.log("Esto es un eror del servidor", error)
    });
    this.form = this.fb.group({
      //Declaramos los diferente campos del formulario
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(2)]],
      archivo: esNueva ? ['', Validators.required] : [''],
    });

    if (this.photo.id != undefined) {
      this.textBottom = "Modificar"
      this.serphoto.ObtenerFotografiaId(this.photo.id).subscribe({
        next: (res) => {
          this.form.patchValue(res);//Así rellenamos los datos en el formulario con la respuesta del servidor
        },
        error: (error) => console.log("Esto es un error al obtener foto por id", error)
      })
    }
  }

  leerImagen(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.inputFile = input;
      this.fImagen = input.files[0];
      console.log("fImagen: ", this.fImagen);

      const reader = new FileReader();
      reader.onloadend = () => {
        this.imagen64 = reader.result as string;
      };
      reader.readAsDataURL(this.fImagen);
    } else {
      // Si no hay archivo seleccionado (o lo ha quitado), limpiamos todo:
      this.fImagen = null;
      this.imagen64 = '';
      this.inputFile = null;
    }
  }

  onSubmit() {
    if (this.photo.id != undefined) {
      console.log("Estoy editando una foto", this.photo.id);
      const formData = this.form.value;
      delete formData.archivo;
      console.log("Lo que le mando de la foto", formData);//Borramos la propiedad archivo del objeto 
      this.serphoto.ModificaFotografia(formData, this.photo.id).subscribe({

        next: res => {
          this.isUploading = false;
          console.log("Respuesta del servidor al modficar Usuario", res);
          this.formClosed.emit({ success: true, message: "Editando", photo: res });
          this.notifications.showToast("Fotografía modificada con éxito", "success");
        },
        error: (err) => {
          this.isUploading = false;
          console.log("Error al modificar la foto", err);
          this.notifications.showToast(err.mesagge, "danger");
        }
      });
    } else {
      const formData = new FormData();
      // Construimos el objeto FormData como espera la API
      const datos = {
        titulo: this.form.value.titulo,
        descripcion: this.form.value.descripcion,
        usuario_id: this.serAuth.getCurrentUser().id,  //Sacamos el usuario actual
        rally_id: this.serAuth.getCurrentUser().id_rally  //Id del rally
      };
      formData.append('datos[titulo]', datos.titulo);
      formData.append('datos[descripcion]', datos.descripcion);
      formData.append('datos[usuario_id]', datos.usuario_id);
      formData.append('datos[rally_id]', datos.rally_id);
      formData.append('archivo', this.fImagen!);
      console.log("Esto es lo que mando en el formulario", formData);
      this.serphoto.AnadeFotografia(formData).subscribe({
        next: res => {
          this.isUploading = false;
          console.log("Foto subida correctamente", res);
          this.message = "Foto subida con éxito";
          this.messageType = "success";
          this.form.reset();
          this.imagen64 = '';
          this.fImagen = null;
          this.isUploaded = true;
        },
        error: err => {
          this.isUploading = false;
          console.log("Error al subir la foto", err);
          const erroresValidacion = err?.error?.errors;
          const errorCustom = err?.error?.error;
          if (erroresValidacion && erroresValidacion.archivo) {
            this.message = erroresValidacion.archivo[0];
          } else if (errorCustom) {
            this.message = errorCustom;
          } else {
            this.message = 'Error al subir la foto. Intenta nuevamente.';
          }
          this.messageType = 'error';
        }
      });
    }
  }

  onCancel() {
    this.formClosed.emit({ success: false });
    if (this.photo.id === undefined) {
      this.ruta.navigate(["/"]);
    }
  }
}
