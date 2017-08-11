import { Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { MensagemProvider } from './../mensagem/mensagem';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class LocalizacaoProvider {

  private localizacao: google.maps.LatLng;

  constructor(public msg: MensagemProvider,
              public platform: Platform,
              public geolocation: Geolocation) {
  }

  iniciarGeolocalizcao():Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    obs=Observable.create(
      observable=>{
          this.platform.ready().then(
          a=>{
            this.geolocation.getCurrentPosition()
            .then(resp=>{          
                  this.localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                  observable.next(this.localizacao);
                })
          }).catch(error=>{            
              observable.error(error);                
          });
      }
    );    
    return obs;
  }
}
