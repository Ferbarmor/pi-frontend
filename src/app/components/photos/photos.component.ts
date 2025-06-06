import { Component } from '@angular/core';
import { FotografiasService } from '../../services/fotografias.service';
import { Photo } from '../../models/photo';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormUploadPhotoComponent } from "../form-upload-photo/form-upload-photo.component";
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuarios.service';
import { NotificationsService } from '../../services/notifications.service';
import { VotosService } from '../../services/votos.service';
import { Voto } from '../../models/voto';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-photos',
  imports: [CommonModule, FormUploadPhotoComponent, RouterLink],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.css'
})
export class PhotosComponent {
  public showForm = false;
  public fotos: Photo[] = [];
  public nombreUsuario: string | undefined;
  public isAdmin = false;
  public isVoted = false; //Indica que el usuario está en modo votación
  public selectedFotoUrl: string | null = null; //URL de la foto seleccionada para vista ampliada
  public isFotoModalOpen = false;
  public selectedPhoto: Photo = <Photo>{};
  public usuId: number = 0;
  public previousUserId: number | null = null;
  public votacionFinalizada: Boolean = false;
  public ordenActual: 'ranking' | 'autor' = 'ranking';
  public currentPage = 1;
  public itemsPerPage = 8;
  public totalPages = 0;


  constructor(
    private serphoto: FotografiasService,
    private serAuth: AuthService,
    private route: ActivatedRoute,
    private seruser: UsuarioService,
    private ruta: Router,
    private notifications: NotificationsService,
    private servoto: VotosService
  ) { }

  /**
  * Inicializa el componente y suscripción a cambios en la ruta para cargar datos.
  */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {//Se suscribe a los parámetros de la ruta (paramMap), es decir, escucha los cambios en la URL, como /perfil/id.
      const usuario = this.serAuth.getCurrentUser()!;
      this.usuId = Number(params.get("id"));
      //Si estamos entrando al modo votación (id = -1), guardamos el ID real del usuario
      if (this.usuId === -1 && usuario.id) {
        sessionStorage.setItem('previousUserId', usuario.id);
      } //Guardamos en sessionStorage
      this.isAdmin = usuario.rol === "administrador";
      this.isVoted = this.usuId === -1;
      this.nombreUsuario = usuario.nombre;
      this.loadPhotos(usuario, this.usuId);
      if (!this.isVoted) this.loadUsuario(this.usuId);
    });
  }

  /*private loadPhotos(usuario: Usuario, usuId: number) {
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
  }*/
  /*Esta load sería para calacular ranking y ordenar haciéndone menos pietciones al servidor, con el problema que conlleva si recalculas el rankin solo para un usuario
  private loadPhotos(usuario: Usuario, usuId: number) {
    //Traemos SIEMPRE todas las fotos para calcular el ranking global
    this.serphoto.ListarFotografias().subscribe({
      next: fotos => {
        //Solo dejamos las aprobadas
        const aprobadas = fotos.filter(f => f.estado === 'aprobada');
        this.votacionFinalizada = new Date(fotos[0].rally.fecha_fin_votacion) < new Date();
        //Calculamos ranking global con las fotos aprobadas
        const conEstadistica = this.updateAllPhotoStats(aprobadas);

        //Mapeamos la estadística solo a las fotos aprobadas
        const mapEstadistica = new Map<number, Photo>();
        conEstadistica.forEach(f => mapEstadistica.set(f.id, f));

        //Asignamos estadística solo si es una foto aprobada
        fotos.forEach(f => {
          if (mapEstadistica.has(f.id)) {
            f.estadistica = mapEstadistica.get(f.id)!.estadistica;
          } else {
            f.estadistica = undefined;
          }
        });

        //Filtramos lo que se mostrará, dependiendo del modo
        let list = (!this.isAdmin && !this.isVoted)
          ? fotos.filter(f => f.usuario_id === usuario.id)//&& f.estado === 'aprobada'
          : this.isVoted
            ? fotos.filter(f => f.usuario_id !== usuario.id && f.estado === 'aprobada')
            : fotos.filter(f => f.usuario_id === usuId); // admin: todas del usuario

        // Ordenamos por ranking ascendente
        list.sort((a, b) => {
          const rankA = a.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          const rankB = b.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        this.fotos = list;
      },
      error: err => {
        console.error("Error cargando fotos", err);
        this.notifications.showToast("Error cargando fotos", "danger");
      }
    });
  }
    */

  /**
  * Carga las fotografías según el usuario y estado actual, calcula ranking y prepara paginación.
  * @param usuario Usuario actual
  * @param usuId ID del usuario para cargar fotos
  */
  private loadPhotos(usuario: Usuario, usuId: number) {
    this.serphoto.ListarFotografias().subscribe({
      next: fotos => {
        //console.log("Fotos que traigo", fotos);
        //Solo dejamos las aprobadas
        const aprobadas = fotos.filter(f => f.estado === 'aprobada');
        this.votacionFinalizada = new Date(fotos[0].rally.fecha_fin_votacion) < new Date();
        //Mapeamos la estadística solo a las fotos aprobadas
        const mapEstadistica = new Map<number, Photo>();
        aprobadas.forEach(f => mapEstadistica.set(f.id, f));

        //Asignamos estadística solo si es una foto aprobada
        fotos.forEach(f => {
          if (mapEstadistica.has(f.id)) {
            f.estadistica = mapEstadistica.get(f.id)!.estadistica;
          } else {
            f.estadistica = undefined;
          }
        });

        let list = (!this.isAdmin && !this.isVoted)
          ? fotos.filter(f => f.usuario_id === usuario.id)
          : this.isVoted
            ? fotos.filter(f => f.usuario_id !== usuario.id && f.estado === 'aprobada')
            : fotos.filter(f => f.usuario_id === usuId);

        //Ordenamos por ranking ascendente
        list.sort((a, b) => {
          /*Si a.estadistica o a.estadistica.ranking no existe, entonces se usa el valor a la derecha del ??, 
          que es Number.MAX_SAFE_INTEGER (el número entero más grande seguro en JavaScript)*/
          const rankA = a.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          const rankB = b.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });

        this.fotos = list;
        //Divide la cantidad total de fotos (this.fotos.length) entre la cantidad de fotos por página (this.itemsPerPage) y redondea
        this.totalPages = Math.ceil(this.fotos.length / this.itemsPerPage);
      },
      error: err => {
        console.error("Error cargando fotos", err);
        this.notifications.showToast("Error cargando fotos", "danger");
      }
    });
  }

  /**
   * Carga los datos de un usuario dado su ID.
   * @param usuId ID del usuario a cargar
   */
  private loadUsuario(usuId: number) {
    this.seruser.ObtenerUsuarioId(usuId).subscribe({
      next: (res) => {
        //console.log("Esto es lo que recibo de ObtenerUsuarioId", res);
        this.nombreUsuario = res.nombre;
      },
      error: (error) => console.log("Esto es un error de selPersonaID")
    });
  }

  //Sin ordenásemos sin traer otra vez las fotos
  /* private updateAllPhotoStats(list: Photo[]): Photo[] {
     // 1. Recalcula total_votos en estadistica
     list.forEach(f => f.estadistica!.total_votos = f.votos.length);
     // 2. Ordena por total_votos descendente
     const sorted = [...list].sort((a, b) => b.votos.length - a.votos.length);
     // 3. Recalcula ranking 1-based
     sorted.forEach((f, i) => f.estadistica!.ranking = i + 1);
     return sorted;
   }
 */

  /**
  * Ordena las fotos según el criterio seleccionado ('ranking' o 'autor').
  */
  ordenarFotos() {
    if (this.ordenActual === 'ranking') {
      this.fotos.sort((a, b) => {
        const rankA = a.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.estadistica?.ranking ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
      });
    } else if (this.ordenActual === 'autor') {
      if (this.isVoted) {
        //Ordena por autor si está votando
        this.fotos.sort((a, b) => {
          const autorA = a.usuario?.nombre?.toLowerCase() ?? '';
          const autorB = b.usuario?.nombre?.toLowerCase() ?? '';
          return autorA.localeCompare(autorB);
        });
      } else {
        //Ordena por título (nombre) si no está votando
        this.fotos.sort((a, b) => {
          const tituloA = a.titulo?.toLowerCase() ?? '';
          const tituloB = b.titulo?.toLowerCase() ?? '';
          return tituloA.localeCompare(tituloB);
        });
      }
    }
  }

  /**
  * Añade o anula el voto de la foto para el usuario actual.
  * Utilizamos las notificaciones con  el servicio NotificationService que ya hemos explicado en otrso componentes
  * @param fotoId ID de la foto a votar o anular voto
  */
  votarAnularFoto(fotoId: number) {
    const usuario = this.serAuth.getCurrentUser()!;//Obteneos el usuario actual
    const foto = this.fotos.find(f => f.id === fotoId);
    if (!foto) return;

    const votoExistente = foto.votos.find(v => v.id_usuario === usuario.id);

    if (votoExistente) {
      //ANULA VOTO
      this.servoto.BorraVotacion(votoExistente.id!).subscribe({
        next: () => {
          //foto.votos = foto.votos.filter(v => v.id_usuario !== usuario.id);
          //this.fotos = this.updateAllPhotoStats(this.fotos);
          this.loadPhotos(usuario, this.usuId);
          this.notifications.showToast("Voto anulado con éxito", "success");
        },
        error: () => this.notifications.showToast("No se pudo anular voto", "danger")
      });
    } else {
      //AÑADE VOTO
      const nuevo: Voto = { id_fotografia: fotoId, id_usuario: usuario.id };
      this.servoto.AnadeVotacion(nuevo).subscribe({
        next: (res) => {
          //foto.votos.push(res);
          //this.fotos = this.updateAllPhotoStats(this.fotos);
          this.loadPhotos(usuario, this.usuId);
          this.notifications.showToast("Voto registrado con éxito", "success");
        },
        error: (error) => this.notifications.showToast(error.error.message, "danger")
      });
    }
  }

  /**
   * Comprueba si el usuario actual ha votado una foto.
   * @param fotoId ID de la foto
   * @returns true si ha votado, false en caso contrario
   */
  haVotado(fotoId: number): boolean {
    const usuario = this.serAuth.getCurrentUser()!;
    const foto = this.fotos.find(f => f.id === fotoId);
    return !!foto?.votos.find(v => v.id_usuario === usuario.id);
  }

  /**
  * Obtiene el número total de votos de una foto.
  * @param f Foto
  * @returns Número de votos
  */
  getVotosPorFoto(f: Photo): number {
    return f.estadistica?.total_votos ?? 0; //Devuelve el total de votos o 0 si no tiene estadística
  }

  /**
  * Obtiene el ranking en formato string con sufijo ordinal y emoji.
  * @param f Foto
  * @returns Ranking formateado o '-' si no aplica
  */
  getRankingPorFoto(f: Photo): string {
    const r = Math.floor(Number(f.estadistica?.ranking ?? 0));
    if (!r || f.estado != "aprobada") return '-';

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

  /**
  * Construye la URL completa para acceder a la foto.
  * @param ruta Ruta relativa de la foto
  * @returns URL completa
  */
  getUrl(ruta: string) {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  /**
  * Maneja el cierre del formulario de carga/edición de foto.
  * @param result Resultado del formulario
  */
  handleFormClose(result: { success: boolean, message?: string, photo?: Photo }) {
    //console.log("Formulario cerrado, ¿con éxito?", result.success);
    //console.log("usuario que he modificado", result.photo);
    this.showForm = false;
    this.selectedPhoto = <Photo>{}
    if (result.success && result.message == "Añadiendo") {
      this.fotos.push(result.photo!);
    } else if (result.success && result.message == "Editando") {
      //this.usuarios.find(e => e.id == result.usuario!.id)!.nombre = result.usuario!.nombre;
      const index = this.fotos.findIndex(e => e.id === result.photo!.id);
      if (index !== -1) {
        //console.log("Esto es lo que recibo de la foto editada", result.photo);
        //Aseguramos que el ranking sea un número entero
        result.photo!.estadistica!.ranking = Math.floor(result.photo!.estadistica!.ranking);
        this.fotos[index] = result.photo!;
        this.selectedPhoto = result.photo!;
      } else if (!result.success) {
        this.selectedPhoto = result.photo!;
      }
    }

  }

  /**
  * Solicita confirmación para borrar una foto y la elimina si se confirma.
  * @param id ID de la foto a borrar
  * @param nombre Nombre de la foto (para mostrar en alerta)
  */
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

  /**
  * Prepara el formulario para editar una foto seleccionada.
  * @param photo Foto a editar
  */
  editarFoto(photo: Photo) {
    //console.log("Estoy editando la foto", photo);
    this.selectedPhoto = { ...photo };//Copia el objeto para evitar mutaciones
    this.showForm = true;
  }

  /**
   * Navega hacia la página anterior o panel dependiendo del rol y contexto.
   */
  volver() {
    //this.isAdmin ? this.ruta.navigate(['/admin']) : this.ruta.navigate(['/admin', { id: this.usuId }]);
    if (this.isAdmin) {
      //Si es admin, vuelve al panel de admin
      this.ruta.navigate(['/admin']);
    } else {
      //Recuperamos el ID guardado (o usamos el actual si no hay modo votación)
      const previousUserId = sessionStorage.getItem('previousUserId');
      const targetId = previousUserId ? +previousUserId : this.usuId;
      this.ruta.navigate(['/admin', { id: targetId }]);

      //Limpiamos el storage después de usarlo
      sessionStorage.removeItem('previousUserId');
    }
  }

  /**
  * Cambia el estado de una foto (aceptar o rechazar).
  * @param caso Nuevo estado a asignar
  * @param id ID de la foto
  */
  aceptaRechaza(caso: string, id: number) {
    const datos: Photo = <Photo>{ estado: caso }
    this.serphoto.ModificaFotografia(datos, id).subscribe({
      next: res => {
        this.fotos.find(e => e.id == res.id)!.estado = res!.estado;
        this.notifications.showToast("Fotografía modificada con éxito", "success");
      },
      error: (err) => {
        //console.log("Error al modificar la foto", err);
        this.notifications.showToast(err.mesagge, "danger");
      }
    });

  }

  /**
   * Muestra la foto en tamaño grande en un modal.
   * @param url URL de la foto
   */
  verFotoGrande(url: string) {
    this.selectedFotoUrl = url;
    this.isFotoModalOpen = true;
  }

  /**
  * Cierra el modal de foto grande.
  */
  cerrarModal() {
    this.isFotoModalOpen = false;
    this.selectedFotoUrl = null;
  }

  /**
  * Devuelve la lista de fotos para la página actual, paginadas.
  * @returns Lista de fotos de la página actual
  */
  paginatedFotos(): Photo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.fotos.slice(startIndex, endIndex);
  }

  /** Avanza a la siguiente página si no está en la última */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  /** Retrocede a la página anterior si no está en la primera */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}