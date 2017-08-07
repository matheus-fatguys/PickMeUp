import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseListObservable } from 'angularfire2/database';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Observable } from 'rxjs';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Chave } from './../../models/chave';
import { Conduzido } from './../../models/conduzido';
import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'detalhe-conduzido',
  templateUrl: 'detalhe-conduzido.html'
})
export class DetalheConduzidoComponent {  

  @Input() conduzido= {} as Conduzido;  
  @Input() chave= {} as Chave;
  

  constructor() {   
  }

}
