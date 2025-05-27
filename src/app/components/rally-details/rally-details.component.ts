import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Rally } from '../../models/rally';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rally-details',
  imports: [DatePipe],
  templateUrl: './rally-details.component.html',
  styleUrl: './rally-details.component.css'
})
export class RallyDetailsComponent {
  @Input() rally: Rally = <Rally>{}; //Recibimos un objeto rally desde el componente padre para mostrar sus detalles
  @Output() detailsClosed = new EventEmitter<{ success: boolean, message?: string, rally?: Rally }>();   //Emitimos un evento cuando se cierra la vista de detalles, enviando un objeto con éxito y mensaje opcional
  constructor() { }
  ngOnInit() {
    //console.log("Este es el valor del rally al empezar", this.rally);
  }

  /**
  * Método para cerrar la vista de detalles.
  * Emite el evento `detailsClosed` con un objeto que indica éxito.
  * Esto permite al componente padre reaccionar al cierre del detalle.
  */
  closeDetails() {
    this.detailsClosed.emit({ success: true });
  }

}
