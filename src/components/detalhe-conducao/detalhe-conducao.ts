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
  @Input() conduzido= {} as Conduzido;
  conduzidos;
  enderecoOrigem;
  geocoder;
  resultados;

  constructor(public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {   
    this.geocoder = new google.maps.Geocoder(); 
    this.resultados=[];
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

  conduzidoSelecionado(e){
    console.log(e);
  }

  onSubmitOrigem(){
    this.resultados = [];
    
    this.geocoder.geocode( {address: this.enderecoOrigem}, (destinations, status) => {
      
      if (status === google.maps.GeocoderStatus.OK) {
        this.resultados = destinations.slice(0,8); // show top 4 results
      }
      else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        alert("Destino desconhecido");
      }
    });
  }

  onOrigemSelecionada(r){
    console.log(r);
    this.resultados = [];
  }

}
