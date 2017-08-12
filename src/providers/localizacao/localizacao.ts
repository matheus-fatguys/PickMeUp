import { Platform } from 'ionic-angular';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MensagemProvider } from './../mensagem/mensagem';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class LocalizacaoProvider {

  private localizacao: google.maps.LatLng;
  private localizacaoOserver;
  public posicionamento;

  constructor(public msg: MensagemProvider,
              public platform: Platform,
              public geolocation: Geolocation,
              public zone: NgZone,
              public backgroundGeolocation: BackgroundGeolocation) {
  }

  iniciarRastreamentoBackGround() {
    // Background Tracking 
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10, 
      debug: true,
      interval: 2000 
    };
  
    this.backgroundGeolocation.configure(config).subscribe((location) => {  
      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);  
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.posicionamento.localizacao =new google.maps.LatLng( location.latitude, location.longitude);
      });  
    }, (err) => {  
      console.log(err);  
    });
  
    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
  
  
    // Foreground Tracking
  
  let options = {
    frequency: 3000, 
    enableHighAccuracy: true
  };
  
  this.localizacaoOserver = this.geolocation
  .watchPosition(options)
  .filter((p: any) => p.code === undefined)
  .subscribe((position: Geoposition) => {
  
    console.log(position);
  
    // Run update inside of Angular's zone
    this.zone.run(() => {
      this.posicionamento.localizacao =new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    });  
  });
  }
 
  pararRastreamentoBackGround() {
    console.log('stopTracking'); 
    this.backgroundGeolocation.finish();
    this.localizacaoOserver.unsubscribe(); 
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
                  this.iniciarRastreamentoBackGround();
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
