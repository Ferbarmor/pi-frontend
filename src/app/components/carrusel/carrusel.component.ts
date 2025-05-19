import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

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
    {
      title: 'Capta la esencia',
      class: 'crossfit',
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
    const slideElement = document.querySelector(`.slide-container .item:nth-child(${this.currentIndex + 1})`);
    if (slideElement) {
      slideElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

}



