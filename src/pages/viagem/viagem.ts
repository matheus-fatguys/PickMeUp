import { Conduzido } from './../../models/conduzido';
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
  private marcaCondutor: google.maps.Marker;
  private marcasConduzidos: google.maps.Marker[]=[] as google.maps.Marker[];
  private marcasLocaisTrajeto: google.maps.Marker[]=[] as google.maps.Marker[];
  private marcas: google.maps.Marker[];
  private mapa: google.maps.Map;
  private trajeto: Trajeto;  
  private polylinePath :google.maps.Polyline;
  
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
                                      this.mostrarMarcacoes(trajeto);
                                      this.mostrarCaminhoDoTrajeto(trajeto);
                                      this.centralizarMapa(this.marcas);
                                      this.adcionarEventListener();
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

  mostrarMarcacoes(trajeto:Trajeto){
    this.marcarLocalizacaoCondutor();
    this.marcarLocaisTrajeto(trajeto);
    let marcas=[] as google.maps.Marker[];
    this.marcas=this.marcasConduzidos.concat(this.marcasLocaisTrajeto);
    this.marcas.push(this.marcaCondutor);    
  }

  iniciarMapa(trajeto:Trajeto):Promise<any>{
    var promessa : Promise<any>= new Promise(
      (resolve, reject)=>{
        try{
          let mapOptions = {
            center: this.localizacao,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            draggable:true
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

  adcionarEventListener(){
    google.maps.event.addListener(this.mapa, 'dragstart', () => {

    })
    google.maps.event.addListener(this.mapa, 'idle', () => {

    })
  }

  mostrarCaminhoDoTrajeto(trajeto:Trajeto){
    var path = [];
    path.push(this.localizacao);
    trajeto.pernas.forEach(
      perna=>{
        perna.caminho.forEach(
          p=>{
            path.push(p);
          });
      }
    );
    this.polylinePath = new google.maps.Polyline({
      path: path,
      strokeColor: '#FF0000',
      strokeWeight: 3
    });
    this.polylinePath.setMap(this.mapa);
  }
  
  marcarLocaisTrajeto(trajeto:Trajeto){
    trajeto.pernas.forEach(
      perna=>{
        var conteudo="";
        var qtdO=0;
        var qtdD=0;
        this.roteiro.conducoes.forEach(
          conducao=>{
            if(conducao.origem.endereco==perna.local.endereco){
              if(conteudo.length>0){
                conteudo+='<h7 style="color:blue;">,'+conducao.conduzidoVO.nome+'</h7>';
              }
              else{
                conteudo='<h7 style="color:blue;">'+conducao.conduzidoVO.nome+'</h7>';
              }
              qtdO++;
            }
            if(conducao.destino.endereco==perna.local.endereco){
              if(conteudo.length>0){
                conteudo+='<h7 style="color:green;">,'+conducao.conduzidoVO.nome+'</h7>';
              }
              else{
                conteudo='<h7 style="color:green;">'+conducao.conduzidoVO.nome+'</h7>';
              }
              qtdD++;
            }
          }
        );
        if(qtdO>0){
          conteudo=conteudo+'<img src="img/origem-icon.png"></img>';
        }
        if(qtdD>0){
          conteudo='<img src="img/destino-icon.png"></img>'+conteudo;
        }
        this.marcarLocal(perna,conteudo,(qtdD+qtdO>1));
      });
  }

  marcarLocal(perna:Perna, conteudo:string, grupo:boolean){
    var icone='img/person-icon-blue.png';
    if(grupo){
      icone='img/person-group.png';
    }
    let localizacao = new google.maps.LatLng(perna.local.latitude, perna.local.longitude);
    let marcaLocal = new google.maps.Marker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: localizacao,
      icon: icone
    });
    
    var popup = new google.maps.InfoWindow({
      content: conteudo
    });    
    popup.open(this.mapa, marcaLocal);
    google.maps.event.addListener(marcaLocal, 'click', () => {
      popup.open(this.mapa, marcaLocal);
    });

    this.marcasLocaisTrajeto.push(marcaLocal);
    setTimeout( () => {
		if (marcaLocal){
			marcaLocal.setAnimation(null);
		}	  
    }, 2000);
  }

  marcarLocalizacaoCondutor() {
    this.marcaCondutor = new google.maps.Marker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: this.localizacao,
      icon: 'img/bus-icon.png'
    })

    var popup = new google.maps.InfoWindow({
      content: '<h7  style="color:red;">Você</h7>'
    });    
    popup.open(this.mapa, this.marcaCondutor);

    google.maps.event.addListener(this.marcaCondutor, 'click', () => {
      popup.open(this.mapa, this.marcaCondutor);
    });

    setTimeout( () => {
		if (this.marcaCondutor){
			this.marcaCondutor.setAnimation(null);
		}	  
    }, 750);

  }

  centralizarMapa(marcas:google.maps.Marker[]){
    var bounds = new google.maps.LatLngBounds();
    marcas.forEach(
      m=>{
        bounds.extend(m.getPosition());
      }
    )
    this.mapa.fitBounds(bounds);
    //this.mapa.panToBounds(bounds);
    let mapOptions = {
            // center: this.localizacao,
            // zoom: 15,
            // mapTypeId: google.maps.MapTypeId.ROADMAP,
            // disableDefaultUI: true,
            draggable:true
          } 
    this.mapa.setOptions(mapOptions);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViagemPage');
  }

}
