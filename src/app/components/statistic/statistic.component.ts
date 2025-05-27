import { Component } from '@angular/core';
import { EstadisticaService } from '../../services/estadistica.service';
import { CommonModule } from '@angular/common';;
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment.development';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
//Registro de plugins necesarios para Chart.js
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-statistic',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.css'
})
export class StatisticComponent {
  public fotoSeleccionada: string | null = null;
  public mostrarModal = false;
  constructor(private sevestad: EstadisticaService) {

  }

  public estadisticas: any = {};

  /**.
  * Llama a la función que carga las estadísticas desde el servicio.
  */
  ngOnInit() {
    this.loadStatistics();
  }

  /**
   * Carga las estadísticas del rally desde el backend.
   * Al recibir los datos, llama a la función para preparar los gráficos.
   */
  private loadStatistics() {
    this.sevestad.EstadisticasRally(1).subscribe({
      next: (data) => {
        this.estadisticas = data;
        //console.log("Estadísticas cargadas", this.estadisticas);
        this.prepareCharts(); //Prepara lso datos para los gráficos
      },
      error: (err) => {
        console.error("Error cargando estadísticas", err);
      }
    });
  }

  /** Configuración de datos para el gráfico de participación */
  public participacionChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public participacionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: this.isMobile() ? 'y' : 'x',
    plugins: {
      title: {
        display: true,
        text: 'Participación por Usuario'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  public participacionChartType: ChartType = 'bar';

  /** Configuración y datos del gráfico de top fotos más votadas */
  public topFotosChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public topFotosChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      },
      datalabels: {
        formatter: (value: number, context) => {
          const data = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: '#000',
        anchor: 'end',
        align: 'start',
        font: {
          weight: 'bold' as const
        }
      }
    }
  };

  /**
  * Prepara los datos y configuraciones necesarias para los gráficos estadísticos.
  * Se filtran los usuarios para excluir al administrador.
  */
  prepareCharts(): void {
    //Filtramos usuarios que no sean administradores
    const usuariosFiltrados = this.estadisticas.participacion_usuarios.filter((u: any) => u.nombre !== 'Administrador');
    //Prepara gráfico de participación
    this.participacionChartData = {
      labels: usuariosFiltrados.map((u: any) => u.nombre),
      datasets: [
        {
          data: usuariosFiltrados.map((u: any) => u.total_fotos),
          label: 'Fotos Subidas',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          data: usuariosFiltrados.map((u: any) => u.total_votos),
          label: 'Votos Realizados',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    //Prepara gráfico de top fotos
    this.topFotosChartData = {
      labels: this.estadisticas.top_fotos.map((f: any) => `${f.titulo} (${f.usuario.nombre})`),
      datasets: [
        {
          data: this.estadisticas.top_fotos.map((f: any) => f.estadistica.total_votos),
          label: 'Votos Recibidos',
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  }

  /**
  * Construye la URL completa para acceder a una imagen desde el almacenamiento.
  * @param ruta - Ruta relativa del archivo
  * @returns URL completa
  */
  getUrl(ruta: string) {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  /**
   * Abre el modal para ver una foto en tamaño completo.
   * @param url - URL de la foto a mostrar
   */
  verFotoGrande(url: string) {
    this.fotoSeleccionada = url;
    this.mostrarModal = true;
  }

  /**
   * Verifica si el dispositivo actual es móvil según el ancho de la pantalla.
   * @returns true si el ancho es menor o igual a 576px
   */
  isMobile(): boolean {
    return window.innerWidth <= 576;
  }

  /** Cierra el modal de imagen ampliada */
  cerrarModal() {
    this.mostrarModal = false;
  }

  /** Hace scroll suave hacia la parte superior de la página */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
