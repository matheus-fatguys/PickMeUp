import { ConducaoPage } from './../pages/conducao/conducao';


import { firebaseConfig } from './firebase-config';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import { FatguysUberProvider } from '../providers/fatguys-uber/fatguys-uber';

import { MyApp } from './app.component';


import {Geolocation} from '@ionic-native/geolocation';
import { CarProvider } from '../providers/car/car';
import { SimulateProvider } from '../providers/simulate/simulate';
import { PickupPubSubProvider } from '../providers/pickup-pub-sub/pickup-pub-sub';


@NgModule({
  declarations: [
    MyApp,
     //ConducaoPage,
    // SimpleComponent,
    // MapComponent,
    // PontoComponent,
    // AvailableCarsComponent,
	  // PickupCarComponent,
	  // DestinationAddressComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    //ConducaoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Geolocation,
    CarProvider,
    SimulateProvider,
    PickupPubSubProvider,
    FatguysUberProvider
  ]
})
export class AppModule {}
