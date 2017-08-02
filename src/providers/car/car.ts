import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {SimulateProvider} from '../simulate/simulate';


@Injectable()
export class CarProvider {

  constructor(private simulate: SimulateProvider) {
  }

  getCars(lat, lng) {
    return Observable
      .interval(2000)
      .switchMap(()=> {return this.simulate.getCars(lat, lng);})
      .share();
  }
  
  findPickupCar(pickupLocation) {
    return this.simulate.findPickupCar(pickupLocation);
  }

}
