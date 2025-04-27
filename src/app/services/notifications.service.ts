import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor() { }
  showToast(message: string, type: 'success' | 'danger' = 'success', duration: number = 2000): void {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed top-50 start-50 translate-middle bg-${type} text-white`;
    toast.style.zIndex = '9999';
    toast.style.padding = '15px';
    toast.style.borderRadius = '8px';
    toast.style.minWidth = '250px';
    toast.style.textAlign = 'center';
    toast.innerHTML = message;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
}
