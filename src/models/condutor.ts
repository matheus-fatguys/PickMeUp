import { Veiculo } from './veiculo';
import { Usuario } from './usuario';
export interface Condutor{
    id: string,
    nome: string,
    telefone: string,
    usuario: string,
    veiculo: Veiculo  
}