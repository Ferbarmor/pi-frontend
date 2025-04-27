import { Component } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  imports: [],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent {
  constructor() {
    this.startAutoSlide();
  }

  nextSlide() {
    const items = document.querySelectorAll('.item');
    const slideContainer = document.querySelector('.slide');
    if (slideContainer) {
      slideContainer.appendChild(items[0] as Node);
    }
  }

  prevSlide() {
    const items = document.querySelectorAll('.item');
    const slideContainer = document.querySelector('.slide');
    if (slideContainer && items.length > 0) {
      slideContainer.prepend(items[items.length - 1] as Node);
    }
  }

  startAutoSlide() {
    setInterval(() => this.nextSlide(), 10000);
  }

}
// Inicializa el carrusel
const carousel = new CarruselComponent();


