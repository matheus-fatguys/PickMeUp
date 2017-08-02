import { NgModule } from '@angular/core';
import { SimpleComponent } from './simple/simple';
import { MapComponent } from './map/map';
import { PontoComponent } from './ponto/ponto';
import { AvailableCarsComponent } from './available-cars/available-cars';
@NgModule({
	declarations: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent],
	imports: [],
	exports: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent]
})
export class ComponentsModule {}
