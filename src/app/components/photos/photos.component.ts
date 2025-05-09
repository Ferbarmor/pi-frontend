import { Component } from '@angular/core';
import { FotografiasService } from '../../services/fotografias.service';
import { Photo } from '../../models/photo';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormUploadPhotoComponent } from "../form-upload-photo/form-upload-photo.component";
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuarios.service';
import { NotificationsService } from '../../services/notifications.service';
import { VotosService } from '../../services/votos.service';
import { Voto } from '../../models/voto';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-photos',
  imports: [CommonModule, FormUploadPhotoComponent],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.css'
})
export class PhotosComponent {
  public showForm = false;
  public fotos: Photo[] = [];
  public nombreUsuario: string | undefined;
  public isAdmin = false;
  public isVoted = false;
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen = false;
  public isLoading = false;
  public selectedPhoto: Photo = <Photo>{};

  constructor(
    private serphoto: FotografiasService,
    private serAuth: AuthService,
    private route: ActivatedRoute,
    private seruser: UsuarioService,
    private ruta: Router,
    private notifications: NotificationsService,
    private servoto: VotosService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const usuario = this.serAuth.getCurrentUser()!;
      const usuId = Number(params.get("id"));
      this.isAdmin = usuario.rol === "administrador";
      this.isVoted = usuId === -1;
      this.nombreUsuario = usuario.nombre;
      this.loadPhotos(usuario, usuId);
      if (!this.isVoted) this.loadUsuario(usuId);
    });
  }

  private loadPhotos(usuario: Usuario, usuId: number) {
    this.isLoading = true;
    // UNA SOLA llamada: ListarFotografias o ListarFotografiasPorUsuario
    const obs = (!this.isAdmin && !this.isVoted)
      ? this.serphoto.ListarFotografiasPorUsuario(usuario.id)
      : this.isVoted
        ? this.serphoto.ListarFotografias()
        : this.serphoto.ListarFotografiasPorUsuario(usuId);

    obs.subscribe({
      next: fotos => {
        // Si es modo voto, filtramos estado y no incluir tus propias fotos
        console.log("Esto es lo que recibo al listar las fotos", fotos);
        let list = this.isVoted
          ? fotos.filter(f => f.estado === 'aprobada' && f.usuario_id !== usuario.id)
          : fotos;
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

  private loadUsuario(usuId: number) {
    this.seruser.ObtenerUsuarioId(usuId).subscribe({
      next: (res) => {
        console.log("Maricón");
        console.log("Esto es lo que recibo de ObtenerUsuarioId", res);
        this.nombreUsuario = res.nombre;
      },
      error: (error) => console.log("Esto es un error de selPersonaID")
    });
  }

  private processPhotoData(fotos: Photo[]) {
    // Asegura que exista array de votos y estadistica en cada foto
    fotos.forEach(f => {
      f.votos = f.votos || [];
      f.estadistica = f.estadistica || { id: 0, fotografia_id: f.id, ranking: 0, total_votos: 0 };
    });
    this.fotos = this.updateAllPhotoStats(fotos);
  }

  private updateAllPhotoStats(list: Photo[]): Photo[] {
    // 1. Recalcula total_votos en estadistica
    list.forEach(f => f.estadistica!.total_votos = f.votos.length);
    // 2. Ordena por total_votos descendente
    const sorted = [...list].sort((a, b) => b.votos.length - a.votos.length);
    // 3. Recalcula ranking 1-based
    sorted.forEach((f, i) => f.estadistica!.ranking = i + 1);
    return sorted;
  }

  votarAnularFoto(fotoId: number) {
    const usuario = this.serAuth.getCurrentUser()!;
    const foto = this.fotos.find(f => f.id === fotoId);
    if (!foto) return;

    const votoExistente = foto.votos.find(v => v.id_usuario === usuario.id);

    if (votoExistente) {
      // ANULA VOTO
      this.servoto.BorraVotacion(votoExistente.id!).subscribe({
        next: () => {
          foto.votos = foto.votos.filter(v => v.id_usuario !== usuario.id);
          this.fotos = this.updateAllPhotoStats(this.fotos);
          this.notifications.showToast("Voto anulado con éxito", "success");
        },
        error: () => this.notifications.showToast("No se pudo anular voto", "danger")
      });
    } else {
      // AÑADE VOTO
      const nuevo: Voto = { id_fotografia: fotoId, id_usuario: usuario.id };
      this.servoto.AnadeVotacion(nuevo).subscribe({
        next: (res) => {
          foto.votos.push(res);
          this.fotos = this.updateAllPhotoStats(this.fotos);
          this.notifications.showToast("Voto registrado con éxito", "success");
        },
        error: () => this.notifications.showToast("Error al votar", "danger")
      });
    }
  }

  // Helpers para plantilla
  haVotado(fotoId: number): boolean {
    const usuario = this.serAuth.getCurrentUser()!;
    const foto = this.fotos.find(f => f.id === fotoId);
    return !!foto?.votos.find(v => v.id_usuario === usuario.id);
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


  handleFormClose(result: { success: boolean, message?: string, photo?: Photo }) {
    console.log("Formulario cerrado, ¿con éxito?", result.success);
    console.log("usuario que he modificado", result.photo);
    this.showForm = false;
    this.selectedPhoto = <Photo>{}
    if (result.success && result.message == "Añadiendo") {
      this.fotos.push(result.photo!);
    } else if (result.success && result.message == "Editando") {
      //this.usuarios.find(e => e.id == result.usuario!.id)!.nombre = result.usuario!.nombre;
      const index = this.fotos.findIndex(e => e.id === result.photo!.id);
      if (index !== -1) {
        this.fotos[index] = result.photo!;
      }
    }
    // Puedes mostrar el mensaje si lo necesitas
  }

  borraFoto(id: number, nombre: string) {
    // Usando SweetAlert2 sin async/await
    Swal.fire({
      title: `¿Quieres eliminar a ${nombre}?`,
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serphoto.BorraFotografia(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', '', 'success');
            this.fotos = this.fotos.filter(photo => photo.id !== id);
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  editarFoto(photo: Photo) {
    console.log("Estoy editando la foto", photo);
    this.selectedPhoto = { ...photo };//Copia el objeto para evitar mutaciones
    this.showForm = true;
  }

  volver() {
    this.isAdmin ? this.ruta.navigate(['/admin']) : this.ruta.navigate(['']);
  }

  aceptaRechaza(caso: string, id: number) {
    const datos: Photo = <Photo>{ estado: caso }
    this.serphoto.ModificaFotografia(datos, id).subscribe({
      next: res => {
        this.fotos.find(e => e.id == res.id)!.estado = res!.estado;
        this.notifications.showToast("Fotografía modificada con éxito", "success");
      },
      error: (err) => {
        console.log("Error al modificar la foto", err);
        this.notifications.showToast(err.mesagge, "danger");
      }
    });

  }

  verFotoGrande(url: string) {
    this.selectedFotoUrl = url;
    this.isFotoModalOpen = true;
  }

  cerrarModal() {
    this.isFotoModalOpen = false;
    this.selectedFotoUrl = null;
  }
}