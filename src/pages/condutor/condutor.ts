import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-condutor',
  templateUrl: 'condutor.html',
})
export class CondutorPage {



  private condutor={} as Condutor;
  ;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
    let condutor=this.navParams.get('condutor');
    if(condutor!=null){
      this.condutor=condutor;
    }
    else{
      let ref =this.fatguys.obterCondutorPeloUsuarioLogado();
      if(ref!=null){
        ref.subscribe(r=>{
          this.condutor=r[0];
        });        
      }
    }
  }

  salvar(){
      this.fatguys.salvarCondutor(this.condutor).then(r=>{
        this.msg.mostrarMsg("Dados salvos!").onDidDismiss(r=>{
         if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
        })
      }).catch(error=>{
        this.msg.mostrarErro("Erro salvando: "+error);
      });     
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CondutorPage');
  }

}
