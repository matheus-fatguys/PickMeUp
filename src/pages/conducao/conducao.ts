import { Local } from './../../models/local';
import { Conduzido } from './../../models/conduzido';
import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component } from '@angular/core';
import { NavController, AlertController, IonicPage, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-conducao',
  templateUrl: 'conducao.html'
})
export class ConducaoPage {

  private conducao={} as Conducao;
  private conduzido={} as Conduzido;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider ) {
  
      let conduzido=this.navParams.get('conduzido');
      let conducao=this.navParams.get('conducao');
      if(conduzido){
        this.conduzido=conduzido as Conduzido;      
      }
      if(conducao){
        this.conducao=conducao as Conducao;         
      }
      else{
        this.conducao={} as Conducao; 
        this.conducao.origem={} as Local;
        this.conducao.destino={} as Local;
      }
  }

 

}
