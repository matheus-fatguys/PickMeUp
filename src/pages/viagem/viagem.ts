import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { TrajetoProvider } from './../../providers/trajeto/trajeto';
import { Perna } from './../../models/perna';
import { Trajeto } from './../../models/trajeto';
import { Observable } from 'rxjs';
import { Local } from './../../models/local';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Roteiro } from './../../models/roteiro';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';



@IonicPage()
@Component({
  selector: 'page-viagem',
  templateUrl: 'viagem.html',
})
export class ViagemPage {
  private tituloInicio:string="Viagem";
  private tituloEmViagem:string="Viagem";
  private viagemIniciada:boolean=false;
  private roteiro={} as Roteiro;  
  private localizacao: google.maps.LatLng;
  private marcaLocalizacao: google.maps.Marker;
  private mapa: google.maps.Map;
  private trajeto: Trajeto;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public platform: Platform,
    public localizacaoService: LocalizacaoProvider,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public trajetoService: TrajetoProvider,
    public loadingCtrl: LoadingController) {    
     let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
      }

    
     if(roteiro!=null){
       if(this.roteiro.conducoes!=null&&this.roteiro.conducoes.length>0){
         try{          
          this.navCtrl.setRoot('ViagemPage');
          let loading = this.loadingCtrl.create({
            content: 'Obtendo localização atual...'
          });           
          loading.present(loading);        
          this.localizacaoService.iniciarGeolocalizcao().subscribe(
            localizacao=>{
              this.localizacao=localizacao;
              loading.setContent('Calculanto trajeto da viagem...');
              this.trajetoService.calcularTrajeto(this.localizacao, this.roteiro).subscribe(
                    trajeto=>{
                          
                          this.trajetoService.mostrarTrajetoDoRoteiro(trajeto).then(
                            ret=>{
                              if(ret){    
                                this.trajeto=trajeto;                    
                                loading.setContent('Iniciando mapa...');
                                this.iniciarMapa(trajeto).then(
                                  mapa=>{
                                    loading.dismiss();
                                    if(mapa){
                                      this.mapa=mapa;
                                      this.viagemIniciada=true;
                                      this.msg.mostrarMsg("Boa viagem, dirija com atenção!");
                                      this.mostrarMarcacoes();
                                    }
                                  }
                                );
                              }
                              else{
                                if(this.navCtrl.canGoBack()){
                                  this.navCtrl.pop();
                                }
                              }
                            }).catch(
                              error=>{                                
                                loading.dismiss();
                                this.msg.mostrarErro('Erro obtendo localização: ' + error);
                                if(this.navCtrl.canGoBack()){
                                  this.navCtrl.pop();
                                }
                              }  
                            );
                    },
                    error=>{
                      loading.dismiss();
                      this.msg.mostrarErro('Erro obtendo localização: ' + error);
                      if(this.navCtrl.canGoBack()){
                        this.navCtrl.pop();
                      }
                    }
                  );
            },
            error=>{
              this.msg.mostrarErro(error);
              if(this.navCtrl.canGoBack()){
                this.navCtrl.pop();
              }
            }
          );
         }
         catch(error){
          this.msg.mostrarErro(error);
          if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
         }
       }
     }
  }

  mostrarMarcacoes(){
    this.marcarLocalizacaoCondutor();
    this.marcarLocaisTrajeto();
  }

  iniciarMapa(trajeto:Trajeto):Promise<any>{
    var promessa : Promise<any>= new Promise(
      (resolve, reject)=>{
        try{
          let mapOptions = {
            center: this.localizacao,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true
          }          
          let divMapa = document.getElementById('mapa');
          let mapa = new google.maps.Map(divMapa, mapOptions);          
          resolve(mapa);
        }
        catch(error){
          reject(error);
        }
      }
    );
    return promessa;
  }
  
  marcarLocaisTrajeto(){
    this.trajeto.pernas.forEach(
      perna=>{
        this.marcarLocal(perna);
      });
  }

  marcarLocal(perna:Perna){
    let localizacao = new google.maps.LatLng(perna.local.latitude, perna.local.longitude);
    let marcaLocal = new google.maps.Marker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: localizacao,
      // position: this.mapa.getCenter(),
      icon: 'img/person-icon.png'
    });
    setTimeout( () => {
		if (marcaLocal){
			marcaLocal.setAnimation(null);
		}	  
    }, 2000);
  }

  marcarLocalizacaoCondutor() {
    this.marcaLocalizacao = new google.maps.Marker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: this.localizacao,
      // position: this.mapa.getCenter(),
      icon: 'img/car-icon.png'
    })

    setTimeout( () => {
		if (this.marcaLocalizacao){
			this.marcaLocalizacao.setAnimation(null);
		}	  
    }, 750);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViagemPage');
  }

}
