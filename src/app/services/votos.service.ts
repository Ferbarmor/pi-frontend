import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Voto } from '../models/voto';

@Injectable({
  providedIn: 'root'
})

export class VotosService {
  private url = environment.API_URL + "/votaciones";
  constructor(private servotos: HttpClient) { }

  ListarVotaciones() {
    //console.log("Estoy en listar usuarios");
    let body = {
      accion: "ListarVotaciones",
    };
    //console.log("Este es el cuerpo que mando al servidor", body)

    return this.servotos.post<Voto[]>(this.url, body);

  }

  AnadeVotacion(voto: Voto) {
    //console.log("Estoy en añadir voto");
    let body = {
      accion: "AnadeVotacion",
      datos: voto
    };
    //console.log("Este es el cuerpo que mando al servidor", body)

    return this.servotos.post<Voto>(this.url, body);
  }

  BorraVotacion(id: number) {
    //console.log("Estoy en borrar voto");
    let body = {
      accion: "BorraVotacion",
      id: id
    };
    //console.log("Este es el cuerpo que mando al servidor", body)

    return this.servotos.post<Voto>(this.url, body);

  }
}
