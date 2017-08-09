import { FatguysUberProvider } from './../providers/fatguys-uber/fatguys-uber';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Nav } from "ionic-angular";


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
    public fatguysService: FatguysUberProvider) {

    const authObserver = afAuth.authState.subscribe( user => {
              if (user!=null) {
                this.fatguysService.obterCondutorPeloUsuarioLogado().subscribe(
                  r=>{
                    this.rootPage = 'HomePage';
                    //authObserver.unsubscribe();
                  }
                );
              } else {
                this.rootPage = 'LoginPage';
                //authObserver.unsubscribe();
              }
            });

    platform.ready().then(() => {
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

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

