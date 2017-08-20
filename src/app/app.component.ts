import { OfflinePage } from './../pages/offline/offline';
import { MensagemProvider } from './../providers/mensagem/mensagem';
import { AudioProvider } from './../providers/audio/audio';
import { FatguysUberProvider } from './../providers/fatguys-uber/fatguys-uber';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Nav, ModalController } from "ionic-angular";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any;

  pages: Array<{title: string, component: any, icon:string}>;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    afAuth: AngularFireAuth,
    public fatguysService: FatguysUberProvider,
    public msg: MensagemProvider,
    public modalCtrl: ModalController,
    public audio:AudioProvider) {
      // console.log("constructor MyApp");
      
      // let conectado=this.fatguysService.conectado();
      // conectado.subscribe(
      //   e=>{
      //     if(!e.value){
      //       this.msg.mostrarErro("Você está sem conexão com a base!").onDidDismiss(
      //         _=>{
      //             let modal = this.modalCtrl.create(OfflinePage);
      //             modal.onDidDismiss(data => {
      //               if(data!=null&&data.conducao!=null){                
      //                 this.rootPage = 'HomePage';
      //               }
      //             });  
      //             modal.present();
      //         }
      //       );
      //     }
      //     else{
      //       if(!this.fatguysService.conexao) {
      //         this.msg.mostrarErro("Conexão restabelecida!", 1000);
      //       }
      //     }
      //     this.fatguysService.conexao=e.value;
      //   }
      // )
      console.log("subscribe no auth")
      const authObserver = afAuth.authState.first().subscribe( user => {
        console.log("user esá nulo")
        if (user!=null) {
          console.log("pegando ref para subscribe no condutor")
          let ref= this.fatguysService.obterCondutorPeloUsuarioLogado();
          console.log("pegou ref");
          if(ref!=null){
            console.log("subscribe no condutor")
                  let sub =
                        ref.subscribe(
                          r=>{
                            sub.unsubscribe();
                            console.log("indo pra home page")
                            this.rootPage = 'HomePage';
                          }
                        );
                      } else {
                        console.log("indo pra login page")
                    this.rootPage = 'LoginPage';
                  }
                }
                else{
                  console.log("indo pra login page")
                  this.rootPage = 'LoginPage';
                }
            // authObserver.unsubscribe();
            });
      platform.ready().then(() => {
        console.log("plataforma pronta")
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Condutor', component: 'CondutorPage', icon:'person' },
      { title: 'Conduzidos', component: 'CadastroConduzidosPage', icon:'people' },
      { title: 'Conduções', component: 'CadastroConducoesPage', icon:'git-network' },
      { title: 'Roteiros', component: 'CadastroRoteirosPage', icon:'git-compare' },
      { title: 'Sair', component: 'LogoutPage', icon:'log-out' }
    ];

    audio.preload('bem-vindo', 'assets/sound/399523__amateurj__banjo.ogg');
    audio.preload('iniciar-roteiro', 'assets/sound/338954__inspectorj__car-ignition-exterior-a.wav');
    audio.preload('interromper-roteiro', 'assets/sound/185744__enric592__turning-off-engine.wav');
    audio.preload('concluir-roteiro', 'assets/sound/353546__maxmakessounds__success.wav');
    audio.preload('conducao-cancelada', 'assets/sound/167337__willy-ineedthatapp-com__pup-alert.mp3');
    audio.preload('recalculando-trajeto', 'assets/sound/104026__rutgermuller__tires-squeaking.aif');
    audio.play('iniciar-roteiro');
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

