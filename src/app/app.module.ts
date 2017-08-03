import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {SimpleComponent} from '../components/simple/simple';
import {MapComponent} from '../components/map/map';
import {AvailableCarsComponent} from '../components/available-cars/available-cars';
import { PickupCarComponent } from '../components/pickup-car/pickup-car';
import {Geolocation} from '@ionic-native/geolocation';
import {PontoComponent} from '../components/ponto/ponto';
import { CarProvider } from '../providers/car/car';
import { SimulateProvider } from '../providers/simulate/simulate';
import { PickupPubSubProvider } from '../providers/pickup-pub-sub/pickup-pub-sub';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
	PickupCarComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Geolocation,
    CarProvider,
    SimulateProvider,
    PickupPubSubProvider
  ]
})
export class AppModule {}
