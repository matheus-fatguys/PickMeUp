import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Veiculo } from './../../models/veiculo';
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
  private registrarForm:FormGroup;
  private mascaras:any="";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private fatguysService: FatguysUberProvider,
    private msg : MensagemProvider,
  public formBuilder: FormBuilder) {
      this.condutor.veiculo={} as Veiculo;
      this.registrarForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, Validators.pattern('^\\\w+([\\\.-]?\w+)*@\\\w+([\\\.-]?\w+)*(\\\.\\\w{2,3})+$')])],
        senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
        telefone: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.pattern('^[(][0-9]{2}[)][\\\s]?[0-9]{4,5}[-][0-9]{4}$')])],
    });
    this.mascaras = {
            celular: ['(', /[1-9]/, /[1-9]/, ')', ' ',/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            email: [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarPage');
  }

  async registrar(){
    try {
      let resultado = this.fatguysService.registrarCondutor(this.condutor, this.usuario).then(
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
