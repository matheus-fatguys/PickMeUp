import { Conducao } from "./conducao";
export interface Roteiro {
    id: string,
    condutor: string,
    nome: string,
    hora: number,
    minuto: number,
    domingo: boolean,
    segunda: boolean,   
    terca: boolean,   
    quarta: boolean,   
    quinta: boolean,   
    sexta: boolean,   
    sabado: boolean,   
    conducoes: Conducao[],
    ativo: boolean
}