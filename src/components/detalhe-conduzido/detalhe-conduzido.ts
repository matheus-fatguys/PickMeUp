import { Conduzido } from './../../models/conduzido';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'detalhe-conduzido',
  templateUrl: 'detalhe-conduzido.html'
})
export class DetalheConduzidoComponent {

  @Input() conduzido= {} as Conduzido;

  constructor() {
  }

  

  

}
