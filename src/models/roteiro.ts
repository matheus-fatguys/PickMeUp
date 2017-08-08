import { Conducao } from "./conducao";
export interface Roteiro {
    nome: string,
    hora: number,
    minuto: number,
    segunda: boolean,   
    terca: boolean,   
    quarta: boolean,   
    quinta: boolean,   
    sexta: boolean,   
    sabado: boolean,   
    domingo: boolean,
    conducoes: Conducao[]
}