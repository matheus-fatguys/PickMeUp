import { DetalheConducaoComponent } from './../../components/detalhe-conducao/detalhe-conducao';
import { Local } from './../../models/local';
import { Conduzido } from './../../models/conduzido';
import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, IonicPage, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-conducao',
  templateUrl: 'conducao.html'
})
export class ConducaoPage {

  private conducao={} as Conducao;
  private conduzido={} as Conduzido;

  @ViewChild(DetalheConducaoComponent)
  private detalheConducao: DetalheConducaoComponent;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider ) {
  
      // let conduzido=this.navParams.get('conduzido');
      // if(conduzido){
      //   this.conduzido=conduzido as Conduzido;      
      // }
      let conducao=this.navParams.get('conducao');
      if(conducao){
        this.conducao=conducao as Conducao;         
      }
      else{
        this.conducao={} as Conducao; 
        this.conducao.origem={} as Local;
        this.conducao.destino={} as Local;
      }
  }

  salvar(){
    this.conducao.conduzido=this.detalheConducao.conducao.conduzido;
    this.fatguys.salvarConducao(this.conducao).then(
      r=>{
        this.msg.mostrarMsg("Dados salvos!", 3000).onDidDismiss(d=>{
          if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
        });
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      });
  }

}
