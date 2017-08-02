import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class SimulateProvider {

  constructor() {
  }

  getCars(lat, lng) {
    
    let carData = this.cars[this.carIndex];
    
    this.carIndex++;
    
    if (this.carIndex > this.cars.length-1) {
      this.carIndex = 0;
    }
    
    return Observable.create(
      observer => observer.next(carData)
    )
  }
  
  private carIndex: number = 0;
  
  private cars1 = {
    cars: [{
      id: 1,
      coord: {
        lat: -12.968481,
        lng: -38.475344
      }
    },
    {
      id: 2,
      coord: {
        lat: -12.962960,
        lng: -38.476074
      }
    }
  ]
 };
 
 private cars2 = {
    cars: [{
      id: 1,
      coord: {
        lat: -12.965428,
        lng: -38.474829
      }
    },
    {
      id: 2,
      coord: {
        lat: -12.963170,
        lng: -38.471739
      }
    }
  ]
 };
 
 private cars3 = {
    cars: [{
      id: 1,
      coord: {
        lat: -12.965888,
        lng: -38.473241
      }
    },
    {
      id: 2,
      coord: {
        lat: -12.971366,
        lng: -38.475344
      }
    }
  ]
 };
 
 private cars4 = {
    cars: [{
      id: 1,
      coord: {
        lat: -12.963588,
        lng: -38.478391
      }
    },
    {
      id: 2,
      coord: {
        lat: -12.961580,
        lng: -38.468392
      }
    }
  ]
 };
 
 private cars5 = {
    cars: [{
      id: 1,
      coord: {
        lat: -12.971943,
        lng: 28.055531
      }
    },
    {
      id: 2,
      coord: {
        lat: -26.103833,
        lng: -38.473966
      }
    }
  ]
 };
  
 private cars: Array<any> = [this.cars1, this.cars2, this.cars3, this.cars4, this.cars5];
  

}
