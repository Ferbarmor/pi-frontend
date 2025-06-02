import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showFooter = false;
  /**
  * @HostListener('window:scroll')
  * 
  * Este decorador permite que el método `onWindowScroll()` escuche directamente el evento de scroll del objeto global `window`.
  * 
  * ### ¿Para qué se usa?
  * Se utiliza para ejecutar lógica personalizada cada vez que el usuario se desplaza por la página. En este caso,
  * sirve para mostrar el footer sólo cuando el usuario ha llegado casi al final del contenido (a 100 píxeles del fondo).
  * 
  * ### ¿Cómo se usa?
  * Angular permite escuchar eventos del DOM directamente desde componentes usando el decorador `@HostListener`.
  * Al especificar `'window:scroll'`, le estamos diciendo a Angular que ejecute este método cada vez que se produce un scroll
  * en la ventana del navegador.
  * 
  * Este patrón es muy útil para animaciones, carga perezosa (lazy loading), mostrar elementos condicionalmente, o cualquier lógica
  * que dependa del desplazamiento de la página.
  */

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    //Muestra footer cuando estemos a 100px del final
    this.showFooter = (scrollPosition + windowSize) >= (bodyHeight - 100);
  }

}
