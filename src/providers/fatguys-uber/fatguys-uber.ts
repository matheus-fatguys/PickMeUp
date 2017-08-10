import { Observable } from 'rxjs';
import { Conducao } from './../../models/conducao';
import { Roteiro } from './../../models/roteiro';
import { Usuario } from './../../models/usuario';
import { Chave } from './../../models/chave';
import { AutenticacaoProvider } from './../autenticacao/autenticacao';
import { Conduzido } from './../../models/conduzido';
import { Condutor } from './../../models/condutor';
import { Injectable } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";



@Injectable()
export class FatguysUberProvider {

  public condutor: Condutor;
  public condutores: FirebaseListObservable<Condutor[]>;
  public conduzidos: FirebaseListObservable<Conduzido[]>;
  public chaves: FirebaseListObservable<Chave[]>;

  constructor(private afd: AngularFireDatabase,
  private auth : AutenticacaoProvider) {
    this.condutores=this.afd.list("condutores");
    this.conduzidos=this.afd.list("conduzidos");    
    this.chaves=this.afd.list("chaves");
  }

  

  obterConducoes (condutor: Condutor){    
    let ref = this.afd.list("/condutores/"+condutor.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    }); 
    return ref;  
  }
  
  obterConducoesComConduzidos (condutor: Condutor){    
    
    // Compose an observable based on the conducoes
    let conducoesComConduzido = this.afd.list("/condutores/"+condutor.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    })
    /// Each time the conducoes emits, switch to unsubscribe/ignore
    // any pending conduzido queries:
    .switchMap(conducoes => {

    // Map the conducoes to the array of observables that are to be
    // combined.
    let conduzidoObservables = conducoes.map(conducao => this.afd.object("/conduzidos/"+conducao.conduzido+"/"));
    
    // Combine the user observables, and match up the users with the
    // projects, etc.

    return conduzidoObservables.length === 0 ?
      Observable.of(conducoes) :
      Observable.combineLatest(...conduzidoObservables, (...conduzidos) => {
        conducoes.forEach((conducao, index) => {
          conducao.conduzidoVO = conduzidos[index];
        });
        return conducoes;          
      });
  });  



    return conducoesComConduzido;  
  }

  obterConducoesDoRoteiroComConduzidos(roteiro: Roteiro){
      // Compose an observable based on the conducoes
    let conducoesComConduzido = this.afd.list("/condutores/"+roteiro.condutor+"/roteiros/"+roteiro.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: roteiro.condutor
      }
    })
    /// Each time the conducoes emits, switch to unsubscribe/ignore
    // any pending conduzido queries:
    .switchMap(conducoes => {

    // Map the conducoes to the array of observables that are to be
    // combined.
    let conduzidoObservables = conducoes.map(conducao => this.afd.object("/conduzidos/"+conducao.conduzido+"/"));
    
    // Combine the user observables, and match up the users with the
    // projects, etc.

    return conduzidoObservables.length === 0 ?
      Observable.of(conducoes) :
      Observable.combineLatest(...conduzidoObservables, (...conduzidos) => {
        conducoes.forEach((conducao, index) => {
          conducao.conduzidoVO = conduzidos[index];
        });
        return conducoes;          
      });
  });  



    return conducoesComConduzido;  
  }

  salvarConducao (conducao: Conducao){
    conducao.condutor=this.condutor.id;

    if(!conducao.id){
      let ref = this.afd.list("condutores/"+conducao.condutor+"/conducoes").push(conducao).then(
        ref => {
          conducao.id=ref.key;
          return this.afd.list("condutores/"+conducao.condutor+"/conducoes").update(conducao.id,conducao);
        }
      ) 
      return ref;
    }
    else{
      return this.afd.list("condutores/"+conducao.condutor+"/conducoes").update(conducao.id, conducao);
    }    
  }

  excluirConducao (conducao: Conducao){
    let ret =this.afd.list("condutores/"+conducao.condutor+"/conducoes").remove(conducao.id);      
    return ret;
  }


  obterConduzidos (condutor: Condutor){    
    return this.afd.list(`/conduzidos/`, {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    });    
  }

  salvarConduzido (conduzido: Conduzido){
    conduzido.condutor=this.condutor.id;    
    if(!conduzido.id){
      let chaveGerada=this.gerarChave();
      let chave={} as Chave;
      chave.chave=chaveGerada;            
      let ref = this.chaves.push(chave).then(r=>{
        conduzido.chave=r.key;      
        this.conduzidos.push(conduzido).then(
          ref => {
            conduzido.id=ref.key;
            this.conduzidos.update(conduzido.id, conduzido);
            chave.conduzido=conduzido.id;
            this.chaves.update(r.key, chave);
          }
        );
      });      
      return ref;
    }
    else{
      return this.conduzidos.update(conduzido.id, conduzido);
    }    
  }

  private gerarChave():string{
    const tamChave=4;
    var chave:string="";
    for(var i=0;i<tamChave;i++){
      chave+=Math.round(Math.random()*9);  
    }
    return chave;
  }

  excluirConduzido (conduzido){
    let ret =this.conduzidos.remove(conduzido.id);
    let sub = this.obterChaveDoConduzido(conduzido).subscribe(
      chaves=>{
        this.removerChaveDoConduzido(chaves[0].$key)
        .then(()=>{
          // this.conduzidos.remove(conduzido.id);
        });
        sub.unsubscribe();
      });    
    return ret;
  }

 salvarRoteiro (roteiro: Roteiro){
       
    if(!roteiro.id){
      return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").push(roteiro).then(
        ref => {
          roteiro.id=ref.key;
          return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id,roteiro);
        }
      ) 
    }
    else{
      return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id, roteiro);
    }    
  }

  excluirRoteiro (roteiro: Roteiro){
    
    return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").remove(roteiro.id);
    
  }

  obterRoteiros(condutor: Condutor){
    return this.afd.list(`/condutores/`+condutor.id+"/roteiros");
  }

  removerChaveDoConduzido(id){
    return this.chaves.remove(id);
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

 
  registrarCondutor (condutor: Condutor, usuario: Usuario){
    return this.auth.registrarUsuario(usuario)
    .then((ref) => {
        condutor.usuario=ref.uid;
        return this.condutores.push(condutor).then(
          ref => {
            condutor.id=ref.key;
            return this.condutores.update(ref, condutor);
          }
        );
    });  
  }

  obterChaveDoConduzido(conduzido: Conduzido){//:FirebaseListObservable<Chave[]>{
    return this.afd.list(`/chaves/`, {
      query: {
        orderByChild: "conduzido",
        equalTo: conduzido.id
      }
    });    
  }
  
  // obterChaveDoConduzido(conduzido: Conduzido){//:FirebaseListObservable<Chave[]>{
  //   return this.afd.list("chaves/"+conduzido.chave);
  // }

  obterCondutorPeloUsuarioLogado(){

    let user = this.auth.usuarioLogado();

    if(user==null){
      return null;
    }
    
    let obs = this.afd.list("condutores", {
      query: {
        orderByChild: "usuario",
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
