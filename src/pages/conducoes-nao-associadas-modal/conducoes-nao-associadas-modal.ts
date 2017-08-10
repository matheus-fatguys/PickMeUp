import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conducao } from './../../models/conducao';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-conducoes-nao-associadas-modal',
  templateUrl: 'conducoes-nao-associadas-modal.html',
})
export class ConducoesNaoAssociadasModalPage{


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
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    if(ref!=null){
      let sub = ref.subscribe(
        conds=>{
          // this.conducoes=this.fatguys.obterConducoes(conds[0]);
          this.conducoes=this.fatguys.obterConducoesComConduzidos(conds[0]);
        }
      );
    }    
  }

  ngOnInit(): void {
  }

  
  onSelect(conducao){
    this.conducaoSelecionada=conducao;
    //this.detalhe();
  }  

  ok(){
    this.viewCtrl.dismiss({conducao: this.conducaoSelecionada});
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ConducoesNaoAssociadasModalPage');
  }

}
