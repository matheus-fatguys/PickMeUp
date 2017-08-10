import { Condutor } from './../../models/condutor';
import { Observable } from 'rxjs/Rx';
import { ConducoesNaoAssociadasModalPage } from './../../pages/conducoes-nao-associadas-modal/conducoes-nao-associadas-modal';
import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Roteiro } from './../../models/roteiro';
import { Component, Input } from '@angular/core';
import { ModalController } from "ionic-angular";


@Component({
  selector: 'detalhe-roteiro',
  templateUrl: 'detalhe-roteiro.html'
})
export class DetalheRoteiroComponent {

  @Input() roteiro={} as Roteiro
  conducaoSelecionada:Conducao; 
  conducoes; 

  constructor( 
    public modalCtrl: ModalController,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
    
  }

  mostrarConducoesNaoAssociadas(){
    let modal = this.modalCtrl.create(ConducoesNaoAssociadasModalPage, {roteiro: this.roteiro});
    modal.onDidDismiss(data => {
     console.log(data);
     if(this.roteiro.conducoes==null){

       this.conducoes =this.fatguys.obterConducoesComConduzidos({id:"-Kr2XRBVjGmF4XGSxTpO"} as Condutor);
       this.conducoes.subscribe(
         conducoes=>{
            this.roteiro.conducoes=conducoes;
            this.roteiro.conducoes.push(data.conducao);
         }
       );
     }
    else{
      this.roteiro.conducoes.push(data.conducao);
    }
   });
    modal.present();
  }

  desassociarConducao(){

  }

}
