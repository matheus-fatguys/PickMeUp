import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'destination-address',
  templateUrl: 'destination-address.html'
})
export class DestinationAddressComponent {

  @Output() newDest: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

}
