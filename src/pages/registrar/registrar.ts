import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Usuario } from './../../models/usuario';
import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-registrar',
  templateUrl: 'registrar.html',
})
export class RegistrarPage {

  private usuario= {} as Usuario;
  private condutor= {} as Condutor;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private fatguysService: FatguysUberProvider,
    private msg : MensagemProvider) {
    this.condutor.usuario=this.usuario;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarPage');
  }

  async registrar(){
    try {
      let resultado = this.fatguysService.registrarCondutor(this.condutor).then(
        ref => {
          let toast = this.msg.mostrarMsg('Bem vindo, '+this.condutor.nome+'!');
          toast.onDidDismiss(() => {
            this.navCtrl.setRoot('HomePage');
          });
        }
      ).catch(error=>{
          this.msg.mostrarErro('Erro registrando: ' + error);
      });
    } catch (error) {
      this.msg.mostrarErro(error);
    }
  }
  

}
