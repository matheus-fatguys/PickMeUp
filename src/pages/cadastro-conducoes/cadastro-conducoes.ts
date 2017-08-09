import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-cadastro-conducoes',
  templateUrl: 'cadastro-conducoes.html',
})
export class CadastroConducoesPage  implements OnInit{


  private conducoes;
  private conducaoSelecionada;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
  }

  ngOnInit(): void {
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    if(ref!=null){
      let sub = ref.subscribe(
        conds=>{
          this.conducoes=this.fatguys.obterConducoes(conds[0]);
        }
      );
    }    
  }

  toggleAtivar(conducao: Conducao){
    // this.fatguys.salvarConducao(conducao).then(
    //   r=>{
        
    //   }
    // ).catch(error=>{
    //     this.msg.mostrarMsg("Erro salvando : "+error);
    //   });
  }

  onSelect(conducao){
    this.conducaoSelecionada=conducao;
    //this.detalhe();
  }  

  detalhe(){
    // let sub = this.fatguys.obterChaveDoConducao(this.conduzidoSelecionado)
    // .subscribe(
    //     r=>{
    //       let chave={} as Chave;
    //       //chave.chave=r[0].chave;
    //       chave=r[0] as Chave;
    //       chave.conducao=this.conduzidoSelecionado.id;
    //       this.navCtrl.push('ConducaoPage',{conducao:this.conduzidoSelecionado, chave:chave});          
    //       sub.unsubscribe();
    //     }
    //   );    
  }

  novo(){
    this.navCtrl.push('ConducaoPage',{} as Conducao);
  }

  excluir(conducao){
    // if(conducao!=null){
    //   this.conduzidoSelecionado=conducao;
    // }
    // this.fatguys.excluirConducao(this.conduzidoSelecionado).then(
    //   (r)=>{
    //     this.msg.mostrarMsg("Exclusão realizada!");
    //   },
    //   e=>{
    //     this.msg.mostrarErro("Erro excluindo: "+e.message);  
    //   }
    // ).catch(error=>{
    //   this.msg.mostrarErro("Erro excluindo: "+error);
    // });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroConducoesPage');
  }

}
