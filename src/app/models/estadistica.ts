import { Photo } from "./photo";

export interface Estadistica {
    id: number;
    ranking: number;
    total_votos: number;
    fotografia_id: number;
    fotografia?: Photo;
}
