import { Condutor } from './../../models/condutor';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'detalhe-condutor',
  templateUrl: 'detalhe-condutor.html'
})
export class DetalheCondutorComponent {

  @Input() condutor= {} as Condutor;

  constructor() {
  }

}
