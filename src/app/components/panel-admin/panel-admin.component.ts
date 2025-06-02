import { Component } from '@angular/core';
import { TestsService } from '../../services/tests.service';
import { FotografiasService } from '../../services/fotografias.service';
import { environment } from '../../../environments/environment.development';
import { Photo } from '../../models/photo';
import { UsuarioService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormRegisterComponent } from "../form-register/form-register.component";
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'
import { UserDetailsComponent } from "../user-details/user-details.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-admin',
  imports: [FormRegisterComponent, UserDetailsComponent, CommonModule],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css'
})
export class PanelAdminComponent {
  public showDetails: boolean = false;
  public showForm: boolean = false;
  public selectedUsuario: Usuario = <Usuario>{}
  public tests: any[] = [];
  public fotos: Photo[] = [];
  public usuarios: Usuario[] = [];
  public usuario: Usuario | undefined;
  public usId: number = 0;
  constructor(private testservice: TestsService, private serphoto: FotografiasService,
    private serusuario: UsuarioService, private ruta: Router, private serAuth: AuthService, private route: ActivatedRoute) { }

  /**
 * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
 * Carga la información del usuario actual y sus fotografías, o bien la lista de usuarios.
 */
  ngOnInit() {
    this.usId = this.route.snapshot.params["id"];
    //console.log("El id del usuario es", this.usId);
    const usuario = this.serAuth.getCurrentUser();
    //console.log("Estoy en el listado de usuarios");
    this.usId == undefined ? this.loadUsuarios() : this.loadUsuarioId(this.usId);

    //console.log("Estoy mostrando las fotografías");
    if (usuario != null) {
      this.serphoto.ListarFotografiasPorUsuario(usuario.id).subscribe({
        next: (res) => {
          //console.log("Esto es lo que recibo al listar las fotos", res);
          this.fotos = res;
        },
        error: (error) => console.log("Esto es un error de listar fotografías por usuario", error)
      })
    }
  }

  /**
   * Verifica si un usuario tiene al menos una fotografía con estado 'pendiente'.
   * 
   * @param usuario - Usuario a evaluar.
   * @returns `true` si tiene fotos pendientes, `false` en caso contrario.
   */
  tieneFotosPendientes(usuario: Usuario): boolean {
    return usuario.fotografias?.some(foto => foto.estado === 'pendiente') || false;
  }

  /**
   * Carga la lista completa de usuarios desde el backend.
   */
  loadUsuarios() {
    this.serusuario.ListarUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        //console.log("Esto es lo que recibo al listar los usuarios", res);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  /**
  * Carga un usuario específico por su ID.
  * 
  * @param id - ID del usuario a cargar.
  */
  loadUsuarioId(id: number) {
    this.serusuario.ObtenerUsuarioId(id).subscribe({
      next: (res) => {
        this.usuario = res;
        //console.log("Esto es lo que recibo al listar los usuarios", res);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  /**
   * Inicia el proceso de edición para un usuario específico.
   * 
   * @param usuario - Usuario que se desea editar.
   */
  editUsuario(usuario: Usuario) {
    this.selectedUsuario = { ...usuario }; // Crea una copia segura
    this.showForm = true;
  }

  /**
   * Inicia el proceso de creación de un nuevo usuario.
   */
  newUsuario() {
    this.selectedUsuario = <Usuario>{ id: -1 };
    this.showDetails = false;
    this.showForm = true;
  }

  /**
  * Maneja la respuesta del componente de formulario tras añadir o editar un usuario.
  * 
  * @param result - Resultado del formulario, incluyendo éxito, mensaje, y el usuario.
  */
  handleFormClose(result: { success: boolean, message?: string, usuario?: Usuario }) {
    //console.log("Formulario cerrado, ¿con éxito?", result.success);
    //console.log("usuario que he modificado", result.usuario);
    this.showForm = false;
    this.selectedUsuario = <Usuario>{}
    if (result.success && result.message == "Añadiendo") {
      this.usuarios.push(result.usuario!);
    } else if (result.success && result.message == "Editando") {
      //this.usuarios.find(e => e.id == result.usuario!.id)!.nombre = result.usuario!.nombre;
      if (this.usId == undefined) {
        const index = this.usuarios.findIndex(e => e.id === result.usuario!.id);
        if (index !== -1) {
          this.usuarios[index] = result.usuario!;
          this.selectedUsuario = result.usuario!;
        }
      } else if (!result.success) {
        this.selectedUsuario = result.usuario!;
      } else {
        //IMPORTANTE: actualiza el usuario actual en el AuthService para notificar a todos los componentes suscritos
        this.serAuth.updateCurrentUser(result.usuario!);//Uso el BeHAviorSubject para que también se cambie el usuario en el nav
        this.usuario = result.usuario!;
        this.selectedUsuario = result.usuario!;
      }
    }
    this.usuario = result.usuario!;
    this.selectedUsuario = result.usuario!;
  }

  /**
   * Maneja el cierre del componente de detalles del usuario.
   * 
   * @param result - Resultado del cierre del panel de detalles.
   */
  handleDetailsClose(result: { success: boolean, message?: string, usuario?: Usuario }) {
    this.showDetails = false;
    this.selectedUsuario = <Usuario>{};
  }

  /**
  * Elimina un usuario con confirmación previa. 
  * Si es exitoso, se actualiza la lista local y se realiza logout si aplica.
  * Utilizamos Swal para mostrar la confirmación como hemos explicado en otros componentes
  * @param id - ID del usuario a eliminar.
  * @param nombre - Nombre del usuario (usado para mostrar mensaje).
  */
  BorraUsuario(id: number, nombre: string) {
    const usuario = this.serAuth.getCurrentUser();
    console.log("Usuario al borra", usuario.rol);
    const mensaje = usuario.rol === 'administrador'
      ? `¿Quieres eliminar a ${nombre}?. Se borraran todos los datos`
      : `¿Estás seguro de que quieres darte de baja ${nombre}?. Perderás todos tus datos`;
    // Usando SweetAlert2 sin async/await
    Swal.fire({
      title: mensaje,
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serusuario.BorraUsuario(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', '', 'success');
            this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);//Crea un nuevo array con la coindición que hemos puesto
            if(usuario.rol != "administrador") this.logout();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }


  anadeTest() {
    console.log("Estoy añadiendo tests");
    this.testservice.anadeTest().subscribe({
      next: (res) => {
        console.log("Esto es lo que recibo al añair Tests", res);
        this.tests.push(res);
      },
      error: (error) => console.log("Esto es un error de anadeTest", error)
    })
  }

  /**
  * Construye la URL completa para acceder a una imagen almacenada en el backend.
  * 
  * @param ruta - Ruta relativa de la fotografía.
  * @returns URL completa para mostrar la imagen.
  */
  getUrl(ruta: string): string {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  /**
   * Redirige a la vista de fotografías de un usuario específico.
   * 
   * @param usuario - Usuario del que se quieren ver las fotos.
   */
  verFotosUsuario(usuario: Usuario) {
    this.ruta.navigate(['/photos', usuario.id]);
  }

  /**
   * Muestra el panel de detalles para el usuario seleccionado.
   * 
   * @param usuario - Usuario cuyos detalles se quieren visualizar.
   */
  verDetallesUsuario(usuario: Usuario) {
    //console.log("Estoy viendo los detalles del usuario", usuario);
    this.showForm = false; // <- Asegura que no esté abierto el form
    this.selectedUsuario = usuario;
    this.showDetails = true;
  }

  /**
  * Cierra la sesión del usuario actual.
  */
  logout() {
    this.serAuth.logout();
  }
}
