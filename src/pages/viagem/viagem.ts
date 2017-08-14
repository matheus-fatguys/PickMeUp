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
import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';



@IonicPage()
@Component({
  selector: 'page-viagem',
  templateUrl: 'viagem.html',
})
export class ViagemPage implements OnDestroy  {
  
  private tituloInicio: string = "Viagem";
  private tituloEmViagem:string="Viagem";
  private viagemIniciada:boolean=false;
  private roteiro={} as Roteiro;  
  private localizacao: google.maps.LatLng;
  private marcaCondutor: SlidingMarker;
  private marcasConduzidos: ConduzidoMV[]=[] as ConduzidoMV[];// google.maps.Marker[]=[] as google.maps.Marker[];
  private marcasLocaisTrajeto: google.maps.Marker[]=[] as google.maps.Marker[];
  private marcas: google.maps.Marker[];
  private mapa: google.maps.Map;
  private trajeto: Trajeto;  
  private polylinePath :google.maps.Polyline;
  private conducoesObsever;
  private conducoesObservable:Observable<any>;
  
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
          console.log("VAI PEDIR LOCALIZAÇÃO");   
          loading.present(loading);        
          let obs=this.localizacaoService.iniciarGeolocalizacao()
          obs.subscribe(
            localizacao=>{
              this.localizacao=localizacao;
              loading.setContent('Calculanto trajeto da viagem...');
              let obs = this.trajetoService.calcularTrajeto(this.localizacao, this.roteiro);
              obs.subscribe(
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
                                      this.msg.mostrarMsg("Boa viagem, dirija com atenção!", 2000);
                                      this.mostrarMarcacoes(trajeto);
                                      this.mostrarCaminhoDoTrajeto(trajeto);
                                      this.centralizarMapa(this.marcas);
                                      this.adcionarEventListener();
                                      this.iniciarMonitoracaoDeLocalizacaoCondutor();
                                      this.iniciarMonitoramentoConduzidos();
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
                                // if(this.navCtrl.canGoBack()){
                                //   this.navCtrl.pop();
                                // }
                              }  
                            );                      
                    },
                    error=>{
                      loading.dismiss();
                      this.msg.mostrarErro('Erro obtendo localização: ' + error);
                      // if(this.navCtrl.canGoBack()){
                      //   this.navCtrl.pop();
                      // }
                    }
                  );
                  obs.first();                
            },
            error=>{
              loading.dismiss();
              this.msg.mostrarErro(error);
              // if(this.navCtrl.canGoBack()){
              //   this.navCtrl.pop();
              // }
            }
          );
          obs.first()
         }
         catch(error){
          this.msg.mostrarErro(error);
          // if(this.navCtrl.canGoBack()){
          //   this.navCtrl.pop();
          // }
         }
       }
     }
  }

  iniciarMonitoracaoDeLocalizacaoCondutor(){
    // let o=this.localizacaoService.iniciarMonitoracaoDeLocalizacao();
    // let o=this.localizacaoService.iniciarMonitoracaoDeLocalizacaoSimulada();
     let o=this.fatguys.obterLocalizacaoCondutor(this.fatguys.condutor);
    //let o=this.fatguys.obterLocalizacaoSimuladaCondutor(this.fatguys.condutor);
    o.subscribe(
      l=>{
        this.atualizarCondutorNoMapa();
      },
      error=>{
        console.error(error);
        this.msg.mostrarErro(error);
      }
    )
  }

  alertarCancelamento(conduzidoVO):boolean{
    this.msg.mostrarErro(conduzidoVO.nome+" acaba de notificar cancelamento");
    var mv = this.marcasConduzidos.find(mv=>{return mv.conduzido.nome==conduzidoVO.nome});
    if(mv==null||mv.cancelado){
      return false;
    }
    mv.cancelado=false;
    mv.marca.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(()=>{mv.marca.setAnimation(null)},6000);
    mv.marca.setIcon("img/person-grey.png");
    return true;
  }

  recalcularTrajeto(roteiro){
    this.msg.mostrarErro("Recalculando trajeto", 4000);
    let localizacao=new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude, this.fatguys.condutor.localizacao.longitude);    
    let obs = this.trajetoService.calcularTrajeto(localizacao, this.roteiro);
    obs.subscribe(
      trajeto=>{ 
        this.polylinePath.setMap(null);
        this.mostrarCaminhoDoTrajeto(trajeto);
        
      },
      error=>{
          this.msg.mostrarErro("Erro recalculando trajeto: "+ error,6000);
      });
    obs.first();
  }

  informaConducaoMantida(conduzidoVO){
    this.msg.mostrarMsg(conduzidoVO.nome+" está confirmado", 2000);
    var mv = this.marcasConduzidos.find(mv=>{return mv.conduzido.nome==conduzidoVO.nome}); 
    if(mv==null||!mv.cancelado){
      return;
    } 
    mv.cancelado=true;  
    mv.marca.setIcon("img/person-icon-blue.png");
  }

  ngOnDestroy(): void {
    if(this.fatguys.conducoesSubscription){
      this.fatguys.conducoesSubscription.unsubscribe();
      this.fatguys.conducoesSubscription=null;
    }
  }

  ionViewWillLeave(){
    if(this.fatguys.conducoesSubscription){
      this.fatguys.conducoesSubscription.unsubscribe();
    }
  }

  funcaoDeMonitoramento(cs){
    
    var recalcular:boolean=false;                     
    cs.forEach(c => {
        if(c.cancelada){
          recalcular=this.alertarCancelamento(c.conduzidoVO);
        }
        else{
          // this.informaConducaoMantida(c.conduzidoVO);
        }          
    });
    if(recalcular){
      this.roteiro.conducoes=cs;
      this.recalcularTrajeto(this.roteiro);
      this.centralizarMapaNovoTrajeto();
    }
  }

  iniciarMonitoramentoConduzidos(){
    if(this.conducoesObsever!=null) return;
    this.conducoesObservable=this.fatguys.obterConducoesDoRoteiroComConduzidos(this.roteiro);
    this.fatguys.conducoesSubscription =this.conducoesObservable
    .subscribe(
      cs=>{
        this.funcaoDeMonitoramento(cs);   
      },
      error=>{
        console.error(error);
        this.msg.mostrarErro(error);
      }
    )
  }

  atualizarCondutorNoMapa(localizacao?:google.maps.LatLng){
    if(localizacao==null){
      localizacao=new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude,
        this.fatguys.condutor.localizacao.longitude);
    }
    this.marcaCondutor.setPosition(localizacao);
    this.marcaCondutor.setEasing('linear');
    this.centralizarMapa();
  }

  mostrarMarcacoes(trajeto:Trajeto){
    this.marcarLocalizacaoCondutor();
    this.marcarLocaisTrajeto(trajeto);
    let marcas=[] as google.maps.Marker[];
    this.marcas=[] as google.maps.Marker[];
    this.marcasConduzidos.forEach(m=>{
      this.marcas.push(m.marca);
    })
    // this.marcas=this.marcasConduzidos.concat(this.marcasLocaisTrajeto);
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
    // this.polylinePath.setMap(null);
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
        var conduzidos=[];
        var conduzidosDestino=[];
        this.roteiro.conducoes.forEach(
          conducao=>{
            if(conducao.origem.endereco==perna.local.endereco){
              conduzidos.push(conducao.conduzidoVO);
              if(conteudo.length>0){
                conteudo+='<h7 style="color:blue;">,'+conducao.conduzidoVO.nome+'</h7>';
              }
              else{
                conteudo='<h7 style="color:blue;">'+conducao.conduzidoVO.nome+'</h7>';
              }
              conteudo+='<a href="tel: '+conducao.conduzidoVO.telefone+'"><img src="img/call.png"></img></a>';
              qtdO++;
            }
            if(conducao.destino.endereco==perna.local.endereco){
              conduzidosDestino.push(conducao.conduzidoVO);
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
        // if(qtdO>0){
        //   conteudo=conteudo+'<img src="img/origem-icon.png"></img>';
        // }
        if(qtdD>0){
          conteudo='<img src="img/finish_flag.png"></img>'+conteudo;
        }
        this.marcarLocal(perna,conteudo,conduzidos, conduzidosDestino);
      });
  }
  marcarLocal(perna:Perna, conteudo:string, conduzidos, conduzidosDestino){
    var icone='img/person-icon-blue.png';
    if(conduzidos.length+conduzidosDestino.length>1){
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

    conduzidos.forEach(c => {
      let mv={} as ConduzidoMV;
      mv.marca=marcaLocal;
      mv.conduzido=c;
      this.marcasConduzidos.push(mv);
    });


    this.marcasLocaisTrajeto.push(marcaLocal);
    setTimeout( () => {
		if (marcaLocal){
			marcaLocal.setAnimation(null);
		}	  
    }, 2000);
  }

  marcarLocalizacaoCondutor() {
    this.marcaCondutor = new SlidingMarker({
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

  centralizarMapaNovoTrajeto(){
    var bounds = new google.maps.LatLngBounds();
    var p = this.polylinePath.getPath().getArray();
    p.forEach(
      e=>{
        bounds.extend(e);
        console.log(e);
        console.log(e.lat());
      });
    bounds.getCenter();
    this.mapa.fitBounds(bounds);
  }

  centralizarMapa(marcas?:google.maps.Marker[]){
    if(marcas==null){
      marcas=this.marcas;
    }
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

interface ConduzidoMV{
  conduzido: Conduzido,
  marca:google.maps.Marker,
  cancelado:boolean
}
interface ConducaoMV{
  conducao: Conducao,
  marca:google.maps.Marker
}