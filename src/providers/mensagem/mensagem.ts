import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class MensagemProvider {

  constructor(public http: Http, 
    private toastCtrl: ToastController) {
    console.log('Hello MensagemProvider Provider');
  }

  mostrarMsg(msg){
    let toast = this.toastCtrl.create({
                  message: msg,
                  duration: 3000,
                  position: 'top'
                });          
    toast.present();  
    return toast; 
  }
  mostrarErro(error){
    console.error(error);
      let toast = this.toastCtrl.create({
                  message: error,
                  duration: 3000,
                  position: 'top'
                });
      toast.present();
  }

}
