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
  imports: [CarruselComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  public fotos: Photo[] = [];
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen = false;
  public isLoggedIn = false;
  public votacionFinalizada: Boolean = false;
  public currentPage = 1;
  public itemsPerPage = 8; //Ajustamos este número según necesidad
  public totalPages = 0;

  constructor(private serphoto: FotografiasService,
    private servoto: VotosService,
    private notifications: NotificationsService, private serAuth: AuthService) { }
  ngOnInit() {
    this.loadPhotos();
    this.isLoggedIn = this.serAuth.getCurrentUser() !== null;

  }
  private loadPhotos() {
    this.serphoto.ListarFotografias().subscribe({
      next: fotos => {
        console.log("Fotos que traigo", fotos);
        this.votacionFinalizada = new Date(fotos[0].rally.fecha_fin_votacion) < new Date();
        const list = fotos.filter(f => f.estado === 'aprobada');
        //this.processPhotoData(list);
        //Ordenamos por ranking ascendente
        list.sort((a, b) => {
          const rankA = a.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          const rankB = b.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        this.fotos = list;
        //Para sacar las páginas que quiero segun las fotos por página que indico en la variable a ajustar
        this.totalPages = Math.ceil(this.fotos.length / this.itemsPerPage);
      },
      error: err => {
        console.error("Error cargando fotos", err);
        this.notifications.showToast("Error cargando fotos", "danger");
      }
    });
  }

  //Si quiesiéramos ortdenar las fotos en el front y no volver a caragr las fotos desde el servidor. Pero hay un problema con el orden si cargo las fotos desde el servidor
  /* private processPhotoData(fotos: Photo[]) {
     fotos.forEach(f => {
       f.votos = f.votos || [];
       f.estadistica = f.estadistica || { id: 0, fotografia_id: f.id, ranking: 0, total_votos: 0 };
     });
     this.fotos = this.updateAllPhotoStats(fotos);
   }
 
   private updateAllPhotoStats(list: Photo[]): Photo[] {
     list.forEach(f => f.estadistica!.total_votos = f.votos.length);
 
     //Ordenamos primero por votos DESC, y si hay empate, por ID ASC
     const byVotes = [...list].sort((a, b) => {
       const diff = b.votos.length - a.votos.length;
       return diff !== 0 ? diff : a.id - b.id;
     });
     byVotes.forEach((f, i) => f.estadistica!.ranking = i + 1);
 
     const byRanking = [...byVotes].sort((a, b) => a.estadistica!.ranking - b.estadistica!.ranking);
     console.log("Ranking", byRanking);
     return byRanking;
   }
   */
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
        //foto.votos.push(res);
        localStorage.setItem(`votado_${fotoId}`, res.id!.toString());
        //this.fotos = this.updateAllPhotoStats(this.fotos);
        this.loadPhotos();
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
    const r = Math.floor(Number(f.estadistica?.ranking ?? 0));
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

  paginatedFotos(): Photo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.fotos.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}