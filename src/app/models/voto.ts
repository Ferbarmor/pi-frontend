import { Estadistica } from "./estadistica";
import { Photo } from "./photo";

export interface Voto {
    id?: number; // opcional, solo si ya existe el voto
    id_fotografia: number;
    id_usuario: number;
    fecha_voto?: string; // opcional si lo pone el backend
    estadistica?: Estadistica
    fotografia?: Photo;
}
