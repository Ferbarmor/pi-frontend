import { Estadistica } from "./estadistica";
import { Voto } from "./voto";

export interface Photo {
    id: number;
    titulo: string;
    descripcion: string | null;
    ruta_archivo: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    fecha_subida?: string; // Opcional
    usuario_id: number; // Solo el ID, no el objeto completo
    rally_id: number;   // Solo el ID, no el objeto completo
    usuario?:{nombre: string}; // Solo el nombre del usuario, opcional
    estadistica?: Estadistica;
    votos: Voto[];
}
