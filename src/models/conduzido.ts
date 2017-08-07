import { Condutor } from './condutor';
import { Usuario } from './usuario';
export interface Conduzido{
    id: string,
    nome: string,
    telefone: string,
    condutor: string,
    chave: number
}