import { AngularFireAuth } from 'angularfire2/auth';
import { Usuario } from './../../models/usuario';
import { Condutor } from './../../models/condutor';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from "angularfire2/database";



@Injectable()
export class FatguysUberProvider {

  constructor(private afd: AngularFireDatabase, private afAuth: AngularFireAuth) {
    
  }

  obterCondutores (){
    return this.afd.list("condutor");
  }

  inserirCondutor (condutor: Condutor){
    return this.afd.list("condutor").push(condutor);
  }

  getCondutor (id){
    return this.afd.object(id);
  }

  excluirCondutor (id){
    return this.afd.list("condutor").remove(id);
  }

  registrarUsuario(usuario: Usuario){
      return this.afAuth.auth.createUserWithEmailAndPassword(usuario.email, usuario.senha);
  }

  logar(usuario: Usuario){
      return this.afAuth.auth.signInWithEmailAndPassword(usuario.email, usuario.senha);
  }

}
