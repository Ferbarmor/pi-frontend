import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent {
  currentIndex = 0;
  intervalId: any;
  isMobile = false;
  slides = [
    {
      title: 'SnapTapea en primavera',
      class: 'ninoescalada',
      content: '',
      specialText: true
    },
    {
      title: 'Siente la pasión de la imagen',
      class: 'bici',
      content: ''
    },
    {
      title: 'La primavera, la sangre...',
      class: 'buceo',
      content: ''
    },
  ];

  ngOnInit() {
    this.checkScreenSize();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  @ViewChild('slideContainer', { static: false }) slideContainer!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 10000);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  private scrollToCurrentSlide() {
    const container = this.slideContainer?.nativeElement as HTMLElement;
    if (!container) return;

    const slideWidth = container.offsetWidth * 0.85; // 85% porque usas eso como ancho en móvil
    container.scrollTo({
      left: slideWidth * this.currentIndex,
      behavior: 'smooth'
    });
  }

}



