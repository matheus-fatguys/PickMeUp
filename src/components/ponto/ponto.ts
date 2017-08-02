import { Component, Input, OnInit } from '@angular/core';

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
export class PontoComponent implements OnInit{
  @Input() isPinSet: boolean;
  @Input() isPickupRequested: boolean;
  constructor() {
    
  }

  ngOnInit() {
    
  }

}
