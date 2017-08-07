import { AutenticacaoProvider } from './../../providers/autenticacao/autenticacao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
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
    // if(this.auth.usuarioLogado()){
    //   this.navCtrl.setRoot('HomePage');
    // }
  }

  private usuario= {} as Usuario;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private fatguysService: FatguysUberProvider,
    private auth : AutenticacaoProvider,
    private msg : MensagemProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  

  async login(){
    try {
      this.auth.logar(this.usuario).then(
        res=>{          
          let ul =this.fatguysService.obterCondutorPeloUsuarioLogado()
          .subscribe(condutor=>{
            ul.unsubscribe();
            if(condutor[0]){
              this.msg.mostrarMsg("Bem vindo, "+ condutor[0].nome +"!");
                      // .onDidDismiss(d=>{
                      //     this.navCtrl.setRoot('HomePage');
                      // });
            }
            else{
              this.msg.mostrarErro("Não foi possível obter dados do condutor!");
            }
            ul.unsubscribe();
          });                    
        }
      ).catch(error => {
        this.msg.mostrarErro('Falha no login: '+error);
      });
    } catch (error) {
      console.error(error);
      this.msg.mostrarErro('Falha no login: '+error);
    }
  }

  registrar(){
    this.navCtrl.push("RegistrarPage");
  }

}
