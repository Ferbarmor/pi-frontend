import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private url = environment.API_URL + "/usuarios";//Así llamamos a la url si tener que escribirla entera
  constructor(private serregister: HttpClient) { }

  AnadeUsuario(usuario: Usuario) {
    console.log("Estoy en añadir usuario");
    let body = {
      accion: "AnadeUsuario",
      datos: usuario
    };
    console.log("Este es el cuerpo que mando al servidor", body)

    return this.serregister.post<Usuario>(this.url, body);
  }

  ListarUsuarios() {
    console.log("Estoy en listar usuarios");
    let body = {
      accion: "ListarUsuarios",
    };
    console.log("Este es el cuerpo que mando al servidor", body)

    return this.serregister.post<Usuario[]>(this.url, body);
  }

  ObtenerUsuarioId(id: number) {
    console.log("Estoy en obtener usuario por id");
    let body = {
      accion: "ObtenerUsuarioId",
      id: id
    };
    console.log("Este es el cuerpo que mando al servidor", body)

    return this.serregister.post<Usuario>(this.url, body);
  }

  ModificaUsuario(usuario: Usuario, id: number) {
    console.log("Estoy en modificar usuario");
    let body = {
      accion: "ModificaUsuario",
      id: id,
      datos: usuario
    };
    console.log("Este es el cuerpo que mando al servidor", body)

    return this.serregister.post<Usuario>(this.url, body);
  }

  BorraUsuario(id: number) {
    console.log("Estoy en borrar usuario");
    let body = {
      accion: "BorraUsuario",
      id: id
    };
    console.log("Este es el cuerpo que mando al servidor", body)

    return this.serregister.post<Usuario>(this.url, body);
  }



}
