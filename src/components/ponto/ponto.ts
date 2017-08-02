import { Component, Input, OnInit, OnChanges } from '@angular/core';

/**
 * Generated class for the PontoComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'ponto',
  templateUrl: 'ponto.html'
})
export class PontoComponent implements OnInit, OnChanges{
  @Input() isPinSet: boolean;
  @Input() isPickupRequested: boolean;
  @Input() map: google.maps.Map;
  private pickupMarker: google.maps.Marker;
  private popup: google.maps.InfoWindow;

  constructor() {
    
  }

  ngOnInit() {
    
  }

  ngOnChanges(changes) {
    console.log(changes);
    
    if (this.isPinSet) {
      this.showPickupMarker();
    }
    else {
      this.removePickupMarker();
    }
    
  }

  showPickupMarker() {
    
    this.pickupMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.BOUNCE,
      position: this.map.getCenter(),
      icon: 'img/person-icon.png'
    })
    
    setTimeout( () => {
      this.pickupMarker.setAnimation(null);
    }, 750);

    this.showPickupTime();
    
  }
  
  removePickupMarker() {
    if (this.pickupMarker) {
      this.pickupMarker.setMap(null);
      this.pickupMarker = null;
    }
  }

  showPickupTime() {
    this.popup = new google.maps.InfoWindow({
      content: '<h5>You Are Here</h5>'
    });
    
    this.popup.open(this.map, this.pickupMarker);
    
    google.maps.event.addListener(this.pickupMarker, 'click', () => {
      this.popup.open(this.map, this.pickupMarker);
    });
  }

}
