import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Usuario } from './../../models/usuario';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-registrar',
  templateUrl: 'registrar.html',
})
export class RegistrarPage {

  private usuario= {} as Usuario;

  constructor(public navCtrl: NavController, public navParams: NavParams, private fatguysService: FatguysUberProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarPage');
  }

  async registrar(){
    try {
      let resultado = this.fatguysService.registrarUsuario(this.usuario);
      console.log(resultado);
    } catch (error) {
      console.error(error);
    }
  }

}
