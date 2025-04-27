import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loadingSubject = new BehaviorSubject<boolean>(false);  // Valor por defecto false (no cargando)
  public isLoading$ = this.loadingSubject.asObservable();

  show() {
    setTimeout(() => {
      this.loadingSubject.next(true);  //Establece el estado a true después de un ciclo
    });
  }

  hide() {
    setTimeout(() => {
      this.loadingSubject.next(false);  //Establece el estado a false después de un ciclo
    });
  }
 /* hide(delayMs: number = 2000) {  // 👈 delay opcional de 300ms por defecto
    setTimeout(() => {
      this.loadingSubject.next(false);
    }, delayMs);
  }*/
}
