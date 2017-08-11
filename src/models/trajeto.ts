import { Perna } from "./perna";

export interface Trajeto {
    roteiro: string,
    tempoTotal: string,
    distanciaTotal: string,
    pernas: Perna[]   
}