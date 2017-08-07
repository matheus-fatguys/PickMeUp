import { AutenticacaoProvider } from './../autenticacao/autenticacao';
import { Conduzido } from './../../models/conduzido';
import { Condutor } from './../../models/condutor';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";



@Injectable()
export class FatguysUberProvider {

  public condutor: Condutor;
  public condutores: FirebaseListObservable<Condutor[]>;
  public conduzidos: FirebaseListObservable<Conduzido[]>;

  constructor(private afd: AngularFireDatabase,
  private auth : AutenticacaoProvider) {
    this.condutores=this.afd.list("condutores");
    this.conduzidos=this.afd.list("conduzidos");
  }

  

  obterConduzidos (){    
    return this.conduzidos;
  }

  salvarConduzido (conduzido: Conduzido){
    conduzido.condutor=this.condutor.id;    
    if(!conduzido.id){
      conduzido.chave=this.gerarChave();
      return this.conduzidos.push(conduzido).then(
        ref => {
          conduzido.id=ref.key;
          return this.conduzidos.update(conduzido.id, conduzido);
        }
      )      
    }
    else{
      return this.conduzidos.update(conduzido.id, conduzido);
    }    
  }

  private gerarChave():number{
    var chave:number;

    chave=Math.round(Math.random()*10000);

    return chave;
  }

  excluirConduzido (id){    
    return this.conduzidos.remove(id);
  }

  obterCondutores (){
    return this.condutores;
  }

  salvarCondutor (condutor: Condutor){
    if(!condutor.id){
      return this.condutores.push(condutor).then(
        ref => {
          condutor.id=ref.key;
          return this.condutores.update(condutor.id,condutor);
        }
      )      
    }
    else{
      return this.condutores.update(condutor.id, condutor);
    }    
  }

 
  registrarCondutor (condutor: Condutor){
    return this.auth.registrarUsuario(condutor.usuario)
    .then((ref) => {
        condutor.usuario.uid=ref.uid;
        return this.condutores.push(condutor).then(
          ref => {
            condutor.id=ref.key;
            return this.condutores.update(ref, condutor);
          }
        );
    });  
  }
  
  obterCondutorPeloUsuarioLogado(){

    let user = this.auth.usuarioLogado();

    if(user==null){
      return null;
    }
    
    let obs = this.afd.list("condutores", {
      query: {
        orderByChild: "usuario/uid",
        equalTo: user.uid
      }
    })
    obs.subscribe(condutor=>{
            this.condutor=condutor[0];
    });  
    return obs;
  }

  excluirCondutor (id){
    return this.condutores.remove(id);
  } 

}
