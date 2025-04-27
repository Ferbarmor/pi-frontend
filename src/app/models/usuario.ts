import { Photo } from "./photo";
import { Rally } from "./rally";

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: 'participante' | 'administrador';
    id_rally?: number | null;  // Opcional y nullable para coincidir con tu schema
    created_at?: string;       // Opcional si necesitas las marcas de tiempo
    updated_at?: string;
    rally?: Rally;  
    fotografias?: Photo[];     // Opcional si necesitas las marcas de tiempo
  }
  
  // Interfaz para creación de usuario (sin campos opcionales)
  export interface NuevoUsuario {
    nombre: string;
    email: string;
    password: string;
    rol: 'participante' | 'administrador';
    id_rally?: number | null;  // Solo requerido para participantes
  }
  
  // Interfaz para actualización de usuario (todos los campos opcionales)
  export interface ActualizarUsuario {
    nombre?: string;
    email?: string;
    password?: string;
    rol?: 'participante' | 'administrador';
    id_rally?: number | null;
  }
  
  // Interfaz para respuesta de autenticación
  export interface AuthResponse {
    token: string;
    usuario: Usuario;
  }