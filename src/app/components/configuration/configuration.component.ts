import { Component } from '@angular/core';
import { Rally } from '../../models/rally';
import { RalliesService } from '../../services/rallies.service';
import Swal from 'sweetalert2';
import { FormRallyComponent } from "../form-rally/form-rally.component";
import { RallyDetailsComponent } from "../rally-details/rally-details.component";

@Component({
  selector: 'app-configuration',
  imports: [FormRallyComponent, RallyDetailsComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent {
  public rallies: Rally[] = [];
  public showDetails: boolean = false;
  public showForm: boolean = false;
  public selectedRally: Rally = <Rally>{};

  constructor(private serrally: RalliesService) { }

  /**
  * Método que se ejecuta al iniciar el componente.
  * Recupera la lista de rallies desde el servicio.
  */
  ngOnInit() {
    this.serrally.ListarRallies().subscribe({
      next: (res) => {
        this.rallies = res;
      },
      error: (error) => console.log("Esto es un error de listar rallies", error)
    })
  }

  /**
  * Prepara la interfaz para crear un nuevo rally.
  * Se asigna un ID temporal (-1) para indicar que es nuevo.
  */
  newRally() {
    this.selectedRally = <Rally>{ id: -1 };
    this.showDetails = false;
    this.showForm = true;
  }

  /**
  * Carga los datos de un rally existente en el formulario para editarlo.
  * @param rally Rally a editar.
  */
  editRally(rally: Rally) {
    this.selectedRally = { ...rally }; //Crea una copia segura
    this.showForm = true;
  }

  /**
  * Maneja el cierre del formulario de alta/edición.
  * Dependiendo del resultado, actualiza el listado.
  * 
  * @param result Resultado del formulario, incluyendo si fue exitoso y el rally modificado/creado.
  */
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
        this.rallies[index] = result.rally!;//Usamos ! para evitar que TypeScript muestre errores de tipo por posible null o undefined.
        this.selectedRally = result.rally!;
      }
    } else if (!result.success) {
      this.selectedRally = result.rally!;
    }
  }

  /**
   * Maneja el cierre del modal de detalles de un rally.
   * Resetea la selección.
   * 
   * @param result Resultado del modal de detalles (actualmente no se usa).
   */
  handleDetailsClose(result: { success: boolean, message?: string, rally?: Rally }) {
    this.showDetails = false;
    this.selectedRally = <Rally>{};
  }

  /**
 * Elimina un rally después de confirmar la acción mediante una alerta.
 * 
 * Este método utiliza SweetAlert2 (`Swal.fire`) para mostrar una ventana emergente de confirmación 
 * antes de eliminar un rally. Si el usuario confirma, se llama al servicio para eliminar el rally.
 * 
 * @param id ID del rally a eliminar.
 * @param nombre Nombre del rally a mostrar en la alerta.
 */
  BorraRally(id: number, nombre: string) {
    //Usando SweetAlert2 sin async/await
    Swal.fire({
      title: `¿Quieres eliminar el rally ${nombre}?`,
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

  /**
  * Muestra los detalles de un rally seleccionado.
  * 
  * @param rally Rally del cual se quieren ver los detalles.
  */
  verDetallesRally(rally: Rally) {
    console.log("Estoy viendo los detalles del rally", rally);
    this.showForm = false; //Asegura que no esté abierto el form
    this.selectedRally = rally;
    this.showDetails = true;
  }
}


