import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { SimpleComponent } from './simple/simple';
import { MapComponent } from './map/map';
import { PontoComponent } from './ponto/ponto';
import { AvailableCarsComponent } from './available-cars/available-cars';
import { PickupCarComponent } from './pickup-car/pickup-car';
import { DestinationAddressComponent } from './destination-address/destination-address';
import { DetalheConduzidoComponent } from './detalhe-conduzido/detalhe-conduzido';
import { MenuLateralComponent } from './menu-lateral/menu-lateral';
import { DetalheCondutorComponent } from './detalhe-condutor/detalhe-condutor';
@NgModule({
	declarations: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent,
    DestinationAddressComponent,
    DetalheConduzidoComponent,
    MenuLateralComponent,
    DetalheCondutorComponent],
	imports: [IonicModule],
	exports: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent,
    DestinationAddressComponent,
    DetalheConduzidoComponent,
    MenuLateralComponent,
    DetalheCondutorComponent]
})
export class ComponentsModule {}
