import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conducao } from './../../models/conducao';
import { Conduzido } from './../../models/conduzido';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'detalhe-conducao',
  templateUrl: 'detalhe-conducao.html'
})
export class DetalheConducaoComponent {

  @Input() conducao= {} as Conducao;  
  // @Input() conduzido;//= {} as Conduzido;

  private rotuloOrigem="Origem:";
  private rotuloDestino="Destino:";

  conduzidos;


  constructor(public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {      
  }

  ngOnInit(): void {
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    if(ref!=null){
      let sub = ref.subscribe(
        conds=>{
          this.conduzidos=this.fatguys.obterConduzidos(conds[0]);
        }
      );
    }    
  }

  conduzidoSelecionado(idConduzido){
    this.conducao.conduzido=idConduzido;
  }

  onEnderecoOrigemSelecionado($event){
    this.conducao.origem=$event;
  }

  onEnderecoDestinoSelecionado($event){
    this.conducao.destino=$event;
  }
}
