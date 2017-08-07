import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conduzido } from './../../models/conduzido';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-cadastro-conduzidos',
  templateUrl: 'cadastro-conduzidos.html',
})
export class CadastroConduzidosPage implements OnInit {
  
  private conduzidos;
  private conduzidoSelecionado;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public fatguys: FatguysUberProvider,
  public msg: MensagemProvider) {
  }

  ngOnInit(): void {
    this.conduzidos=this.fatguys.obterConduzidos();
  }

  onSelect(conduzido){
    this.conduzidoSelecionado=conduzido;
    //this.detalhe();
  }  

  detalhe(){
    this.navCtrl.push('ConduzidoPage',{conduzido:this.conduzidoSelecionado});
  }

  novo(){
    this.navCtrl.push('ConduzidoPage',{} as Conduzido);
  }

  excluir(conduzido){
    if(conduzido!=null){
      this.conduzidoSelecionado=conduzido;
    }
    this.fatguys.excluirConduzido(this.conduzidoSelecionado.id).then(
      (r)=>{
        this.msg.mostrarMsg("Exclusão realizada!");
      },
      e=>{
        this.msg.mostrarErro("Erro excluindo: "+e.message);  
      }
    ).catch(error=>{
      this.msg.mostrarErro("Erro excluindo: "+error);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroConduzidosPage');
  }

}
