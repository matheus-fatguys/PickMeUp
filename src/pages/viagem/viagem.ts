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
     
     this.iniciarGeolocalizcao();
  }

  iniciarGeolocalizcao(){
    this.platform.ready().then(
      a=>{
        this.geolocation.getCurrentPosition().then(resp=>{
          
          this.localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          this.msg.mostrarMsg('Localização: ' + this.localizacao);
          this.definirLocais(this.roteiro);
          this.calcularTrajeto();
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
      });      
  }

  ordenarLocaisPorDistancia(){
      var distancias=[];

      this.locais.forEach((lo, i) => {
        distancias.push({indice: i, distancia: Math.sqrt(Math.pow(lo.latitude,2)+Math.pow(lo.longitude,2)) });        
      });
    
      distancias.sort((a, b)=>{return a.distancia-b.distancia });

      distancias.forEach(d=>{
        this.locaisOrdenados.push(this.locais[d.indice]);
      });
  }

  mostrarTrajetoDoRoteiro(opts){
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


  calcularTrajeto(){    
    this.ordenarLocaisPorDistancia();

    var pontos=this.locaisOrdenados.map(local=>new google.maps.LatLng(local.latitude, local.longitude));
    let paradas=null;
    let inicio = new google.maps.LatLng(this.localizacao.lat(), this.localizacao.lng());
    console.log(inicio.lat());
    console.log(inicio.lng());
    let fim = pontos[pontos.length-1];
    console.log(fim.lat());
    console.log(fim.lng());
    if(pontos.length>2){
      paradas=[];
      var ps=pontos.slice(0,pontos.length-1);
      ps.forEach(
                                      p=> {
                                        var wp ={
                                                  location: p,
                                                  stopover:true
                                                };
                                        paradas.push(wp);
                                      });      
    }

    this.directionsService.route({
        origin: inicio,
        destination: fim,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: paradas,
        optimizeWaypoints: true
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log(response);
          var ordemGoogle=[];
          response.routes[0].waypoint_order.forEach(
            wpo=>{
              ordemGoogle.push(this.locaisOrdenados[wpo]);
            });
          this.locaisOrdenados.splice(0,ordemGoogle.length,...ordemGoogle);
          var opts=[];
          var duracaoTotal=0;
          var distanciaTotal=0;
          this.locaisOrdenados.forEach((lo, i) => {
              duracaoTotal+=response.routes[0].legs[i].duration.value;
              distanciaTotal+=response.routes[0].legs[i].distance.value;
              opts.push({
                          type: 'check',
                          value: (1+i)+'- '+lo.endereco.substring(0,15)+'... ('+response.routes[0].legs[i].duration.text+') - '+response.routes[0].legs[i].distance.text,
                          checked: false
                        });
            });          
          opts.push({
                          type: 'check',
                          value: 'Tot.: ('+this.formatar(duracaoTotal)+') - '+Math.round(distanciaTotal/1000)+' km',
                          checked: false
                        });
          this.mostrarTrajetoDoRoteiro(opts);
        }
        else {
          console.error(status);
        }
      })
  }

  formatar(n:number):string{
    var ret = "";
    var minutos =Math.round(n/60);
    var horas =Math.round(minutos/60);
    var strHr="";
    
    if(minutos>59){
      strHr=horas+" hr ";
      ret=ret+strHr;
      var m=Math.round(n-horas*60*60)/60;
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
