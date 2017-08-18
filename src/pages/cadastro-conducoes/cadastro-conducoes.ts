import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

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
    public viewCtrl: ViewController,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      this.obterConducoes();
  }

  obterConducoes(){   
      this.conducoes=this.fatguys.obterConducoesComConduzidos(this.fatguys.condutor);   
  }

  ngOnInit(): void {
  }

  toggleAtivar(conducao: Conducao){
    
  }

  onSelect(conducao){
    this.conducaoSelecionada=conducao;
  }  

  detalhe(){
    this.navCtrl.push('ConducaoPage',{conducao:this.conducaoSelecionada});
  }

  novo(){
    this.navCtrl.push('ConducaoPage',{} as Conducao);
  }

  excluir(conducao){
    if(conducao!=null){
      this.conducaoSelecionada=conducao;
    }

    let sub =this.fatguys.obterRoteirosAssociadosAConducao(this.conducaoSelecionada)
    .on("child_added",
      r=>{
        var ci=r.key;
        var c=r.val();
        console.log(ci);
        console.log(c);
      }
    );
    // .subscribe(
    //   r=>{
    //     if(r.length>0){
    //         this.msg.mostrarErro("Não é possível excluir, existe(m) roteiro(s) associado(s) a essa condução");
    //     }
    //     else{
    //         this.fatguys.excluirConducao(this.conducaoSelecionada).then(
    //           (r)=>{
    //             this.msg.mostrarMsg("Exclusão realizada!", 3000);
    //           },
    //           e=>{
    //             this.msg.mostrarErro("Erro excluindo: "+e.message);  
    //           }
    //         ).catch(error=>{
    //           this.msg.mostrarErro("Erro excluindo: "+error);
    //         });
    //     }
    //   }
    // )

  }

  dismiss() {
   let data = { conducao: this.conducaoSelecionada };
   this.viewCtrl.dismiss(data);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroConducoesPage');
  }

}
