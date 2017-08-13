import { Conduzido } from './conduzido';
import { Local } from "./local";
export interface Conducao {    
    id: string,
    condutor: string,
    conduzido: string,
    conduzidoVO: Conduzido,
    origem: Local,
    destino: Local,
    cancelada?:boolean
}