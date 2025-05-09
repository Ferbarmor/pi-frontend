import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Estadistica } from '../models/estadistica';
@Injectable({
  providedIn: 'root'
})
export class EstadisticaService {
  private url = environment.API_URL + "/estadisticas";
  constructor(private serestad: HttpClient) { }
  ListarEstadisticas() {
    const body = {
      accion: "ListarEstadisticas"
    };
    return this.serestad.post<Estadistica[]>(this.url, body);
  }

  EstadisticasRally(id: number) {
    const body = {
      accion: "EstadisticasRally",
      rally_id: id
    };
    return this.serestad.post<Estadistica[]>(this.url, body);
  }
}
