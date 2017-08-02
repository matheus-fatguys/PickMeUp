import { Component, Input, OnInit, OnChanges } from '@angular/core';

import { CarProvider } from '../../providers/car/car';

import * as SlidingMarker from 'marker-animate-unobtrusive';

/**
 * Generated class for the PickupCarComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'pickup-car',
  templateUrl: 'pickup-car.html'
})
export class PickupCarComponent implements OnInit, OnChanges {

	@Input() map: google.maps.Map;
  @Input() isPickupRequested: boolean;
  @Input() pickupLocation: google.maps.LatLng;
  public pickupCarMarker: any;
  public polylinePath: google.maps.Polyline;

  constructor(public carService: CarProvider) {
  }
  
  ngOnInit() {
    
  }
  
  ngOnChanges() {
    
    if (this.isPickupRequested) {
		this.requestCar();
	}
	else {
		this.removeCar();
    }
    
  }
  
  addCarMarker(position) {
    this.pickupCarMarker = new SlidingMarker({
      map: this.map,
      position: position,
      icon: 'img/car-icon.png'
    });
    
    this.pickupCarMarker.setDuration(1000);
    this.pickupCarMarker.setEasing('linear');
  }
  
  showDirections(path) {
    this.polylinePath = new google.maps.Polyline({
      path: path,
      strokeColor: '#FF0000',
      strokeWeight: 3
    });
    this.polylinePath.setMap(this.map);
  }
  
  requestCar() {
		console.log('request car ' + this.pickupLocation);
		this.carService.findPickupCar(this.pickupLocation)
		  .subscribe(car => {
			// show car marker
			this.addCarMarker(car.position);
			// show car path/directions to you
			this.showDirections(car.path);
			// keep updating car
			this.updateCar( ()=> this.checkForRiderPickup() );
		  })
	}
	
	removeCar() {
	
    }

}
