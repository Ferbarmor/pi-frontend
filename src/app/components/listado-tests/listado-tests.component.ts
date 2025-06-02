import { Component } from '@angular/core';
import { TestsService } from '../../services/tests.service';
import { FotografiasService } from '../../services/fotografias.service';
import { environment } from '../../../environments/environment.development';
import { Photo } from '../../models/photo';
import { UsuarioService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario';
import { Router, RouterLink } from '@angular/router';
import { FormRegisterComponent } from "../form-register/form-register.component";
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-listado-tests',
  imports: [FormRegisterComponent],
  templateUrl: './listado-tests.component.html',
  styleUrl: './listado-tests.component.css'
})
export class ListadoTestsComponent {
  public showForm: boolean = false;
  public selectedUsuario: Usuario = <Usuario>{}
  public tests: any[] = [];
  public fotos: Photo[] = [];
  public usuarios: Usuario[] = [];
  constructor(private testservice: TestsService, private serphoto: FotografiasService,
    private serusuario: UsuarioService, private ruta: Router, private serAuth: AuthService) { }
  ngOnInit() {
    const usuario = this.serAuth.getCurrentUser();
    console.log("Estoy en el listado de usuarios");
    this.loadUsuarios();

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

  loadUsuarios() {
    this.serusuario.ListarUsuarios().subscribe({
      next: (res) => this.usuarios = res,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  editUsuario(usuario: Usuario) {
    this.selectedUsuario = { ...usuario };//Copia el objeto para evitar mutaciones
    //const deepCopy = JSON.parse(JSON.stringify(originalObject));
    this.showForm = true;
  }

  newUsuario() {
    //this.selectedUsuario = { id: -1 } as Usuario;
    this.selectedUsuario = <Usuario>{id: -1};
    this.showForm = true;
  }

  handleFormClose(result: { success: boolean, message?: string, usuario?: Usuario }) {
    //console.log("Formulario cerrado, ¿con éxito?", result.success);
    //console.log("usuario que he modificado", result.usuario);
    this.showForm = false;
    this.selectedUsuario = <Usuario>{}
    if (result.success && result.message == "Añadiendo") {
      this.usuarios.push(result.usuario!);
    } else if(result.success && result.message == "Editando") {
      //this.usuarios.find(e => e.id == result.usuario!.id)!.nombre = result.usuario!.nombre;
      const index = this.usuarios.findIndex(e => e.id === result.usuario!.id);
      if (index !== -1) {
        this.usuarios[index] = result.usuario!;
      }
    }
    // Puedes mostrar el mensaje si lo necesitas
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
            this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
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

  verFotosUsuario(usuario: Usuario){}

  verDetallesUsuario(usuario: Usuario) {}
}
