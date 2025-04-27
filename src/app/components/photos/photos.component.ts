/*import { Component } from '@angular/core';
import { FotografiasService } from '../../services/fotografias.service';
import { Photo } from '../../models/photo';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormUploadPhotoComponent } from "../form-upload-photo/form-upload-photo.component";
import Swal from 'sweetalert2'
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuarios.service';
import { NotificationsService } from '../../services/notifications.service';
import { VotosService } from '../../services/votos.service';
import { Voto } from '../../models/voto';
import { Estadistica } from '../../models/estadistica';
import { EstadisticaService } from '../../services/estadistica.service';

@Component({
  selector: 'app-photos',
  imports: [CommonModule, FormUploadPhotoComponent],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.css'
})
export class PhotosComponent {
  public showForm: boolean = false;
  public fotos: Photo[] = [];
  public votos: Voto[] = [];
  public estadisticas: Estadistica[] = [];
  public selectedPhoto: Photo = <Photo>{};
  public nombreUsuario: string = "";
  public isAdmin: boolean = false;
  public isVoted: boolean = false;
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen: boolean = false;
  constructor(private serphoto: FotografiasService, private serAuth: AuthService, private route: ActivatedRoute,
    private seruser: UsuarioService, private ruta: Router, private notifications: NotificationsService,
    private servoto: VotosService, private serestad: EstadisticaService) { }

    ngOnInit() {
      this.route.paramMap.subscribe(params => {
        const usuario = this.serAuth.getCurrentUser();
        const idParam = params.get("id");
        const usuId = idParam ? Number(idParam) : null;
  
        this.isAdmin = usuario?.rol === "administrador";
        this.isVoted = usuId === -1;
        this.nombreUsuario = usuario?.nombre || "";
  
        // Primero cargamos las estadísticas
        this.serestad.ListarEstadisticas().subscribe({
          next: (estadisticas) => {
            this.estadisticas = estadisticas;
            
            // Luego cargamos las fotos según el caso
            if (usuario != null && usuario.rol != "administrador" && usuId !== -1) {
              this.serphoto.ListarFotografiasPorUsuario(usuario.id).subscribe({
                next: (res) => {
                  this.fotos = this.ordenarPorRanking(res, this.estadisticas);
                },
                error: (error) => console.log("Error al listar fotos del usuario", error)
              });
            } else if (this.isAdmin && !this.isVoted) {
              this.seruser.ObtenerUsuarioId(usuId!).subscribe({
                next: (res) => this.nombreUsuario = res.nombre,
                error: (error) => console.log("Error al obtener el usuario", error)
              });
              this.serphoto.ListarFotografiasPorUsuario(usuId!).subscribe({
                next: (res) => {
                  this.fotos = this.ordenarPorRanking(res, this.estadisticas);
                },
                error: (error) => console.log("Error al listar fotos", error)
              });
            } else if (this.isVoted) {
              this.serphoto.ListarFotografias().subscribe({
                next: (res) => {
                  this.fotos = this.ordenarPorRanking(
                    res.filter(foto => 
                      foto.estado === 'aprobada' && 
                      foto.usuario_id !== usuario?.id
                    ), 
                    this.estadisticas
                  );
                },
                error: (error) => console.log("Error al listar fotos para votar", error)
              });
            }
          },
          error: (error) => console.log("Error al obtener estadísticas", error)
        });
  
        // Listamos Votos (esto puede mantenerse independiente)
        this.servoto.ListarVotaciones().subscribe({
          next: (res) => {
            this.votos = res;
            console.log("Votos recibidos:", res);
          },
          error: (error) => console.log("Error al obtener los votos", error)
        });
      });
    }

  getUrl(ruta: string): string {
    //console.log("Ruta", ruta);
    //console.log("Ruta completa ", '${environment.BASE_URL}/storage/${ruta}');
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
    this.ruta.navigate(['/admin'])
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

  votarAnularFoto(fotoId: number) {
    const usuario = this.serAuth.getCurrentUser();
    const votoExistente = this.votos.find(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);

    if (votoExistente) {
      //Anula voto
      this.servoto.BorraVotacion(votoExistente.id!).subscribe({
        next: () => {
          this.notifications.showToast("Voto anulado con éxito", "success");
          this.votos = this.votos.filter(v => v.id !== votoExistente.id);
          this.recargarEstadistica();
          this.fotos = this.ordenarPorRanking(this.fotos, this.estadisticas);
        },
        error: (err) => {
          console.log("Error al anular voto", err);
          this.notifications.showToast("No se pudo anular el voto", "danger");
        }
      });
    } else {
      //Añade voto
      const nuevoVoto: Voto = {
        id_fotografia: fotoId,
        id_usuario: usuario.id,
      };
      this.servoto.AnadeVotacion(nuevoVoto).subscribe({
        next: res => {
          this.notifications.showToast("Voto registrado con éxito", "success");
          this.votos.push(res);
          this.recargarEstadistica();
          this.fotos = this.ordenarPorRanking(this.fotos, this.estadisticas);
        },
        error: (err) => {
          console.log("Error al votar", err);
          this.notifications.showToast(err.error.message, "danger");
        }
      });
    }
    
  }

  //Para el conteo de votos
  getVotosPorFoto(idFoto: number): number {
    return this.votos.filter(v => v.id_fotografia === idFoto).length;
  }

  getRankingPorFoto(idFoto: number): string {
    const estad = this.estadisticas.find(e => e.fotografia_id === idFoto);
    if (!estad) return '-';

    const ranking = Number(estad.ranking);
    if (isNaN(ranking)) return '-';

    const emojis = ['🥇', '🥈', '🥉'];
    const emoji = emojis[ranking - 1] || '';

    return `${ranking}º ${emoji}`;
  }


  //Ver si ha votado
  haVotado(fotoId: number): boolean {
    const usuario = this.serAuth.getCurrentUser();
    return this.votos.some(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);
  }

  recargarEstadistica() {
    this.serestad.ListarEstadisticas().subscribe({
      next: (res) => {
        this.estadisticas = res;
        console.log("Esto es lo que recibo de las estadisticas", res)
      },
      error: (error) => console.log("Error al obtener el usuario", error)
    });
  }

  ordenarFotosConEstadisticas() {
    if (this.estadisticas.length > 0) {
      this.fotos = this.ordenarPorRanking(this.fotos, this.estadisticas);
    }
  }

  ordenarPorRanking(fotos: Photo[], estadisticas: Estadistica[]): Photo[] {
    return [...fotos].sort((a, b) => {
      const estadisticaA = estadisticas.find(e => e.fotografia_id === a.id);
      const estadisticaB = estadisticas.find(e => e.fotografia_id === b.id);
  
      // Convertimos a número y manejamos casos undefined/null
      const rankingA = estadisticaA?.ranking !== undefined ? Number(estadisticaA.ranking) : Number.MAX_SAFE_INTEGER;
      const rankingB = estadisticaB?.ranking !== undefined ? Number(estadisticaB.ranking) : Number.MAX_SAFE_INTEGER;
  
      console.log(`Ordenando: Foto ${a.id} (${rankingA}) vs Foto ${b.id} (${rankingB})`);
  
      return rankingA - rankingB;
    });
  }
}*/
/*
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
import { Estadistica } from '../../models/estadistica';
import { EstadisticaService } from '../../services/estadistica.service';
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
  public selectedPhoto: Photo = <Photo>{};
  public nombreUsuario = "";
  public isAdmin = false;
  public isVoted = false;
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen = false;
  public isLoading = false;



  constructor(
    private serphoto: FotografiasService,
    private serAuth: AuthService,
    private route: ActivatedRoute,
    private seruser: UsuarioService,
    private ruta: Router,
    private notifications: NotificationsService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const usuario = this.serAuth.getCurrentUser();
      const idParam = params.get("id");
      const usuId = idParam ? Number(idParam) : null;

      this.isAdmin = usuario?.rol === "administrador";
      this.isVoted = usuId === -1;
      this.nombreUsuario = usuario?.nombre || "";

      this.loadPhotos(usuario, usuId);
    });
  }

  loadPhotos(usuario: Usuario, usuId: number | null) {
    this.isLoading = true;

    if (usuario != null && usuario.rol != "administrador" && usuId !== -1) {
      this.serphoto.ListarFotografiasPorUsuario(usuario.id).subscribe({
        next: (fotos) => {
          this.processPhotoData(fotos);
          this.isLoading = false;
        },
        error: (error) => {
          console.log("Error al listar fotos del usuario", error);
          this.isLoading = false;
        }
      });
    } else if (this.isAdmin && !this.isVoted && usuId) {
      this.seruser.ObtenerUsuarioId(usuId).subscribe({
        next: (res) => this.nombreUsuario = res.nombre,
        error: (error) => console.log("Error al obtener el usuario", error)
      });

      this.serphoto.ListarFotografiasPorUsuario(usuId).subscribe({
        next: (fotos) => {
          this.processPhotoData(fotos);
          this.isLoading = false;
        },
        error: (error) => {
          console.log("Error al listar fotos", error);
          this.isLoading = false;
        }
      });
    } else if (this.isVoted) {
      this.serphoto.ListarFotografias().subscribe({
        next: (fotos) => {
          const fotosFiltradas = fotos.filter(foto =>
            foto.estado === 'aprobada' &&
            foto.usuario_id !== usuario?.id
          );
          this.processPhotoData(fotosFiltradas);
          this.isLoading = false;
        },
        error: (error) => {
          console.log("Error al listar fotos para votar", error);
          this.isLoading = false;
        }
      });
    }
  }

  processPhotoData(fotos: Photo[]) {
    this.fotos = this.ordenarPorRanking(fotos);

    // Extraemos todos los votos de las fotos
    const allVotos: Voto[] = [];
    fotos.forEach(foto => {
      if (foto.votos && foto.votos.length > 0) {
        allVotos.push(...foto.votos);
      }
    });

    // Aquí puedes usar allVotos si necesitas acceder a todos los votos
  }

  ordenarPorRanking(fotos: Photo[]): Photo[] {
    return [...fotos].sort((a, b) => {
      const rankingA = a.estadistica?.ranking ? Number(a.estadistica.ranking) : Number.MAX_SAFE_INTEGER;
      const rankingB = b.estadistica?.ranking ? Number(b.estadistica.ranking) : Number.MAX_SAFE_INTEGER;
      return rankingA - rankingB;
    });
  }

  haVotado(fotoId: number): boolean {
    const usuario = this.serAuth.getCurrentUser();
    return this.fotos.some(foto =>
      foto.id === fotoId &&
      foto.votos?.some(v => v.id_usuario === usuario.id)
    );
  }

  votarAnularFoto(fotoId: number) {
    const usuario = this.serAuth.getCurrentUser();
    const foto = this.fotos.find(f => f.id === fotoId);

    if (!foto) return;

    const votoExistente = foto.votos?.find(v => v.id_usuario === usuario.id);

    if (votoExistente) {
      // Anula voto
      this.isLoading = true;
      // Aquí llamarías a tu servicio para borrar el voto
      // Luego actualizas la foto localmente:
      if (foto.votos) {
        foto.votos = foto.votos.filter(v => v.id_usuario !== usuario.id);
        this.updatePhotoStats(foto);
        this.fotos = [...this.fotos]; // Trigger change detection
        this.isLoading = false;
        this.notifications.showToast("Voto anulado con éxito", "success");
      }
    } else {
      // Añade voto
      this.isLoading = true;
      // Aquí llamarías a tu servicio para añadir el voto
      // Luego actualizas la foto localmente:
      const nuevoVoto: Voto = {
        id_fotografia: fotoId,
        id_usuario: usuario.id,
        // ... otros campos necesarios
      };

      if (!foto.votos) foto.votos = [];
      foto.votos.push(nuevoVoto);
      this.updatePhotoStats(foto);
      this.fotos = [...this.fotos]; // Trigger change detection
      this.isLoading = false;
      this.notifications.showToast("Voto registrado con éxito", "success");
    }
  }

  private updatePhotoStats(foto: Photo) {
    if (foto.estadistica) {
      // Actualiza las estadísticas basadas en los votos actuales
      foto.estadistica.total_votos = foto.votos?.length || 0;
      // Aquí puedes añadir más lógica para actualizar el ranking si es necesario
    }
  }

  // ... (otros métodos se mantienen igual)




  getUrl(ruta: string): string {
    //console.log("Ruta", ruta);
    //console.log("Ruta completa ", '${environment.BASE_URL}/storage/${ruta}');
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
    this.ruta.navigate(['/admin'])
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
  // Para el conteo de votos - ahora usa los votos que ya vienen con cada foto
  getVotosPorFoto(foto: Photo): number {
    return foto.votos?.length || 0;
  }

  // Para obtener el ranking - ahora usa la estadística que ya viene con cada foto
  getRankingPorFoto(foto: Photo): string {
    if (!foto.estadistica || !foto.estadistica.ranking) return '-';

    const ranking = Number(foto.estadistica.ranking);
    if (isNaN(ranking)) return '-';

    const emojis = ['🥇', '🥈', '🥉'];
    const emoji = emojis[ranking - 1] || '';

    return `${ranking}º ${emoji}`;
  }
}*/
//ESTE CÓDIGO ES EL QUE FUNCIONA
/*Hacemos un subscribe a los parámetros de la ruta para obtener el id del usuario
    y así poder listar las fotos de ese usuario o las fotos para votar*/
/*
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
import { Estadistica } from '../../models/estadistica';
import { EstadisticaService } from '../../services/estadistica.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-photos',
  imports: [CommonModule, FormUploadPhotoComponent],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.css'
})
export class PhotosComponent {
  public showForm: boolean = false;
  public fotos: Photo[] = [];
  public votos: Voto[] = [];
  public estadisticas: Estadistica[] = [];
  public selectedPhoto: Photo = <Photo>{};
  public nombreUsuario: string = "";
  public isAdmin: boolean = false;
  public isVoted: boolean = false;
  public selectedFotoUrl: string | null = null;
  public isFotoModalOpen: boolean = false;

  constructor(
    private serphoto: FotografiasService,
    private serAuth: AuthService,
    private route: ActivatedRoute,
    private seruser: UsuarioService,
    private ruta: Router,
    private notifications: NotificationsService,
    private servoto: VotosService,
    private serestad: EstadisticaService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const usuario = this.serAuth.getCurrentUser();
      const idParam = params.get("id");
      const usuId = idParam ? Number(idParam) : null;

      this.isAdmin = usuario?.rol === "administrador";
      this.isVoted = usuId === -1;
      this.nombreUsuario = usuario?.nombre || "";

      // Cargamos datos iniciales
      this.cargarDatosIniciales(usuario, usuId);

      // Carga independiente de votos (para el método haVotado)
      this.cargarVotos();
    });
  }

  cargarDatosIniciales(usuario: Usuario, usuId: number | null) {
    // 1. Primero cargamos las estadísticas
    this.serestad.ListarEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
        console.log('Estadísticas cargadas:', estadisticas);

        // 2. Luego cargamos las fotos según el caso
        this.cargarFotosSegunContexto(usuario, usuId);
      },
      error: (error) => console.log("Error al obtener estadísticas", error)
    });
  }

  cargarFotosSegunContexto(usuario: Usuario, usuId: number | null) {
    if (usuario != null && usuario.rol != "administrador" && usuId !== -1) {
      this.cargarFotosUsuario(usuario.id);
    } else if (this.isAdmin && !this.isVoted) {
      this.cargarFotosAdmin(usuId!);
    } else if (this.isVoted) {
      this.cargarFotosParaVotar(usuario);
    }
  }

  cargarFotosUsuario(usuarioId: number) {
    this.serphoto.ListarFotografiasPorUsuario(usuarioId).subscribe({
      next: (res) => {
        this.fotos = this.ordenarPorRanking(res, this.estadisticas);
      },
      error: (error) => console.log("Error al listar fotos del usuario", error)
    });
  }

  cargarFotosAdmin(usuId: number) {
    this.seruser.ObtenerUsuarioId(usuId).subscribe({
      next: (res) => this.nombreUsuario = res.nombre,
      error: (error) => console.log("Error al obtener el usuario", error)
    });

    this.serphoto.ListarFotografiasPorUsuario(usuId).subscribe({
      next: (res) => {
        console.log("Esto es lo que recibo al listar las fotos por usuario", res);
        this.fotos = this.ordenarPorRanking(res, this.estadisticas);
      },
      error: (error) => console.log("Error al listar fotos", error)
    });
  }

  cargarFotosParaVotar(usuario: Usuario) {
    this.serphoto.ListarFotografias().subscribe({
      next: (res) => {
        console.log("Esto es lo que recibo al listar las fotos", res);
        this.fotos = this.ordenarPorRanking(
          res.filter(foto =>
            foto.estado === 'aprobada' &&
            foto.usuario_id !== usuario?.id
          ),
          this.estadisticas
        );
      },
      error: (error) => console.log("Error al listar fotos para votar", error)
    });
  }

  cargarVotos() {
    this.servoto.ListarVotaciones().subscribe({
      next: (res) => {
        this.votos = res;
        console.log("Votos cargados:", res);
      },
      error: (error) => console.log("Error al obtener los votos", error)
    });
  }

  actualizarYOrdenarFotos() {
    // 1. Actualizamos las estadísticas
    this.serestad.ListarEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
        console.log('Estadísticas actualizadas:', estadisticas);

        // 2. Actualizamos los votos
        this.servoto.ListarVotaciones().subscribe({
          next: (votos) => {
            this.votos = votos;

            // 3. Re-ordenamos las fotos con los nuevos datos
            if (this.isVoted) {
              this.cargarFotosParaVotar(this.serAuth.getCurrentUser());
            } else {
              const usuario = this.serAuth.getCurrentUser();
              if (usuario) {
                this.cargarFotosUsuario(usuario.id);
              }
            }
          }
        });
      },
      error: (error) => console.log("Error al actualizar estadísticas", error)
    });
  }

  votarAnularFoto(fotoId: number) {
    const usuario = this.serAuth.getCurrentUser();
    const votoExistente = this.votos.find(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);

    if (votoExistente) {
      // Anula voto
      this.servoto.BorraVotacion(votoExistente.id!).subscribe({
        next: () => {
          this.notifications.showToast("Voto anulado con éxito", "success");
          this.actualizarYOrdenarFotos(); // Actualizamos todo
        },
        error: (err) => {
          console.log("Error al anular voto", err);
          this.notifications.showToast("No se pudo anular el voto", "danger");
        }
      });
    } else {
      // Añade voto
      const nuevoVoto: Voto = {
        id_fotografia: fotoId,
        id_usuario: usuario.id,
      };
      this.servoto.AnadeVotacion(nuevoVoto).subscribe({
        next: () => {
          this.notifications.showToast("Voto registrado con éxito", "success");
          this.actualizarYOrdenarFotos(); // Actualizamos todo
        },
        error: (err) => {
          console.log("Error al votar", err);
          this.notifications.showToast(err.error.message, "danger");
        }
      });
    }
  }

  ordenarPorRanking(fotos: Photo[], estadisticas: Estadistica[]): Photo[] {
    return [...fotos].sort((a, b) => {
      const estadisticaA = estadisticas.find(e => e.fotografia_id === a.id);
      const estadisticaB = estadisticas.find(e => e.fotografia_id === b.id);

      // Convertimos a número y manejamos casos undefined/null
      const rankingA = estadisticaA?.ranking !== undefined ? Number(estadisticaA.ranking) : Number.MAX_SAFE_INTEGER;
      const rankingB = estadisticaB?.ranking !== undefined ? Number(estadisticaB.ranking) : Number.MAX_SAFE_INTEGER;

      console.log(`Ordenando: Foto ${a.id} (${rankingA}) vs Foto ${b.id} (${rankingB})`);

      return rankingA - rankingB;
    });
  }

  //Ver si ha votado
  haVotado(fotoId: number): boolean {
    const usuario = this.serAuth.getCurrentUser();
    return this.votos.some(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);
  }

  getUrl(ruta: string): string {
    //console.log("Ruta", ruta);
    //console.log("Ruta completa ", '${environment.BASE_URL}/storage/${ruta}');
    return `${environment.BASE_URL}/storage/${ruta}`;
  }*/
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
  public nombreUsuario = "";
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
    this.ruta.navigate(['/admin'])
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

  //Para el conteo de votos
  /* getVotosPorFoto(idFoto: number): number {
     return this.votos.filter(v => v.id_fotografia === idFoto).length;
   }
 
   getRankingPorFoto(idFoto: number): string {
     const estad = this.estadisticas.find(e => e.fotografia_id === idFoto);
     if (!estad) return '-';
 
     const ranking = Number(estad.ranking);
     if (isNaN(ranking)) return '-';
 
     const emojis = ['🥇', '🥈', '🥉'];
     const emoji = emojis[ranking - 1] || '';
 
     return `${ranking}º ${emoji}`;
   }*/
}
//OTRA OPCIÓN DE CÓDIGO
/* ngOnInit() {
   this.route.paramMap.subscribe(params => {
     const usuario = this.serAuth.getCurrentUser();
     const idParam = params.get("id");
     const usuId = idParam ? Number(idParam) : null;

     this.isAdmin = usuario?.rol === "administrador";
     this.isVoted = usuId === -1;
     this.nombreUsuario = usuario?.nombre || "";

     // Cargamos datos iniciales
     this.cargarDatosIniciales(usuario, usuId);

     // Carga independiente de votos (para el método haVotado)
     this.cargarVotos();
   });
 }

 cargarDatosIniciales(usuario: Usuario, usuId: number | null) {
   // 1. Primero cargamos las estadísticas
   this.serestad.ListarEstadisticas().subscribe({
     next: (estadisticas) => {
       this.estadisticas = estadisticas;
       console.log('Estadísticas cargadas:', estadisticas);

       // 2. Luego cargamos las fotos según el caso
       this.cargarFotosSegunContexto(usuario, usuId);
     },
     error: (error) => console.log("Error al obtener estadísticas", error)
   });
 }

 cargarFotosSegunContexto(usuario: Usuario, usuId: number | null) {
   if (usuario != null && usuario.rol != "administrador" && usuId !== -1) {
     this.cargarFotosUsuario(usuario.id);
   } else if (this.isAdmin && !this.isVoted) {
     this.cargarFotosAdmin(usuId!);
   } else if (this.isVoted) {
     this.cargarFotosParaVotar(usuario);
   }
 }

 cargarFotosUsuario(usuarioId: number) {
   this.serphoto.ListarFotografiasPorUsuario(usuarioId).subscribe({
     next: (res) => {
       this.fotos = this.ordenarPorRanking(res, this.estadisticas);
     },
     error: (error) => console.log("Error al listar fotos del usuario", error)
   });
 }

 cargarFotosAdmin(usuId: number) {
   this.seruser.ObtenerUsuarioId(usuId).subscribe({
     next: (res) => this.nombreUsuario = res.nombre,
     error: (error) => console.log("Error al obtener el usuario", error)
   });

   this.serphoto.ListarFotografiasPorUsuario(usuId).subscribe({
     next: (res) => {
       // Aquí estamos recibiendo las fotografías con datos adicionales.
       console.log("Esto es lo que recibo al listar las fotos por usuario", res);
       this.fotos = this.ordenarPorRanking(res, this.estadisticas);
     },
     error: (error) => console.log("Error al listar fotos", error)
   });
 }

 cargarVotos() {
   this.servoto.ListarVotaciones().subscribe({
     next: (res) => {
       this.votos = res;
       console.log("Votos cargados:", res);
     },
     error: (error) => console.log("Error al obtener los votos", error)
   });
 }

 cargarFotosParaVotar(usuario: Usuario) {
   this.serphoto.ListarFotografias().subscribe({
     next: (res) => {
       // Filtramos las fotos según el estado y si el usuario ya ha votado
       this.fotos = this.ordenarPorRanking(
         res.filter(foto =>
           foto.estado === 'aprobada' &&
           foto.usuario_id !== usuario?.id
         ),
         this.estadisticas
       );
     },
     error: (error) => console.log("Error al listar fotos para votar", error)
   });
 }

 // Método para ordenar por el ranking
 ordenarPorRanking(fotos: Photo[], estadisticas: Estadistica[]): Photo[] {
   return [...fotos].sort((a, b) => {
     const estadisticaA = estadisticas.find(e => e.fotografia_id === a.id);
     const estadisticaB = estadisticas.find(e => e.fotografia_id === b.id);

     const rankingA = estadisticaA?.ranking !== undefined ? Number(estadisticaA.ranking) : Number.MAX_SAFE_INTEGER;
     const rankingB = estadisticaB?.ranking !== undefined ? Number(estadisticaB.ranking) : Number.MAX_SAFE_INTEGER;

     return rankingA - rankingB;
   });
 }

 // Verificar si ha votado
 haVotado(fotoId: number): boolean {
   const usuario = this.serAuth.getCurrentUser();
   return this.votos.some(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);
 }

 getUrl(ruta: string): string {
   return `${environment.BASE_URL}/storage/${ruta}`;
 }

 votarAnularFoto(fotoId: number) {
   const usuario = this.serAuth.getCurrentUser();
   const votoExistente = this.votos.find(v => v.id_fotografia === fotoId && v.id_usuario === usuario.id);

   if (votoExistente) {
     // Anula voto
     this.servoto.BorraVotacion(votoExistente.id!).subscribe({
       next: () => {
         this.notifications.showToast("Voto anulado con éxito", "success");
         this.actualizarYOrdenarFotos(); // Actualizamos todo
       },
       error: (err) => {
         console.log("Error al anular voto", err);
         this.notifications.showToast("No se pudo anular el voto", "danger");
       }
     });
   } else {
     // Añade voto
     const nuevoVoto: Voto = {
       id_fotografia: fotoId,
       id_usuario: usuario.id,
     };
     this.servoto.AnadeVotacion(nuevoVoto).subscribe({
       next: () => {
         this.notifications.showToast("Voto registrado con éxito", "success");
         this.actualizarYOrdenarFotos(); // Actualizamos todo
       },
       error: (err) => {
         console.log("Error al votar", err);
         this.notifications.showToast(err.error.message, "danger");
       }
     });
   }
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

 actualizarYOrdenarFotos() {
   // 1. Actualizamos las estadísticas
   this.serestad.ListarEstadisticas().subscribe({
     next: (estadisticas) => {
       this.estadisticas = estadisticas;

       // 2. Actualizamos los votos
       this.servoto.ListarVotaciones().subscribe({
         next: (votos) => {
           this.votos = votos;

           // 3. Re-ordenamos las fotos con los nuevos datos
           if (this.isVoted) {
             this.cargarFotosParaVotar(this.serAuth.getCurrentUser());
           } else {
             const usuario = this.serAuth.getCurrentUser();
             if (usuario) {
               this.cargarFotosUsuario(usuario.id);
             }
           }
         }
       });
     },
     error: (error) => console.log("Error al actualizar estadísticas", error)
   });
 }

 // Métodos adicionales para eliminar y editar fotos
 borraFoto(id: number, nombre: string) {
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
   this.selectedPhoto = { ...photo }; // Copia el objeto para evitar mutaciones
   this.showForm = true;
 }

 volver() {
   this.ruta.navigate(['/admin']);
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
       this.notifications.showToast(err.message, "danger");
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

 getVotosPorFoto(idFoto: number): number {
   return this.votos.filter(v => v.id_fotografia === idFoto).length;
 }

 getRankingPorFoto(idFoto: number): string {
   const estad = this.estadisticas.find(e => e.fotografia_id === idFoto);
   if (!estad) return '-';

   const ranking = Number(estad.ranking);
   if (isNaN(ranking)) return '-';

   const emojis = ['🥇', '🥈', '🥉'];
   const emoji = emojis[ranking - 1] || '';

   return `${ranking}º ${emoji}`;
 }
}*/
//OPCIÓN SIN LLAMAR A ESTADÍSTICAS


/* ngOnInit() {
   this.route.paramMap.subscribe(params => {
     const usuario = this.serAuth.getCurrentUser()!;
     const idParam = params.get('id');
     const usuId = idParam ? +idParam : null;

     this.isAdmin  = usuario.rol === 'administrador';
     this.isVoted  = usuId === -1;
     this.nombreUsuario = usuario.nombre;

     // 1) Cargamos votos (de ahí extraemos stats)
     this.cargarDatosIniciales(usuario, usuId);
     // 2) —método aparte para actualizar sólo votos/stats
     //    stay ready to call this.actualizarYOrdenarFotos()
   });
 }

 
 cargarDatosIniciales(usuario: Usuario, usuId: number | null) {
   this.servoto.ListarVotaciones().subscribe({
     next: votos => {
       this.votos = votos;
       this.extraerEstadisticasDeVotos(votos);
       console.log('Votos y stats cargados', this.estadisticas);
       this.cargarFotosSegunContexto(usuario, usuId);
     },
     error: err => console.error('Error al obtener los votos', err)
   });
 }

 
 cargarFotosSegunContexto(usuario: Usuario, usuId: number | null) {
   if (!this.isVoted && usuario.rol !== 'administrador') {
     this.cargarFotosUsuario(usuario.id);
   }
   else if (!this.isVoted && this.isAdmin) {
     this.cargarFotosAdmin(usuId!);
   }
   else { // modo votación
     this.cargarFotosParaVotar(usuario.id);
   }
 }

 cargarFotosUsuario(usuarioId: number) {
   this.serphoto.ListarFotografiasPorUsuario(usuarioId).subscribe({
     next: fotos => this.fotos = this.ordenarPorRanking(fotos),
     error: err => console.error('Error al listar fotos usuario', err)
   });
 }

 cargarFotosAdmin(usuId: number) {
   this.seruser.ObtenerUsuarioId(usuId).subscribe({
     next: u => this.nombreUsuario = u.nombre,
     error: err => console.error('Error al cargar admin user', err)
   });
   this.serphoto.ListarFotografiasPorUsuario(usuId).subscribe({
     next: fotos => this.fotos = this.ordenarPorRanking(fotos),
     error: err => console.error('Error al listar fotos admin', err)
   });
 }

 cargarFotosParaVotar(miUsuarioId: number) {
   this.serphoto.ListarFotografias().subscribe({
     next: fotos => {
       this.fotos = this.ordenarPorRanking(
         fotos.filter(f => 
           f.estado === 'aprobada' && f.usuario_id !== miUsuarioId
         )
       );
     },
     error: err => console.error('Error al listar fotos para votar', err)
   });
 }

 
 private extraerEstadisticasDeVotos(votos: Voto[]) {
   const mapa = new Map<number, Estadistica>();
   votos.forEach(v => {
     const es = v.fotografia!.estadistica as Estadistica|undefined;
     if (es) mapa.set(es.fotografia_id, es);
   });
   this.estadisticas = Array.from(mapa.values());
 }

 
 actualizarYOrdenarFotos() {
   this.servoto.ListarVotaciones().subscribe({
     next: votos => {
       this.votos = votos;
       this.extraerEstadisticasDeVotos(votos);
       // recargamos fotos según el mismo contexto
       const usuario = this.serAuth.getCurrentUser()!;
       if (this.isVoted)           this.cargarFotosParaVotar(usuario.id);
       else if (usuario.rol!=='administrador') this.cargarFotosUsuario(usuario.id);
       else                        this.cargarFotosAdmin(usuario.id);
     },
     error: err => console.error('Error al actualizar votos', err)
   });
 }

 votarAnularFoto(fotoId: number) {
   const usuario = this.serAuth.getCurrentUser()!;
   const miVoto = this.votos.find(v => v.id_fotografia===fotoId && v.id_usuario===usuario.id);

   const peticion = miVoto
     ? this.servoto.BorraVotacion(miVoto.id!)
     : this.servoto.AnadeVotacion({ id_fotografia: fotoId, id_usuario: usuario.id } as Voto);

   peticion.subscribe({
     next: () => {
       this.notifications.showToast(
         miVoto ? 'Voto anulado' : 'Voto registrado',
         'success'
       );
       this.actualizarYOrdenarFotos();
     },
     error: err => {
       console.error('Error al votar/anular', err);
       this.notifications.showToast('Error procesando voto', 'danger');
     }
   });
 }

 ordenarPorRanking(fotos: Photo[]): Photo[] {
   return fotos.sort((a, b) => {
     const ea = this.estadisticas.find(e => e.fotografia_id === a.id);
     const eb = this.estadisticas.find(e => e.fotografia_id === b.id);
     const ra = ea ? +ea.ranking : Infinity;
     const rb = eb ? +eb.ranking : Infinity;
     return ra - rb;
   });
 }

 getRankingPorFoto(id: number): string {
   const e = this.estadisticas.find(s => s.fotografia_id === id);
   if (!e) return '-';
   const r = +e.ranking;
   const emojis = ['🥇','🥈','🥉'];
   return `${r}º ${emojis[r-1]||''}`;
 }

 haVotado(fotoId: number): boolean {
   const u = this.serAuth.getCurrentUser()!;
   return this.votos.some(v => v.id_fotografia===fotoId && v.id_usuario===u.id);
 }
}

}*/