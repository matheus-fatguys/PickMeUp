import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Usuario } from './../../models/usuario';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit{
  ngOnInit(): void {
  }

  private usuario= {} as Usuario;

  constructor(public navCtrl: NavController, public navParams: NavParams, private fatguysService: FatguysUberProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  async login(){
    try {
      let resultado = this.fatguysService.logar(this.usuario);
      if(resultado){
        this.navCtrl.setRoot('HomePage');
      }
    } catch (error) {
      console.error(error);
    }
  }

  registrar(){
    this.navCtrl.push("RegistrarPage");
  }

}
