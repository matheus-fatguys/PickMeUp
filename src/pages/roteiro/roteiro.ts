import { AudioProvider } from './../../providers/audio/audio';
import { DetalheRoteiroComponent } from './../../components/detalhe-roteiro/detalhe-roteiro';
import { Condutor } from './../../models/condutor';
import { Roteiro } from './../../models/roteiro';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-roteiro',
  templateUrl: 'roteiro.html',
})
export class RoteiroPage {  
  private roteiro={} as Roteiro;

  @ViewChild(DetalheRoteiroComponent)
  detalheRoteiro : DetalheRoteiroComponent;

  roteiroValido:boolean;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
      }
  }

  salvar(){
    let ref= this.fatguys.obterCondutorPeloUsuarioLogado().subscribe(
      r=>{
        this.roteiro.condutor=r[0].id;
        this.salvarRoteiro();
        ref.unsubscribe();
      }
    )   
  }

  salvarRoteiro(){
    let sub = this.fatguys.salvarRoteiro(this.roteiro).then(
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

  iniciar(){
    this.navCtrl.setRoot('ViagemPage',{roteiro:this.roteiro});
  }

  onChangeRoteiroValido(){
    this.roteiroValido=this.detalheRoteiro.isValido();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoteiroPage');    
  }

}
