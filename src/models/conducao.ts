import { Local } from "./local";
export interface Conducao {    
    id: string,
    condutor: string,
    conduzido: string,
    origem: Local,
    destino: Local
}