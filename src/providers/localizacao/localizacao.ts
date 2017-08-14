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

  private localizacao: google.maps.LatLng;
  private localizacaoObserver;
  private condutor:Condutor;
  public localizacaoCondutorSubscription:Subscription;

  constructor(public msg: MensagemProvider,
              public platform: Platform,
              public geolocation: Geolocation,
              public zone: NgZone,
              public backgroundGeolocation: BackgroundGeolocation,
              public fatguys: FatguysUberProvider,
            ) {
                this.zone.run(() => {
                  this.localizacao =new google.maps.LatLng( 0, 0);
                });
  }


  watchLocalizacaoSimulada(periodo:number):Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    let thisObj=this;
    obs=Observable.create(
      observable=>{
        let tm=0;
        let f=function(){            
            let localizacao = new google.maps.LatLng(thisObj.fatguys.condutor.localizacaoSimulada.latitude, 
              thisObj.fatguys.condutor.localizacaoSimulada.longitude);
            observable.next(localizacao);                    
            tm=setTimeout(f,periodo);
          };
        tm=setTimeout(f,periodo);        
      });    
    return obs;
  }

  
  watchLocalizacao(periodo:number):Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    let thisObj=this;
    obs=Observable.create(
      observable=>{
        let tm=0;
        let f=function(){
            thisObj.geolocation.getCurrentPosition()
                .then(
                  resp=>{
                    let localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                    observable.next(localizacao);                    
                    tm=setTimeout(f,periodo);
                  }
                )
                .catch(
                  error=>{
                    clearTimeout(tm);
                    observable.error(error);
                  }
                );
          };
        tm=setTimeout(f,periodo);        
      });
    
    
    return obs;
  }

  iniciarMonitoracaoDeLocalizacaoSimulada(){
    let obs=this.watchLocalizacao(2000);
    obs.subscribe(
      l=>{
        this.localizacao=l;
        if(this.condutor!=null){
          if(this.condutor.localizacao==null){
            this.condutor.localizacao={latitude:l.lat(), longitude:l.lng()};
          }
          else{
            this.condutor.localizacao.latitude=l.lat();
            this.condutor.localizacao.longitude=l.lng();                  
          }
        }
        this.fatguys.atualizarLocalizacaoCondutor(this.condutor);
      }
    );
    return obs;
  }
  iniciarMonitoracaoDeLocalizacao(){
    let obs=this.watchLocalizacao(2000);
    obs.subscribe(
      l=>{
        this.localizacao=l;
        if(this.condutor!=null){
          if(this.condutor.localizacao==null){
            this.condutor.localizacao={latitude:l.lat(), longitude:l.lng()};
          }
          else{
            this.condutor.localizacao.latitude=l.lat();
            this.condutor.localizacao.longitude=l.lng();                  
          }
        }
        this.fatguys.atualizarLocalizacaoCondutor(this.condutor);
      }
    );
    return obs;
  }
  
  iniciarGeolocalizacao():Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    obs=Observable.create(
      observable=>{
          this.platform.ready().then(
          a=>{            
            this.condutor=this.fatguys.condutor;
            this.geolocation.getCurrentPosition()
            .then(resp=>{          
                  this.localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                  if(this.condutor!=null){
                    if(this.condutor.localizacao==null){
                      this.condutor.localizacao={latitude:this.localizacao.lat(), longitude:this.localizacao.lng()};
                    }
                    else{
                      this.condutor.localizacao.latitude=this.localizacao.lat();
                      this.condutor.localizacao.longitude=this.localizacao.lng();                  
                    }
                  }
                  if(!this.platform.is('core')&&!this.platform.is('mobileweb')){
                    this.iniciarRastreamentoBackGround();
                  }
                  let ref =this.fatguys.atualizarLocalizacaoCondutor(this.condutor)
                  .then(
                    r=>{                      
                      //observable.next(this.condutor.localizacaoSimulada);
                      observable.next(this.localizacao);              
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

  iniciarRastreamentoBackGround() {
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
        this.localizacao =new google.maps.LatLng( location.latitude, location.longitude);
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
      this.localizacao =new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    });  
  });
  }
 
  pararRastreamentoBackGround() {
    console.log('stopTracking'); 
    this.backgroundGeolocation.finish();
    this.localizacaoObserver.unsubscribe(); 
    console.log("RASTREAMENTO BACKGROUND PARADO");
  }
}
