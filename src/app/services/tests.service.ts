import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class TestsService {
  private url =environment.API_URL+"/tests";//Así llamamos a la url si tener que escribirla entera
  constructor(private sertests: HttpClient) { }

  getTests() {
    console.log("Que pasa mi jarma. Estamos en getTests");
    let body = {
      accion: "ListarTests"//Este es el atributo que tenemos en servicio (acordarse de poner el mismo npobre del atributo al objeto que pasas)
    };
    return this.sertests.post<any[]>(this.url,body);


  }

  anadeTest(){
    console.log("Que pasa mi jarma. Estamos en anadeTest");
    let body = {
      accion: "AnadeTest",
      name: "Prueba de añadir",
      description: "Esto es tu prima en barca"
      //Este es el atributo que tenemos en servicio (acordarse de poner el mismo npobre del atributo al objeto que pasas)
    };
    return this.sertests.post<any[]>(this.url,body);


  }
}
