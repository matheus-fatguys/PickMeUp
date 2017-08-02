import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class SimulateProvider {

	public directionsService: google.maps.DirectionsService;
	public myRoute: any;
  public myRouteIndex: number;

  constructor() {
	this.directionsService = new google.maps.DirectionsService();
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
  
  getPickupCar() {
    return Observable.create(observable => {
      
      let car = this.myRoute[this.myRouteIndex];
      observable.next(car);
      this.myRouteIndex++;
      
    })
  }
  
  getSegmentedDirections(directions) {
    let route = directions.routes[0];
    let legs = route.legs;
    let path = [];
    let increments = [];
    let duration = 0;
    
    let numOfLegs = legs.length;
    
    // work backwards though each leg in directions route
    while (numOfLegs--) {
      
      let leg = legs[numOfLegs];
      let steps = leg.steps;
      let numOfSteps = steps.length;
      
      while(numOfSteps--) {
        
        let step = steps[numOfSteps];
        let points = step.path;
        let numOfPoints = points.length;
        
        duration += step.duration.value;
        
        while(numOfPoints--) {
          
          let point = points[numOfPoints];
          
          path.push(point);
          
          increments.unshift({
            position: point,  // car position 
            time: duration,  // time left before arrival
            path: path.slice(0) // clone array to prevent referencing final path array
          })
        }
      }
    }
    
    return increments;
  }
  
  calculateRoute(start, end) {
    
    return Observable.create(observable => {
      
      this.directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          observable.next(response);
        }
        else {
          observable.error(status);
        }
      })
    });
  }
  
  simulateRoute(start, end) {
    
    return Observable.create(observable => {
      this.calculateRoute(start, end).subscribe(directions => {
        // get route path
        this.myRoute = this.getSegmentedDirections(directions);
        // return pickup car
        this.getPickupCar().subscribe(car => {
          observable.next(car); // first increment in car path
        })
      })
    });
  }
  
  findPickupCar(pickupLocation) {  

	this.myRouteIndex = 0;
  
	let car = this.cars1.cars[0]; // pick one of the cars to simulate pickupLocation
    let start = new google.maps.LatLng(car.coord.lat, car.coord.lng);
    let end = pickupLocation;
	
	return this.simulateRoute(start, end);
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
