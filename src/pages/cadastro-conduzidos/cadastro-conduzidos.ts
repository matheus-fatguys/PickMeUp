import { Chave } from './../../models/chave';
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
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    let sub = ref.subscribe(
      conds=>{
        this.conduzidos=this.fatguys.obterConduzidos(conds[0]);
      }
    );
    
  }

  onSelect(conduzido){
    this.conduzidoSelecionado=conduzido;
    //this.detalhe();
  }  

  detalhe(){
    let sub = this.fatguys.obterChaveDoConduzido(this.conduzidoSelecionado)
    .subscribe(
        r=>{
          let chave={} as Chave;
          //chave.chave=r[0].chave;
          chave=r[0] as Chave;
          chave.conduzido=this.conduzidoSelecionado.id;
          this.navCtrl.push('ConduzidoPage',{conduzido:this.conduzidoSelecionado, chave:chave});          
          sub.unsubscribe();
        }
      );    
  }

  novo(){
    this.navCtrl.push('ConduzidoPage',{} as Conduzido);
  }

  excluir(conduzido){
    if(conduzido!=null){
      this.conduzidoSelecionado=conduzido;
    }
    this.fatguys.excluirConduzido(this.conduzidoSelecionado).then(
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
