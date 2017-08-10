import { Roteiro } from './../../models/roteiro';
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


  private roteiro:Roteiro;
  private conducoes:Conducao[]=new Array();
  private conducaoSelecionada:Conducao;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      console.log("construtor ConducoesNaoAssociadasModalPage");
      let roteiro=this.navParams.get('roteiro') as Roteiro;
      if(roteiro){
        this.roteiro=roteiro;      
      }
      this.obterConducoes();
  }

  obterConducoes(){
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    if(ref!=null){
      let sub = ref.subscribe(
        conds=>{
          // this.conducoes=this.fatguys.obterConducoes(conds[0]);
          let sub2 = this.fatguys.obterConducoesComConduzidos(conds[0]).subscribe(
              conducoes=>{
                var cs=[];
                conducoes.forEach(c => {
                  var ci = this.roteiro.conducoes.findIndex(cr=>{
                    return cr.id==c.id;
                  });
                  if(ci<0){
                    cs.push(c);
                    this.conducoes.push(c);
                  }
                });
                if(this.conducoes.length<1){
                  this.msg.mostrarMsg("Todas as conduções já estão associadas ao roteiro")
                  .onDidDismiss(
                    r=>{
                      this.cancelar();
                    }
                  );
                }
                sub2.unsubscribe();
              }
          );  
            sub.unsubscribe();        
        }
      );
    }    
  }

  ngOnInit(): void {
  }

  
  onSelect(conducao){
    this.conducaoSelecionada=conducao;
  }  

  cancelar(){
    this.viewCtrl.dismiss();
  }
  
  ok(){
    this.viewCtrl.dismiss({conducao: this.conducaoSelecionada});
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ConducoesNaoAssociadasModalPage');
  }

}
