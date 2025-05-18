import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showFooter = false;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    // Mostrar footer cuando estemos a 100px del final
    this.showFooter = (scrollPosition + windowSize) >= (bodyHeight - 100);
  }

}
