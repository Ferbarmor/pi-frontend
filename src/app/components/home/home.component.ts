import { Component } from '@angular/core';
import { CarruselComponent } from "../carrusel/carrusel.component";
import { FotografiasService } from '../../services/fotografias.service';
import { Photo } from '../../models/photo';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormUploadPhotoComponent } from "../form-upload-photo/form-upload-photo.component";
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { VotosService } from '../../services/votos.service';
import { Voto } from '../../models/voto';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-home',
  imports: [CarruselComponent, CommonModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  public fotos: Photo[] = [];
  public isLoading = false;
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen = false;
  public isLoggedIn = false;
  public votacionFinalizada: Boolean = false;

  constructor(private serphoto: FotografiasService,
    private servoto: VotosService,
    private notifications: NotificationsService, private serAuth: AuthService) { }
  ngOnInit() {
    this.loadPhotos();
    this.isLoggedIn = this.serAuth.getCurrentUser() !== null;

  }
  private loadPhotos() {
    this.isLoading = true;
    this.serphoto.ListarFotografias().subscribe({
      next: fotos => {
        this.votacionFinalizada = new Date(fotos[0].rally.fecha_fin_votacion) < new Date();
        const list = fotos.filter(f => f.estado === 'aprobada');
        this.processPhotoData(list);
        this.isLoading = false;
      },
      error: err => {
        console.error("Error cargando fotos", err);
        this.notifications.showToast("Error cargando fotos", "danger");
        this.isLoading = false;
      }
    });
  }

  private processPhotoData(fotos: Photo[]) {
    fotos.forEach(f => {
      f.votos = f.votos || [];
      f.estadistica = f.estadistica || { id: 0, fotografia_id: f.id, ranking: 0, total_votos: 0 };
    });
    this.fotos = this.updateAllPhotoStats(fotos);
  }

  private updateAllPhotoStats(list: Photo[]): Photo[] {
    list.forEach(f => f.estadistica!.total_votos = f.votos.length);
    const sorted = [...list].sort((a, b) => b.votos.length - a.votos.length);
    sorted.forEach((f, i) => f.estadistica!.ranking = i + 1);
    return sorted;
  }

  votarAnularFoto(fotoId: number) {
    const storedId = localStorage.getItem(`votado_${fotoId}`);
    const foto = this.fotos.find(f => f.id === fotoId);
    if (!foto) return;

    /*if (storedId) {
      // ANULAR
      this.servoto.BorraVotacion(Number(storedId)).subscribe({
        next: () => {
          foto.votos = foto.votos.filter(v => v.id !== Number(storedId));
          localStorage.removeItem(`votado_${fotoId}`);
          this.fotos = this.updateAllPhotoStats(this.fotos);
          this.notifications.showToast("Voto anulado con éxito", "success");
        },
        error: () => this.notifications.showToast("No se pudo anular voto", "danger")
      });
    } else {*/
    const nuevo: Voto = { id_fotografia: fotoId, id_usuario: 0 }; // Usuario anónimo
    this.servoto.AnadeVotacion(nuevo).subscribe({
      next: (res) => {
        foto.votos.push(res);
        localStorage.setItem(`votado_${fotoId}`, res.id!.toString());
        this.fotos = this.updateAllPhotoStats(this.fotos);
        this.notifications.showToast("Voto registrado con éxito", "success");
      },
      error: (err) => {
        console.log("Error al votar", err);
        this.notifications.showToast(err.error.message, "danger");
      }
    });

  }

  haVotado(fotoId: number): boolean {
    return !!localStorage.getItem(`votado_${fotoId}`);
  }

  getVotosPorFoto(f: Photo): number {
    return f.votos.length;
  }

  getRankingPorFoto(f: Photo): string {
    const r = f.estadistica?.ranking;
    if (!r) return '-';

    //Obtenemos el sufijo ordinal
    const lastDigit = r % 10; //Última cifra del número
    const isTeens = (r >= 11 && r <= 13); //Caso especial para 11º, 12º, 13º
    const emojis = ['🥇', '🥈', '🥉'];
    //Determinamos el emoji si está en top 3
    const emoji = r >= 1 && r <= 3 ? emojis[r - 1] : '';
    if (isTeens) {
      return `${r}º${emoji}`; //Excepciones de 11º, 12º, 13º
    }

    switch (lastDigit) {
      case 1: return `${r}º${emoji}`;
      case 2: return `${r}º${emoji}`;
      case 3: return `${r}º${emoji}`;
      default: return `${r}º${emoji}`;
    }
  }

  getUrl(ruta: string) {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  verFotoGrande(url: string) {
    this.selectedFotoUrl = url;
    this.isFotoModalOpen = true;
  }

  cerrarModal() {
    this.isFotoModalOpen = false;
    this.selectedFotoUrl = null;
  }

  // Aquí puedes agregar métodos y propiedades adicionales según sea necesario
}