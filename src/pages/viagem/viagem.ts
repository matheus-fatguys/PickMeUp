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
  private roteiro={} as Roteiro;
  private locais = [] as Local[];
  private locaisOrdenados = [] as Local[];
  private destinos = [] as Local[];
  private origens = [] as Local[];
  private paradas = [] as Local[];
  private localizacao;
  public directionsService: google.maps.DirectionsService;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    private alertCtrl: AlertController,
    private geolocation: Geolocation, 
    private platform : Platform, 
    public loadingCtrl: LoadingController) {
     let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
      }

    this.directionsService = new google.maps.DirectionsService();
     if(roteiro!=null){
       if(this.roteiro.conducoes!=null&&this.roteiro.conducoes.length>0){
        this.iniciarGeolocalizcao();
       }
     }
  }

  iniciarGeolocalizcao(){
    this.platform.ready().then(
      a=>{
        let loading = this.loadingCtrl.create({
          content: 'Obtendo localização atual...'
        });           
        loading.present(loading);        
        this.geolocation.getCurrentPosition().then(resp=>{
          
          this.localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          loading.setContent('Calculanto trajeto da viagem...');
          this.calcularTrajeto().subscribe(
            trajeto=>{
                  loading.dismiss();
                  this.mostrarTrajetoDoRoteiro(trajeto);
            }
          );
        }).catch(err=>{
          this.msg.mostrarErro('Erro obtendo localização: ' + err);
        });
      }
    );
  }

  definirLocais(roteiro: Roteiro){
      roteiro.conducoes.forEach(c=>{
        var lio=this.locais.findIndex(l=>{return l.endereco==c.origem.endereco});
        var lid=this.locais.findIndex(l=>{return l.endereco==c.destino.endereco});
        if(lio<0){
          this.locais.push(c.origem);
        }
        if(lid<0){
          this.locais.push(c.destino);
        }
        lio=this.origens.findIndex(l=>{return l.endereco==c.origem.endereco});
        lid=this.destinos.findIndex(l=>{return l.endereco==c.destino.endereco});
        if(lio<0){
          this.origens.push(c.origem);
        }
        if(lid<0){
          this.destinos.push(c.destino);
        }
      });      
  }


  mostrarTrajetoDoRoteiro(trajeto:Trajeto){
    var opts=[];
      var duracaoTotal=0;
      var distanciaTotal=0;
      trajeto.pernas.forEach((perna, i) => {          
          trajeto.pernas.push(perna);
          opts.push({
              type: 'check',
              value: (1+i)+'- '+perna.local.endereco.substring(0,15)+'... ('+perna.tempo+') - '+perna.distancia,
              checked: false
            });
        });  
      opts.push({
            type: 'check',
            value: 'Tot.: ('+trajeto.tempoTotal+') - '+trajeto.distanciaTotal,
            checked: false
          });
      let prompt = this.alertCtrl.create({
      title: 'Iniciando Roteiro '+this.roteiro.nome,
      message: 'Locais da Viagem:',
      inputs: opts,
      buttons: [{
        text: 'Ok',
        handler: r => {
        }
      }]
    });    
    prompt.present(prompt);
  }

  ordenarLocaisPorDistancia(){
    var distancias=[];

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(this.localizacao.lat()-lo.latitude,2)+Math.pow(this.localizacao.lng()-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>1){
      this.paradas=this.locaisOrdenados.slice(0,this.locaisOrdenados.length-1);
    }
    else{
      this.paradas=null;
    }
  }

  ordenarLocaisPorDistanciaComUnicoDestino(){
    var distancias=[];
    var id=this.locais.findIndex(l=>{return l.endereco==this.destinos[0].endereco})
    var destino=this.locais[id];
    this.locais.splice(id,1);

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(this.localizacao.lat()-lo.latitude,2)+Math.pow(this.localizacao.lng()-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>0){
      this.paradas=this.locaisOrdenados.map(l=>l);
    }
    else{
      this.paradas=null;
    }
    this.locaisOrdenados.push(destino);
  }

  ordenarLocaisPorDistanciaComUnicaOrigem(){
    var distancias=[];
    var io=this.locais.findIndex(l=>{return l.endereco==this.origens[0].endereco})
    var origem=this.locais[io];
    this.locais.splice(io,1);

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(origem.latitude-lo.latitude,2)+Math.pow(origem.longitude-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    this.locaisOrdenados.push(origem);
    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>1){
      this.paradas=this.locaisOrdenados.slice(1,this.locaisOrdenados.length-1);
    }
    else{
      this.paradas=null;
    }
  }

  calcularRota(origem:Local, destino:Local, intermediarias?:Local[]):Observable<Trajeto>{
    
    var pontos=null;
    var lista = [];
    if(origem!=null){
      lista.push(origem);
    }
    if(intermediarias!=null){
      pontos=intermediarias.map(local=>new google.maps.LatLng(local.latitude, local.longitude));
    }
    let paradas=null;
    let inicio : google.maps.LatLng;
    if(origem!=null){
      inicio = new google.maps.LatLng(origem.latitude, origem.longitude);
    }
    else{
      inicio = new google.maps.LatLng(this.localizacao.lat(), this.localizacao.lng());
    }
    var fim ;
    if(destino!=null){
      fim = new google.maps.LatLng(destino.latitude, destino.longitude);
    }
    else{
      fim = pontos[pontos.length-1];
    }
    if(pontos!=null && pontos.length>0){
      paradas=[];
      // var ps=pontos.slice(0,pontos.length-1);
      pontos.forEach(
              p=> {
                var wp ={
                          location: p,
                          stopover:true
                        };
                paradas.push(wp);
              });      
    }    
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      observable=>{
        this.directionsService.route({
            origin: inicio,
            destination: fim,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions:{
                              departureTime: new Date(),
                              trafficModel: google.maps.TrafficModel.BEST_GUESS
                          },
            waypoints: paradas,
            optimizeWaypoints: true
          }, (response, status) => {
              var trajeto:Trajeto = this.processarResposta(response, status, paradas, lista, destino);  
              observable.next(trajeto);   
          })
      }
    );
    return trajetoObservable;
  }

  processarResposta(response: google.maps.DirectionsResult,
                    status: google.maps.DirectionsStatus,
                    paradas: google.maps.DirectionsWaypoint[],
                    lista:Local[],
                    destino:Local):Trajeto{
    let trajeto:Trajeto = null;
    if (status === google.maps.DirectionsStatus.OK) {
      console.log(response);
      trajeto={} as Trajeto;
      trajeto.pernas=[] as Perna[];
      var ordemGoogle=[];
      if(paradas!=null){
        response.routes[0].waypoint_order.forEach(
          wpo=>{
            ordemGoogle.push(this.locaisOrdenados[wpo]);
            lista.push(this.locaisOrdenados[wpo]);
          });
          if(destino!=null){
            lista.push(destino);
          }
        this.locaisOrdenados.splice(0,ordemGoogle.length,...ordemGoogle);
      }
      else{
        lista.push(destino);
      }
      var duracaoTotal=0;
      var distanciaTotal=0;
      lista.forEach((lo, i) => {
          var perna:Perna={} as Perna;
          perna.local=lo;
          perna.tempo=response.routes[0].legs[i].duration.text;
          perna.distancia=response.routes[0].legs[i].distance.text;
          trajeto.pernas.push(perna);
          duracaoTotal+=response.routes[0].legs[i].duration.value;
          distanciaTotal+=response.routes[0].legs[i].distance.value;          
        });  
      trajeto.tempoTotal=this.formatar(duracaoTotal);        
      trajeto.distanciaTotal=Math.round(distanciaTotal/1000)+' km';  
      return trajeto;
    }
    else {
      console.error(status);
      var msgErro=this.obterMesnagemErro(status);
      this.msg.mostrarErro("Erro obtendo trajeto da viagem: "+msgErro);
    }
    return trajeto;
  }

  obterMesnagemErro(status: google.maps.DirectionsStatus):string{
      var msgErro:string="";
      switch(status){
        case google.maps.DirectionsStatus.ZERO_RESULTS: 
          msgErro="Nenhum trajeto encontrado!";
          break;
        case google.maps.DirectionsStatus.NOT_FOUND: 
          msgErro="Local não encontrado!";
          break;
        case google.maps.DirectionsStatus.REQUEST_DENIED: 
          msgErro="Requisição negada!";
          break;
        case google.maps.DirectionsStatus.INVALID_REQUEST: 
          msgErro="Requisição inválida!";
          break;
        case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED: 
          msgErro="Máximo de paradas excedido!";
          break;
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT: 
          msgErro="Máximo de consultas excedido!";
          break;
        case google.maps.DirectionsStatus.UNKNOWN_ERROR: 
          msgErro="Erro desconhecido!";
          break;
        case google.maps.DirectionsStatus.OK: 
          msgErro="Nenhum erro!";
          break;
      }
        return msgErro;
  }
  calcularTrajetoComUnicoDestinoEUnicaOrigem():Observable<Trajeto>{
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        this.calcularRota(this.origens[0], this.destinos[0], null).subscribe(
          trajeto=>{
            obervable.next(trajeto);
          }
        );
      }
    );
    return trajetoObservable;
  }
  calcularTrajetoComUnicoDestino():Observable<Trajeto>{
    this.ordenarLocaisPorDistanciaComUnicoDestino();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        this.calcularRota(null, this.destinos[0], this.paradas).subscribe(
          trajeto=>{
            obervable.next(trajeto);
          }
        );
      }
    );
    return trajetoObservable;
  }

  calcularTrajetoComUnicaOrigem():Observable<Trajeto>{
    this.ordenarLocaisPorDistanciaComUnicaOrigem();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        this.calcularRota(null, this.origens[0], null).subscribe(
          trajeto=>{
            this.calcularRota(this.origens[0], this.locaisOrdenados[this.locaisOrdenados.length-1], this.paradas).subscribe(
              trajeto2=>{
                let trajetoConcatenado:Trajeto=this.concatenarTrajetos(trajeto, trajeto2);
                obervable.next(trajetoConcatenado);
              }
            );
          }
        );
      }
    );
    return trajetoObservable;
  }

  concatenarTrajetos(trajeto1:Trajeto, trajeto2:Trajeto):Trajeto{
    let trajetoConcatenado:Trajeto={} as Trajeto;
    trajetoConcatenado.pernas=[] as Perna[];    
    trajeto1.pernas.forEach(
      p=>{
        trajetoConcatenado.pernas.push(p);
      });
    if(trajetoConcatenado.pernas[trajetoConcatenado.pernas.length-1].local.endereco==
      trajeto2.pernas[0].local.endereco
    ){
      trajetoConcatenado.pernas.pop();
    }
    trajeto2.pernas.forEach(
      p=>{
        trajetoConcatenado.pernas.push(p);
      });
    return trajetoConcatenado;
  }

  calcularTrajetoPorDistancia():Observable<Trajeto>{
    this.ordenarLocaisPorDistancia();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        this.calcularRota(null, 
          this.locaisOrdenados[this.locaisOrdenados.length-1], 
          this.paradas).subscribe(
          trajeto=>{
            obervable.next(trajeto);
          }
        );
      }
    );
    return trajetoObservable;
  }

  calcularTrajeto():Observable<Trajeto>{ 
    this.definirLocais(this.roteiro);
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        var sub;
        if(this.destinos.length==1&&this.origens.length==1){
          sub=this.calcularTrajetoComUnicoDestinoEUnicaOrigem();
        }else if(this.destinos.length==1)   {
          sub=this.calcularTrajetoComUnicoDestino();
        }else if(this.origens.length==1){
          sub=this.calcularTrajetoComUnicaOrigem();
        }else{
          sub=this.calcularTrajetoPorDistancia();
        }
        sub.subscribe(
          trajeto=>{
            obervable.next(trajeto);
          }
        );
      });     
    return trajetoObservable;
  }

  formatar(n:number):string{
    var ret = "";
    var minutos =Math.round(n/60);
    var horas =Math.round(minutos/60);
    var strHr="";
    
    if(minutos>59){
      strHr=horas+" hr ";
      ret=ret+strHr;
      var m=Math.round((n-horas*60*60)/60);
      minutos=m;
    }
    var strMin=minutos+" min";
    ret=ret+strMin;
    return ret;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViagemPage');
  }

}
