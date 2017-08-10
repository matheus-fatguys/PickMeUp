import { Conducao } from './../../models/conducao';
import { ConducoesNaoAssociadasModalPage } from './../../pages/conducoes-nao-associadas-modal/conducoes-nao-associadas-modal';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Roteiro } from './../../models/roteiro';
import { Component, Input } from '@angular/core';
import { ModalController } from "ionic-angular";


@Component({
  selector: 'detalhe-roteiro',
  templateUrl: 'detalhe-roteiro.html'
})
export class DetalheRoteiroComponent{
  

  @Input() roteiro={} as Roteiro
  conducaoSelecionada:Conducao; 
  // conducoes; 

  constructor( 
    public modalCtrl: ModalController,
    public msg: MensagemProvider) {
    
  }
 

  mostrarConducoesNaoAssociadas(){
    let modal = this.modalCtrl.create(ConducoesNaoAssociadasModalPage, {roteiro: this.roteiro});
    modal.onDidDismiss(data => {
      console.log(data);
      if(data!=null&&data.conducao!=null){
        this.roteiro.conducoes.push(data.conducao);
      }
    });
    modal.present();
  }

  onSelect(conducao){
    this.conducaoSelecionada=conducao;
    //this.detalhe();
  }

  desassociarConducao(){
    this.roteiro.conducoes=this.roteiro.conducoes.filter(c=>{return c.id!=this.conducaoSelecionada.id});
    // this.conducoes=this.conducoes.filter(c=>{return c.id!=this.conducaoSelecionada.id});
  }

}
