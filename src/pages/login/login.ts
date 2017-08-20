import { AutenticacaoProvider } from './../../providers/autenticacao/autenticacao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Usuario } from './../../models/usuario';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";


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
  private loginForm:FormGroup;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private fatguysService: FatguysUberProvider,
    private auth : AutenticacaoProvider,
    private msg : MensagemProvider,
  public formBuilder: FormBuilder) {
      this.loginForm = formBuilder.group({
        email: ['', Validators.required],
        senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  

  async login(){
    try {
      if(this.loginForm.invalid){
        this.msg.mostrarErro("Verifique o preenchimmento dos campos");
        return;
      }
      this.auth.logar(this.usuario).then(
        res=>{          
          let ul =this.fatguysService.obterCondutorPeloUsuarioLogado()
          .subscribe(condutor=>{
            ul.unsubscribe();
            if(condutor[0]){
              this.msg.mostrarMsg("Bem vindo, "+ condutor[0].nome +"!", 3000)
                      .onDidDismiss(d=>{
                          this.navCtrl.setRoot('HomePage');
                      });
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
