import { Component } from '@angular/core';
import { EstadisticaService } from '../../services/estadistica.service';
import { CommonModule } from '@angular/common';;
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment.development';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    this.sevestad.EstadisticasRally(1).subscribe({
      next: (data) => {
        this.estadisticas = data;
        console.log("Estadísticas cargadas", this.estadisticas);
        this.prepareCharts(); // 👈 Esto es lo que faltaba
      },
      error: (err) => {
        console.error("Error cargando estadísticas", err);
      }
    });
  }

  // Gráfico de participación
  public participacionChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public participacionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
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

  // Gráfico de top fotos
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

  prepareCharts(): void {
    // Gráfico de participación
    //Filtrar usuarios que no sean administradores
    const usuariosFiltrados = this.estadisticas.participacion_usuarios.filter((u: any) => u.nombre !== 'Administrador');
    this.participacionChartData = {
      labels: usuariosFiltrados.map((u: any) => u.nombre),
      datasets: [
        {
          data: this.estadisticas.participacion_usuarios.map((u: any) => u.total_fotos),
          label: 'Fotos Subidas',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          data: this.estadisticas.participacion_usuarios.map((u: any) => u.total_votos),
          label: 'Votos Realizados',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    // Gráfico de top fotos
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

  getUrl(ruta: string) {
    return `${environment.BASE_URL}/storage/${ruta}`;
  }

  verFotoGrande(url: string) {
    this.fotoSeleccionada = url;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
