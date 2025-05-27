export interface Rally {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string; //Formato "YYYY-MM-DD"
    fecha_fin: string;    //Formato "YYYY-MM-DD"
    fecha_fin_votacion: string;
    limite_fotos_participante: number;
    created_at: string;   //Formato ISO "2025-03-30T17:25:42.000000Z"
    updated_at: string;   //Formato ISO "2025-03-30T17:25:42.000000Z"
}
