import { NgModule } from '@angular/core';
import { SimpleComponent } from './simple/simple';
import { MapComponent } from './map/map';
import { PontoComponent } from './ponto/ponto';
import { AvailableCarsComponent } from './available-cars/available-cars';
import { PickupCarComponent } from './pickup-car/pickup-car';
@NgModule({
	declarations: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent],
	imports: [],
	exports: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent]
})
export class ComponentsModule {}
