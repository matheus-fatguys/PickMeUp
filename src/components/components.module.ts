import { NgModule } from '@angular/core';
import { SimpleComponent } from './simple/simple';
import { MapComponent } from './map/map';
import { PontoComponent } from './ponto/ponto';
@NgModule({
	declarations: [SimpleComponent,
    MapComponent,
    PontoComponent],
	imports: [],
	exports: [SimpleComponent,
    MapComponent,
    PontoComponent]
})
export class ComponentsModule {}
