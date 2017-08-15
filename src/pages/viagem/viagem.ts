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
    public fatguys: FatguysUberProvider,
    public localizacaoService: LocalizacaoProvider,
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
    this.confirmarDeixouConduzidoNoDestino($event);
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
    this.localizacaoService.pararRastreamento();
    this.fatguys.interromperRoteiro(this.roteiro).then(
      r=>{
        this.navCtrl.setRoot('CadastroRoteirosPage');
      }
    )
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

  conduzidoEmbarcou(conducoes:Conducao[]){
    conducoes.forEach(
      c=>{
        c.cancelada=false;
        c.emAndamento=false;
        c.embarcado=true;
        c.realizada=false;
        c.inicio=new Date();
        console.log(c);
      }
    );
    this.fatguys.salvarConducoesDoRoteiro(this.roteiro);
  }
  conduzidoDesembarcou(conducoes:Conducao[]){
    conducoes.forEach(
      c=>{
        c.cancelada=false;
        c.emAndamento=false;
        c.embarcado=false;
        c.realizada=true;
        c.fim=new Date();
        console.log(c);
      }
    )
    this.fatguys.salvarConducoesDoRoteiro(this.roteiro).then(
      r=>{
        var i=this.roteiro.conducoes.findIndex(
          c=>{
            return !c.realizada&&!c.cancelada;
          }
        )
        if(i<0){
          this.roteiroFinalizado();
        }
      }
    );
  }

  roteiroFinalizado(){
    this.fatguys.finalizarRoteiro(this.roteiro).then(
      r=>{
        let confirm = this.alertCtrl.create({
          title: 'Roteiro Finalizado',
          message: "Você finalizou o roteiro",
          buttons: [          
            {
              text: 'OK',
              handler: (opcoes) => {
                this.navCtrl.setRoot('CadastroRoteirosPage');
              }
            }
          ]
        });
        confirm.present();
      }
    )
  }

  confirmarDeixouConduzidoNoDestino(conducoes:Conducao[]){
    let confirm = this.alertCtrl.create({
      title: 'Conduzido a Bordo',
      message: "Marque os conduzidos desembarcaram agora",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
                var co=conducoes.find(
                  c=>{
                    return c.id==o;
                  }
                )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoDesembarcou(cs);
          }
        }
      ]
    });

    conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: true
        });
      }
    )

    confirm.present();
  }

  confirmarConduzidoABordo(conducoes:Conducao[]){

    let confirm = this.alertCtrl.create({
      title: 'Conduzido a Bordo',
      message: "Marque os conduzidos embarcaram agora",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
              var co=conducoes.find(
                c=>{
                  return c.id==o;
                }
              )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoEmbarcou(cs);
          }
        }
      ]
    });

    conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: true
        });
      }
    )

    confirm.present();
  }

}

