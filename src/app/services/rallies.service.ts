import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Rally } from '../models/rally';

@Injectable({
  providedIn: 'root'
})

export class RalliesService {

  private url = environment.API_URL + "/rallies";//Así llamamos a la url si tener que escribirla entera
  constructor(private serrallies: HttpClient) { }

  ListarRallies() {
    let body = {
      accion: "ListarRallies"
      //Este es el atributo que tenemos en servicio (acordarse de poner el mismo npobre del atributo al objeto que pasas)
    };
    return this.serrallies.post<Rally[]>(this.url, body);
  }

  ObtenerRallyId(id: number) {
    //console.log("Estoy en obtener rally por id", id);
    let body = {
      accion: "ObtenerRallyId",
      id: id
      //Este es el atributo que tenemos en servicio (acordarse de poner el mismo nombre del atributo al objeto que pasas)
    };
    return this.serrallies.post<Rally>(this.url, body);
  }

  AnadeRally(rally: Rally) {
    //console.log("Estoy en añadir rally", rally);
    let body = {
      accion: "AnadeRally",
      datos: rally
    };
    return this.serrallies.post<Rally>(this.url, body);
  }

  ModificaRally(rally: Rally, id: number) {
    //console.log("Estoy en modificar rally", rally, id);
    let body = {
      accion: "ModificaRally",
      id: id,
      datos: rally
    };
    //console.log("Este es el cuerpo que mando al servidor en modificar rally", body);
    return this.serrallies.post<Rally>(this.url, body);
  }

  BorraRally(id: number) {
    //console.log("Estoy en borrar rally", id);
    let body = {
      accion: "BorraRally",
      id: id
    };
    return this.serrallies.post<Rally>(this.url, body);
  }
}
