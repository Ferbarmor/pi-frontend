import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoaderService } from './services/loader.service';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule, AsyncPipe, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush  // Usamos OnPush para optimizar la detección de cambios
})
export class AppComponent {
  title = 'pifrontend';
  constructor(public loaderService: LoaderService) {} 
  /*constructor(private router: Router, public loaderService: LoaderService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();  // Mostrar el loader cuando empieza la navegación
      } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
        this.loaderService.hide();  // Ocultar el loader cuando termine la navegación
      }
    });
  }*/
}
