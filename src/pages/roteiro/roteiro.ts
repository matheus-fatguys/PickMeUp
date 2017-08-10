import { Condutor } from './../../models/condutor';
import { Roteiro } from './../../models/roteiro';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-roteiro',
  templateUrl: 'roteiro.html',
})
export class RoteiroPage {  
  private roteiro={} as Roteiro;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      console.log("construtor RoteiroPage");
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
    this.fatguys.salvarRoteiro(this.roteiro).then(
      r=>{
        this.msg.mostrarMsg("Dados salvos!").onDidDismiss(d=>{
          if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
        });
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      }); 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoteiroPage');
    this.navCtrl.getViews().forEach((v,i)=>{
      // console.log("paginas: "+v.name);
      console.log("paginas["+i+"]: "+v.name);
    });
  }

}
