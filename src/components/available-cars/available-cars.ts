import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CarProvider } from '../../providers/car/car';


@Component({
  selector: 'available-cars',
  templateUrl: 'available-cars.html'
})
export class AvailableCarsComponent implements OnInit {

  @Input() map: google.maps.Map;
  @Input() isPickupRequested: boolean;

  public carMarkers: Array<google.maps.Marker>=[];

  constructor(public carService: CarProvider) {
  }

  ngOnInit() {
    this.fetchAndRefreshCars();
  }

  addCarMarker(car) {
    let carMarker = new google.maps.Marker({
      map: this.map,
      position: new google.maps.LatLng(car.coord.lat, car.coord.lng),
      icon: 'img/car-icon.png'  
    });
    
    carMarker.set('id', car.id); // MVCObject()
    
    this.carMarkers.push(carMarker);
  }
  
  updateCarMarker(car) {
    for (var i=0, numOfCars=this.carMarkers.length; i < numOfCars; i++) {
      // find car and update it
      if ((<any>this.carMarkers[i]).id === (<any>car).id) {
        this.carMarkers[i].setPosition(new google.maps.LatLng(car.coord.lat, car.coord.lng));
        return;
      }
      
    }
    
    // car does not exist in carMarkers
    this.addCarMarker(car);
  }

  fetchAndRefreshCars(){
      this.carService.getCars(9,9)
      .subscribe(carsData => {
        
        if (!this.isPickupRequested) {
          (<any>carsData).cars.forEach( car => {
            this.updateCarMarker(car);
          })
        }
      })
  }
}
