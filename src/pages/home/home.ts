import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {PickupPubSubProvider} from '../../providers/pickup-pub-sub/pickup-pub-sub';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public isPickupRequested: boolean;
  public destination: string;
  public pickupSubscription: any;
  public timeTillArrival: number;

  constructor(public navCtrl: NavController,
              private pickupPubSub: PickupPubSubProvider) {
  
      this.isPickupRequested = false;
      this.timeTillArrival = 5;
      this.pickupSubscription = this.pickupPubSub.watch().subscribe(e => {
        this.processPickupSubscription(e);
      })
  }

  processPickupSubscription(e) {
    switch(e.event) {
      case this.pickupPubSub.EVENTS.ARRIVAL_TIME:
        this.updateArrivalTime(e.data);
        break;
    }
  }

  updateArrivalTime(seconds) {
    let minutes = Math.floor(seconds/60);
    this.timeTillArrival = minutes;
  }

  confirmPickup() {
    this.isPickupRequested = true;
  }

  cancelPickup() {
    this.isPickupRequested = false;
  }

}
