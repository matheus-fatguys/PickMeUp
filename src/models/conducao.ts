import { Conduzido } from './conduzido';
import { Local } from "./local";
export interface Conducao {    
    conduzidos: Conduzido,
    origem: Local,
    destino: Local
}