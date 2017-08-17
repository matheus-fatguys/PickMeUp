import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../fatguys-uber/fatguys-uber';
import { Platform } from 'ionic-angular';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MensagemProvider } from './../mensagem/mensagem';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable()
export class LocalizacaoProvider {

  // private localizacao: google.maps.LatLng;
  private localizacaoObserver;
  // private condutor:Condutor;
  public localizacaoCondutorSubscription:Subscription;

  constructor(public msg: MensagemProvider,
              public platform: Platform,
              public geolocation: Geolocation,
              public zone: NgZone,
              public backgroundGeolocation: BackgroundGeolocation,
              public fatguys: FatguysUberProvider,
            ) {
  }
  
  iniciarGeolocalizacao():Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    obs=Observable.create(
      observable=>{
          this.platform.ready().then(
          a=>{            
            // this.condutor=this.fatguys.condutor;
            this.geolocation.getCurrentPosition()
            .then(resp=>{          
                  var localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                  this.atualizarLocalizacaoCondutor(resp.coords.latitude, resp.coords.longitude);                   
                  if(!this.platform.is('core')&&!this.platform.is('mobileweb')){
                    this.iniciarRastreamentoBackGround();
                  }
                  let ref =this.fatguys.atualizarLocalizacaoCondutor(this.fatguys.condutor)
                  .then(
                    r=>{                      
                      //observable.next(this.condutor.localizacaoSimulada);
                      observable.next(localizacao);              
                    },
                  ).catch(
                    error=>{
                      observable.error(error);
                    });    
                }).catch(error=>{
                    observable.error(error);
                });
          }).catch(error=>{            
              observable.error(error);                
          });
      }
    );    
    return obs;
  }

  atualizarLocalizacaoCondutor(lat, lng){
    if(this.fatguys.condutor!=null){
      if(this.fatguys.condutor.localizacao==null){
        this.fatguys.condutor.localizacao={latitude:lat, longitude:lng};
      }
      else{
        this.fatguys.condutor.localizacao.latitude=lat;
        this.fatguys.condutor.localizacao.longitude=lng;                  
      }
      this.fatguys.atualizarLocalizacaoCondutor(this.fatguys.condutor).then(
        p=>{
          this.msg.mostrarMsg("Localização do condutor salva", 3000);
          console.log("Localização do condutor salva");
        }
      )
      .catch(
        error=>{
          this.msg.mostrarErro("Erro atualizando localização de condutor", 3000);
          console.error(error);
        }
      );
    }
  }

  iniciarRastreamentoBackGround() {
    this.msg.mostrarMsg("Inciar rastreamento background", 3000);
    console.log("RASTREAMENTO BACKGROUND CHAMADO");
    // Background Tracking 
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10, 
      debug: true,
      interval: 2000 
    };
  
    this.backgroundGeolocation.configure(config).subscribe((location) => {  
      console.log("RASTREAMENTO BACKGROUND OBTEVE LOCALIZAÇÃO");
      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);  
      // Run update inside of Angular's zone
      this.zone.run(() => {
        console.log("LOCALIZAÇÃO OBTIDA");
        this.msg.mostrarMsg("Localização obtida em background", 3000);
        // this.fatguys.condutor.localizacao =new google.maps.LatLng( location.latitude, location.longitude);
        this.atualizarLocalizacaoCondutor(location.latitude, location.longitude);            
      });  
    }, (err) => {  
      console.log("RASTREAMENTO BACKGROUND ERRO");
      console.log(err);  
    });
  
    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
    console.log("RASTREAMENTO BACKGROUND INICIADO");
  
    // Foreground Tracking
  
  let options = {
    frequency: 3000, 
    enableHighAccuracy: true
  };
  
  this.localizacaoObserver = this.geolocation
  .watchPosition(options)
  .filter((p: any) => p.code === undefined)
  .subscribe((position: Geoposition) => {
  
    console.log(position);
  
    // Run update inside of Angular's zone
    this.zone.run(() => {
      console.log("RASTREAMENTO BACKGROUND LOCALIZAÇÃO OBTIDA");
      this.msg.mostrarMsg("Localização obtida em watch de background", 3000);
      // this.localizacao =new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.atualizarLocalizacaoCondutor(position.coords.latitude, position.coords.longitude);                   
    });  
  });
  }
 
  pararRastreamentoBackGround() {
    console.log('stopTracking'); 
    this.msg.mostrarMsg("Parar rastreamento background", 3000);
    this.backgroundGeolocation.finish();
    this.localizacaoObserver.unsubscribe(); 
    console.log("RASTREAMENTO BACKGROUND PARADO");
  }

  iniciarRastreamento(){
    this.msg.mostrarMsg("Inciar rastreamento", 3000);
    if(!this.platform.is('core')&&!this.platform.is('mobileweb')){
      this.iniciarRastreamentoBackGround();
    }
  }
  pararRastreamento(){
    this.msg.mostrarMsg("Parar rastreamento", 3000);
    if(!this.platform.is('core')&&!this.platform.is('mobileweb')){
      this.pararRastreamentoBackGround();
    }
  }
}
