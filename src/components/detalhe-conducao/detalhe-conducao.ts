import { Local } from './../../models/local';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conducao } from './../../models/conducao';
import { Conduzido } from './../../models/conduzido';
import { Component, Input, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'detalhe-conducao',
  templateUrl: 'detalhe-conducao.html'
})
export class DetalheConducaoComponent {

  @Input() conducao= {} as Conducao;  
  @Output()
  onChangeConducaoValida = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;
  private cnduzidosSub;

  private rotuloOrigem="Origem:";
  private rotuloDestino="Destino:";

  conduzidos;


  constructor(public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public formBuilder: FormBuilder) {    
      
      this.form = formBuilder.group({
                    conduzido: ['', Validators.compose([Validators.required])],
                });
      this.subscription = this.form.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(
        s=>{
          this.validar()
        }
      );
      
  }

  ngOnInit(): void {
    let ref=(this.fatguys.obterCondutorPeloUsuarioLogado() as any).take(1);
    if(ref!=null){
      this.cnduzidosSub = ref.subscribe(
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
    if($event.rotulo!=this.rotuloOrigem){
      return;
    }
    this.conducao.origem=this.clonarLocal($event.local);
    this.validar();
  }

  clonarLocal(local:Local):Local{
    let clone:Local={} as Local;
    clone.endereco=local.endereco;
    clone.latitude=local.latitude;
    clone.longitude=local.longitude;
    return clone;
  }

  onEnderecoDestinoSelecionado($event){
    if($event.rotulo!=this.rotuloDestino){
      return;
    }
    this.conducao.destino=this.clonarLocal($event.local);
    this.validar();
  }

  isValida(){
    return this.form.valid
            &&this.conducao.origem!=null
            &&this.conducao.destino!=null
            &&this.conducao.origem!=this.conducao.destino;
  }

  validar(){
    this.onChangeConducaoValida.next(this.form.valid
            &&this.conducao.origem!=null
            &&this.conducao.destino!=null
          );
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
    if(this.cnduzidosSub!=null){
      this.cnduzidosSub.unsubscribe();
    }
  }

}
