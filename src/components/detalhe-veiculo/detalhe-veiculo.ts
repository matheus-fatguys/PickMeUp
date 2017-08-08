import { Veiculo } from './../../models/veiculo';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'detalhe-veiculo',
  templateUrl: 'detalhe-veiculo.html'
})
export class DetalheVeiculoComponent {

  @Input() veiculo= {} as Veiculo;  

  constructor() {
  }

}
