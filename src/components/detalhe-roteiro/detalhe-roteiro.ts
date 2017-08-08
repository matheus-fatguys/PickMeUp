import { Roteiro } from './../../models/roteiro';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'detalhe-roteiro',
  templateUrl: 'detalhe-roteiro.html'
})
export class DetalheRoteiroComponent {

  @Input() roteiro={} as Roteiro

  constructor() {
    
  }

}
