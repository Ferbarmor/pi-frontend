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

  /**
   * Lista de diapositivas que se mostrarán en el carrusel.
   * Cada objeto contiene título, clase CSS, contenido y si tiene texto especial.
   */
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

  /**
   * Método que se ejecuta al inicializar el componente.
   * Inicializa la detección del tamaño de pantalla y comienza el deslizamiento automático.
   */
  ngOnInit() {
    this.checkScreenSize();
    this.startAutoSlide();
  }

  /**
   * Método que se ejecuta cuando el componente se destruye.
   * Se utiliza para detener el deslizamiento automático y liberar recursos.
   */
  ngOnDestroy() {
    this.stopAutoSlide();
  }

  /**
   * Referencia al contenedor HTML que envuelve las diapositivas.
   * Se usa para controlar el scroll en dispositivos móviles.
   */
  @ViewChild('slideContainer', { static: false }) slideContainer!: ElementRef;

  /**
   * Listener que detecta el evento de cambio de tamaño de ventana.
   * Actualiza la variable `isMobile` para adaptar el comportamiento del carrusel.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  /**
  * Verifica si la ventana actual tiene un ancho menor a 768px
  * y actualiza la variable `isMobile` para indicar si es móvil o no.
  */
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
  * Inicia un intervalo que avanza automáticamente a la siguiente diapositiva cada 10 segundos.
  * Antes de iniciar, se asegura de detener cualquier intervalo previo para evitar duplicados.
  */
  startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 10000);
  }

  /**
   * Detiene el intervalo automático de cambio de diapositiva si existe.
   * Esto ayuda a evitar que el intervalo siga ejecutándose al destruir el componente.
   */
  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
  * Avanza a la siguiente diapositiva en el carrusel.
  * Si se visualiza en móvil, desplaza el contenedor para mostrar la diapositiva actual suavemente.
  */
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  /**
   * Retrocede a la diapositiva anterior en el carrusel.
   * Si se visualiza en móvil, desplaza el contenedor para mostrar la diapositiva actual suavemente.
   */
  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  /**
  * Cambia la diapositiva actual a la indicada por el índice recibido.
  * Si se visualiza en móvil, desplaza el contenedor para mostrar la diapositiva seleccionada suavemente.
  * 
  * @param index Índice de la diapositiva a mostrar.
  */
  goToSlide(index: number) {
    this.currentIndex = index;
    if (this.isMobile) {
      this.scrollToCurrentSlide();
    }
  }

  /**
   * Realiza un desplazamiento horizontal suave del contenedor para mostrar la diapositiva actual.
   * Esta función se usa principalmente en dispositivos móviles donde el carrusel se desplaza en horizontal.
   */
  private scrollToCurrentSlide() {
    const container = this.slideContainer?.nativeElement as HTMLElement;
    if (!container) return;

    const slideWidth = container.offsetWidth * 0.85; //Se calcula el ancho aproximado de cada slide, considerando un 85% del ancho del contenedor
    container.scrollTo({
      left: slideWidth * this.currentIndex,
      behavior: 'smooth'
    });
  }

}



