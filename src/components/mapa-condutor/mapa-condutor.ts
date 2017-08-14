import { Perna } from './../../models/perna';
import { Conducao } from './../../models/conducao';
import { Conduzido } from './../../models/conduzido';
import * as SlidingMarker from 'marker-animate-unobtrusive';
import { Trajeto } from './../../models/trajeto';
import { Roteiro } from './../../models/roteiro';
import { TrajetoProvider } from './../../providers/trajeto/trajeto';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { Platform, LoadingController } from 'ionic-angular';
import { Component, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mapa-condutor',
  templateUrl: 'mapa-condutor.html'
})
export class MapaCondutorComponent implements OnDestroy, OnChanges {
  
  

  @Input() roteiro={} as Roteiro;
  private localizacao: google.maps.LatLng;
  private marcas: google.maps.Marker[];
  private marcaCondutor: SlidingMarker;
  private marcasConduzidos: ConduzidoMV[]=[] as ConduzidoMV[];// google.maps.Marker[]=[] as google.maps.Marker[];
  private marcasLocaisTrajeto: google.maps.Marker[]=[] as google.maps.Marker[];
  private trajeto: Trajeto;  
  private mapa: google.maps.Map;
  private polylinePath :google.maps.Polyline;
  @Output() onViagemIniciada= new EventEmitter<google.maps.Map>();
  @Output() onOrigemProxima= new EventEmitter<Conducao>();
  @Output() onDestinoProximo= new EventEmitter<Conducao>();

  constructor(public platform: Platform,
    public localizacaoService: LocalizacaoProvider,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public trajetoService: TrajetoProvider,
    public loadingCtrl: LoadingController) {

      
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.unsubscribeObservables();
    this.renderizarMapa(changes["roteiro"].currentValue);
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }

  renderizarMapa(roteiro:Roteiro){
    // this.roteiro=roteiro;
    if(this.roteiro.conducoes!=null&&this.roteiro.conducoes.length>0){
        try{          
        
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
                                    this.msg.mostrarMsg("Boa viagem, dirija com atenção!", 2000);
                                    this.mostrarMarcacoes(trajeto);
                                    this.mostrarCaminhoDoTrajeto(trajeto);
                                    this.centralizarMapa(this.marcas);
                                    this.adcionarEventListener();
                                    this.iniciarMonitoracaoDeLocalizacaoCondutor();
                                    this.iniciarMonitoramentoConduzidos();
                                    this.onViagemIniciada.emit(this.mapa);
                                  }
                                }
                              );
                            }
                          }).catch(
                            error=>{                                
                              loading.dismiss();
                              this.msg.mostrarErro('Erro obtendo localização: ' + error);
                            }  
                          );                      
                  },
                  error=>{
                    loading.dismiss();
                    this.msg.mostrarErro('Erro obtendo localização: ' + error);
                  }
                );
                obs.first();                
          },
          error=>{
            loading.dismiss();
            this.msg.mostrarErro(error);
          }
        );
        obs.first()
        }
        catch(error){
        this.msg.mostrarErro(error);
        }
      }  
  }

  verificarOrigemDestinoProximos(localizacao: google.maps.LatLng){
    var distanciaMaxima=0.05;
    this.roteiro.conducoes.forEach(
      c=>{
        var co=new google.maps.LatLng(c.origem.latitude, c.origem.longitude);        
        var d =this.distanciaKm(co, localizacao);
        if(d<distanciaMaxima){
          this.onOrigemProxima.emit(c);
        }

        var cd=new google.maps.LatLng(c.destino.latitude, c.destino.longitude);        
         d =this.distanciaKm(cd, localizacao);
        if(d<distanciaMaxima){
          this.onDestinoProximo.emit(c);
        }
      }
    )
  }
  

  iniciarMonitoracaoDeLocalizacaoCondutor(){
    // let o=this.localizacaoService.iniciarMonitoracaoDeLocalizacao();
    // let o=this.localizacaoService.iniciarMonitoracaoDeLocalizacaoSimulada();
    this.localizacaoService.localizacaoCondutorSubscription=this.fatguys.obterLocalizacaoCondutor(this.fatguys.condutor)
    .subscribe(
      l=>{
        this.atualizarCondutorNoMapa(new google.maps.LatLng(l.latitude,l.longitude));
        this.verificarOrigemDestinoProximos(new google.maps.LatLng(l.latitude,l.longitude));
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

  recalcularTrajeto(roteiro, localizacao?:google.maps.LatLng){
    if(localizacao==null){
      localizacao=new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude, this.fatguys.condutor.localizacao.longitude);    
    }
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

  unsubscribeObservables(){
    if(this.fatguys.conducoesSubscription){
      this.fatguys.conducoesSubscription.unsubscribe();
      this.fatguys.conducoesSubscription=null;
    }
    if(this.localizacaoService.localizacaoCondutorSubscription){
      this.localizacaoService.localizacaoCondutorSubscription.unsubscribe();
      this.localizacaoService.localizacaoCondutorSubscription=null;
    }
  }

  

  funcaoDeMonitoramentoConduzidos(cs){
    
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
      this.msg.mostrarErro("Recalculando trajeto após cancelamento", 4000);
      this.recalcularTrajeto(this.roteiro);
      this.centralizarMapaNovoTrajeto();
    }
  }

  iniciarMonitoramentoConduzidos(){
    this.fatguys.conducoesSubscription=this.fatguys.obterConducoesDoRoteiroComConduzidos(this.roteiro)
    .subscribe(
      cs=>{
        this.funcaoDeMonitoramentoConduzidos(cs);   
      },
      error=>{
        console.error(error);
        this.msg.mostrarErro(error);
      }
    )
  }

  distancia(p1:google.maps.LatLng, p2:google.maps.LatLng):number{
    return Math.sqrt(Math.pow(p2.lat()-p1.lat(),2)-Math.pow(p2.lng()-p1.lng(),2));
  }

  distanciaKm(p1:google.maps.LatLng, p2:google.maps.LatLng) {
      var lat1, lon1, lat2, lon2
      lat1=p1.lat()
      lat2=p2.lat()
      lon1=p1.lng()
      lon2=p1.lng()
      var rlat1 = Math.PI * lat1/180
      var rlat2 = Math.PI * lat2/180
      var rlon1 = Math.PI * lon1/180
      var rlon2 = Math.PI * lon2/180
      var theta = lon1-lon2
      var rtheta = Math.PI * theta/180
      var dist = Math.sin(rlat1) * Math.sin(rlat2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(rtheta);
      dist = Math.acos(dist)
      dist = dist * 180/Math.PI
      dist = dist * 60 * 1.1515
      dist = dist * 1.609344 
      return dist
}

  pontoMaisProximoNoCaminho(localizacao?:google.maps.LatLng){    
    var indice=-1;
    var diastanciaMaisproximo:number=Math.pow(10,6);
    this.polylinePath.getPath().getArray().forEach(
      (p, i)=>{
        var d=this.distancia(p, localizacao);
        if(d<diastanciaMaisproximo){
          diastanciaMaisproximo=d;
          indice=i;
        }
      }
    )
    return indice;
  }

  atualizarCondutorNoMapa(localizacao?:google.maps.LatLng){
    var distanciaMaximaCaminho=0.1;
    var distanciaMinimaPonto=0.1;
    if(localizacao==null){
      localizacao=new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude,
        this.fatguys.condutor.localizacao.longitude);
    }

    var indicePontoMaisProximo = this.pontoMaisProximoNoCaminho(localizacao);
    var pontoMaisProximo=this.polylinePath.getPath().getArray()[indicePontoMaisProximo];
    var distanciaMaisProximo = this.distanciaKm(localizacao, pontoMaisProximo);    

    if(indicePontoMaisProximo>0){
      this.polylinePath.setMap(null);
      this.polylinePath.getPath().getArray().splice(0,indicePontoMaisProximo);
      this.polylinePath.setMap(this.mapa);
    }
    
    if(distanciaMaisProximo>distanciaMaximaCaminho){
      this.recalcularTrajeto(this.roteiro, localizacao);
      this.marcaCondutor.setPosition(localizacao);
      this.marcaCondutor.setEasing('linear');    
      // this.centralizarMapa();
    }
    else{
      this.marcaCondutor.setPosition(pontoMaisProximo);
      this.marcaCondutor.setEasing('linear');    
    }

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
    path.push(new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude, this.fatguys.condutor.localizacao.longitude));
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
      });
    bounds.getCenter();
    this.mapa.fitBounds(bounds);
  }

  centralizarMapaNoCondutor(){        
    var loc=new google.maps.LatLng(this.marcaCondutor.getPosition().lat(), this.marcaCondutor.getPosition().lng());
    this.mapa.panTo(this.marcaCondutor.getPosition());
    this.mapa.setZoom(15);
    loc=new google.maps.LatLng(this.mapa.getBounds().getNorthEast().lat(), this.mapa.getCenter().lng());
    this.mapa.panTo(loc);
  }

  centralizarMapaNoTrajeto(){
    this.centralizarMapaNovoTrajeto();
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