import { MapaCondutorComponent } from './../../components/mapa-condutor/mapa-condutor';
import { Conducao } from './../../models/conducao';
import * as SlidingMarker from 'marker-animate-unobtrusive';
import { Conduzido } from './../../models/conduzido';
import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { TrajetoProvider } from './../../providers/trajeto/trajeto';
import { Perna } from './../../models/perna';
import { Trajeto } from './../../models/trajeto';
import { Observable, Subscription } from 'rxjs';
import { Local } from './../../models/local';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Roteiro } from './../../models/roteiro';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';



@IonicPage()
@Component({
  selector: 'page-viagem',
  templateUrl: 'viagem.html',
})
export class ViagemPage implements OnDestroy  {
  
  private tituloInicio: string = "Viagem";
  private tituloEmViagem:string="Em Viagem...";
  private viagemIniciada:boolean;
  private origemProxima:boolean;
  private destinoProximo:boolean;
  private roteiro={} as Roteiro;  
  @ViewChild(MapaCondutorComponent)  
  private mapaCtrl: MapaCondutorComponent;
  
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController
    ) {    
     let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
      }      
  }  

  onViagemIniciada($event){
    this.viagemIniciada=true;
  }
  
  onOrigemProxima($event){
    this.origemProxima=true;
    this.confirmarConduzidoABordo($event);
  }

  onDestinoProximo($event){
    this.destinoProximo=true;
  }

  ngOnDestroy(): void {
    // this.unsubscribeObservables();
  }

  ionViewWillLeave(){
    // this.unsubscribeObservables();
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ViagemPage');
  }

  centralizarMapaNoCondutor(){
    this.mapaCtrl.centralizarMapaNoCondutor();
  }  

  centralizarMapaNoTrajeto(){
    this.mapaCtrl.centralizarMapaNoTrajeto();
  }

  pararViagem(){
    this.viagemIniciada=false;
  }

  confirmarPararViagem(){
    let confirm = this.alertCtrl.create({
      title: 'Parar Viagem',
      message: 'Confrma que vai parar?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: () => {
            this.pararViagem();
          }
        }
      ]
    });
    confirm.present();
  }

  conduzidoABordo(conducao:Conducao){

  }

  confirmarConduzidoABordo(conducao:Conducao){
    let confirm = this.alertCtrl.create({
      title: 'Conduido a Bordo',
      message: "Confirma que "+conducao.conduzidoVO.nome+" está a bordo?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: () => {
            this.conduzidoABordo(conducao);
          }
        }
      ]
    });
    confirm.present();
  }

}

