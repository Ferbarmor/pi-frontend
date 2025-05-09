import { Component } from '@angular/core';
import { Rally } from '../../models/rally';
import { RalliesService } from '../../services/rallies.service';
import Swal from 'sweetalert2';
import { FormRegisterComponent } from '../form-register/form-register.component';
import { FormRallyComponent } from "../form-rally/form-rally.component";
import { RallyDetailsComponent } from "../rally-details/rally-details.component";

@Component({
  selector: 'app-configuration',
  imports: [FormRegisterComponent, FormRallyComponent, RallyDetailsComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent {
  public rallies: Rally[] = [];
  public showDetails: boolean = false;
  public showForm: boolean = false;
  public selectedRally: Rally = <Rally>{};

  constructor(private serrally: RalliesService) { }

  ngOnInit() {
    console.log("Estoy en el listado de rallies");

    this.serrally.ListarRallies().subscribe({
      next: (res) => {
        console.log("Esto es lo que recibo al listar rallies", res);
        this.rallies = res;
      },
      error: (error) => console.log("Esto es un error de listar rallies", error)
    })
  }

  //Método para añadir un rally
  newRally() {
    this.selectedRally = <Rally>{ id: -1 };
    this.showDetails = false;
    this.showForm = true;
  }

  editRally(rally: Rally) {
    this.selectedRally = { ...rally }; // Crea una copia segura
    this.showForm = true;
  }

  handleFormClose(result: { success: boolean, message?: string, rally?: Rally }) {
    console.log("Formulario cerrado, ¿con éxito?", result.success);
    console.log("Rally que he modificado", result.rally);
    this.showForm = false;
    this.selectedRally = <Rally>{}
    if (result.success && result.message == "Añadiendo") {
      this.rallies.push(result.rally!);
    } else if (result.success && result.message == "Editando") {
      //this.usuarios.find(e => e.id == result.usuario!.id)!.nombre = result.usuario!.nombre;
      const index = this.rallies.findIndex(e => e.id === result.rally!.id);
      if (index !== -1) {
        this.rallies[index] = result.rally!;
        this.selectedRally = result.rally!;
      }
    } else if (!result.success) {
      this.selectedRally = result.rally!;
    }
  }

  handleDetailsClose(result: { success: boolean, message?: string, rally?: Rally }) {
    this.showDetails = false;
    this.selectedRally = <Rally>{};
  }

  BorraRally(id: number, nombre: string) {
    // Usando SweetAlert2 sin async/await
    Swal.fire({
      title: `¿Quieres eliminar ell rally ${nombre}?`,
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serrally.BorraRally(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', '', 'success');
            this.rallies = this.rallies.filter(rally => rally.id !== id);//Crea un nuevo array con la coindición que hemos puesto
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  verDetallesRally(rally: Rally) {
    console.log("Estoy viendo los detalles del rally", rally);
    this.showForm = false; // <- Asegura que no esté abierto el form
    this.selectedRally = rally;
    this.showDetails = true;
  }
}


