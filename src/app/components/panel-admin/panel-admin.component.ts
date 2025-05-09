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

@Component({
  selector: 'app-panel-admin',
  imports: [FormRegisterComponent, UserDetailsComponent],
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
  ngOnInit() {
    this.usId = this.route.snapshot.params["id"];
    console.log("El id del usuario es", this.usId);
    const usuario = this.serAuth.getCurrentUser();
    console.log("Estoy en el listado de usuarios");
    this.usId == undefined ? this.loadUsuarios() : this.loadUsuarioId(this.usId);

    console.log("Estoy mostrando las fotografías");
    if (usuario != null) {
      this.serphoto.ListarFotografiasPorUsuario(usuario.id).subscribe({
        next: (res) => {
          console.log("Esto es lo que recibo al listar las fotos", res);
          this.fotos = res;
        },
        error: (error) => console.log("Esto es un error de listar fotografías por usuario", error)
      })
    }
  }
  //Método oara saber si tiene alguna foto pendiente para validar
  tieneFotosPendientes(usuario: Usuario): boolean {
    return usuario.fotografias?.some(foto => foto.estado === 'pendiente') || false;
  }

  loadUsuarios() {
    this.serusuario.ListarUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res,
          console.log("Esto es lo que recibo al listar los usuarios", res);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  loadUsuarioId(id: number) {
    this.serusuario.ObtenerUsuarioId(id).subscribe({
      next: (res) => {
        this.usuario = res,
          console.log("Esto es lo que recibo al listar los usuarios", res);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  editUsuario(usuario: Usuario) {
    this.selectedUsuario = { ...usuario }; // Crea una copia segura
    this.showForm = true;
  }

  newUsuario() {
    this.selectedUsuario = <Usuario>{ id: -1 };
    this.showDetails = false;
    this.showForm = true;
  }

  handleFormClose(result: { success: boolean, message?: string, usuario?: Usuario }) {
    console.log("Formulario cerrado, ¿con éxito?", result.success);
    console.log("usuario que he modificado", result.usuario);
    this.showForm = false;
    this.selectedUsuario = <Usuario>{}
    if (result.success && result.message == "Añadiendo") {
      this.usId == undefined ? this.usuario = result.usuario : this.usuarios.push(result.usuario!);
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
        this.serAuth.updateCurrentUser(result.usuario!);//Uso el BeHAviorSubject ara que también se cambie el usuario en el nav
        this.usuario = result.usuario!;
        this.selectedUsuario = result.usuario!;
      }
    }
  }

  handleDetailsClose(result: { success: boolean, message?: string, usuario?: Usuario }) {
    this.showDetails = false;
    this.selectedUsuario = <Usuario>{};
  }

  BorraUsuario(id: number, nombre: string) {
    // Usando SweetAlert2 sin async/await
    Swal.fire({
      title: `¿Quieres eliminar a ${nombre}?`,
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

  getUrl(ruta: string): string {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  verFotosUsuario(usuario: Usuario) {
    this.ruta.navigate(['/photos', usuario.id]);
  }

  verDetallesUsuario(usuario: Usuario) {
    console.log("Estoy viendo los detalles del usuario", usuario);
    this.showForm = false; // <- Asegura que no esté abierto el form
    this.selectedUsuario = usuario;
    this.showDetails = true;
  }

}
