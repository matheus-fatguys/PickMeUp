import { Conducao } from './../../models/conducao';
import { Roteiro } from './../../models/roteiro';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-cadastro-roteiros',
  templateUrl: 'cadastro-roteiros.html',
})
export class CadastroRoteirosPage  implements OnInit {

  private roteiros;
  private roteiroSelecionado:Roteiro;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
  }

  ngOnInit(): void {
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    
    if(ref!=null){
      let sub=ref.subscribe(
          r=>{
            this.roteiros=this.fatguys.obterRoteiros(r[0]);
            sub.unsubscribe();
          }
        )
    }
        
  }

  toggleAtivar(roteiro: Roteiro){
    this.fatguys.salvarRoteiro(roteiro).then(
      r=>{
        
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      });
  }

  onSelect(roteiro){
    this.roteiroSelecionado=roteiro;
  }  

  detalhe(){
    if(this.roteiroSelecionado.conducoes==null){
      this.roteiroSelecionado.conducoes=[] as Conducao[];
    }
    let sub = this.fatguys.obterConducoesDoRoteiroComConduzidos(this.roteiroSelecionado).subscribe(
      conducoes=>{
        this.roteiroSelecionado.conducoes=conducoes;
        this.navCtrl.push('RoteiroPage',{roteiro:this.roteiroSelecionado});    
        sub.unsubscribe();
      }
    );
  }

  novo(){
    this.navCtrl.push('RoteiroPage',{roteiro:{conducoes: [] as Conducao[],
       domingo:false,
       segunda:true,
       terca:true,
       quarta:true,
       quinta:true,
       sexta:true,
       sabado:false,
      } as Roteiro});
  }

  iniciar(){
    this.navCtrl.setRoot('ViagemPage',{roteiro:this.roteiroSelecionado});
  }

  excluir(roteiro){
    if(roteiro!=null){
      this.roteiroSelecionado=roteiro;
    }
    this.fatguys.excluirRoteiro(this.roteiroSelecionado).then(
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
    console.log('ionViewDidLoad CadastroRoteirosPage');
  }

}
