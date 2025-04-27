import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Rally } from '../models/rally';


@Injectable({
  providedIn: 'root'
})
export class RalliesService {

  private url =environment.API_URL+"/rallies";//Así llamamos a la url si tener que escribirla entera
  constructor(private serrallies: HttpClient) { }
  
  ListarRallies(){
    console.log("Que pasa mi jarma. Estamos en anadeTest");
    let body = {
      accion: "ListarRallies"
      //Este es el atributo que tenemos en servicio (acordarse de poner el mismo npobre del atributo al objeto que pasas)
    };
    return this.serrallies.post<Rally[]>(this.url,body);


  }
}
