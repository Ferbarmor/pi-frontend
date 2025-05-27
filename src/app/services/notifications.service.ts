import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NotificationsService {

  constructor() { }

  /**
   * Muestra un toast (notificación emergente) en pantalla con un mensaje y estilo personalizado.
   * 
   * @param message El texto que se mostrará en la notificación.
   * @param type El tipo de notificación: 'success' para éxito (verde), 'danger' para error (rojo). Por defecto 'success'.
   * @param duration Duración en milisegundos que estará visible la notificación. Por defecto 2000ms (2 segundos).
   */
  showToast(message: string, type: 'success' | 'danger' = 'success', duration: number = 2000): void {
    //Crear un elemento div que contendrá la notificación
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed top-50 start-50 translate-middle bg-${type} text-white`;
    toast.style.zIndex = '9999';
    toast.style.padding = '15px';
    toast.style.borderRadius = '8px';
    toast.style.minWidth = '250px';
    toast.style.textAlign = 'center';
    toast.innerHTML = message;

    //Inserta el mensaje de la notificación
    document.body.appendChild(toast);
    //Elimina el toast después de la duración especificada para que desaparezca
    setTimeout(() => toast.remove(), duration);
  }
}
