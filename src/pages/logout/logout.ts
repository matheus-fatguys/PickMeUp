import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { AutenticacaoProvider } from './../../providers/autenticacao/autenticacao';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage {

  condutor={} as Condutor;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth:  AutenticacaoProvider,
    public fatguysService: FatguysUberProvider,
    private msg : MensagemProvider) { 
      let ref = this.fatguysService.obterCondutorPeloUsuarioLogado();
      if(ref!=null){
      ref.subscribe(r=>{
        if(r[0]){
          this.condutor=r[0];
        }
        else{
          this.navCtrl.setRoot('LoginPage');
        }
      });
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogoutPage');
  }

  sair(){
    this.auth.logout().then(r=>{
        // this.navCtrl.setRoot("LoginPage");
        this.msg.mostrarMsg("Até logo, "+this.condutor.nome);
    });
  }

}
