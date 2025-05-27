import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Photo } from '../models/photo';
@Injectable({
  providedIn: 'root'
})

export class FotografiasService {
  private url = environment.API_URL + "/fotografias";//Así llamamos a la url si tener que escribirla entera
  constructor(private serfotografias: HttpClient) { }

  AnadeFotografia(formData: FormData) {
    formData.append('accion', 'AnadeFotografia');
    return this.serfotografias.post(this.url, formData);
  }

  ListarFotografiasPorUsuario(usuario_id: number) {
    //console.log("Estoy en listar fotografías por usuario", usuario_id);
    const body = {
      accion: "ListarFotografiasPorUsuario",
      usuario_id: usuario_id
    };
    return this.serfotografias.post<Photo[]>(this.url, body);
  }

  ListarFotografias() {
    const body = {
      accion: "ListarFotografias"
    };
    return this.serfotografias.post<Photo[]>(this.url, body);//Tipo el resultado
  }

  ObtenerFotografiaId(id: number) {
    const body = {
      accion: "ObtenerFotografiaId",
      id: id
    };
    return this.serfotografias.post<Photo>(this.url, body);
  }

  ModificaFotografia(photo: Photo, id: number) {
    //console.log("Estoy en modificar foto", photo, id);
    const body = {
      accion: "ModificaFotografia",
      id: id,
      datos: photo
    };
    //console.log("Este es el cuerpo que mando al servidor", body);
    return this.serfotografias.post<Photo>(this.url, body);
  }

  BorraFotografia(id: number) {
    //console.log("Estoy en borrar foto");
    let body = {
      accion: "BorraFotografia",
      id: id
    };
    //console.log("Este es el cuerpo que mando al servidor", body)

    return this.serfotografias.post<Photo>(this.url, body);
  }

}
