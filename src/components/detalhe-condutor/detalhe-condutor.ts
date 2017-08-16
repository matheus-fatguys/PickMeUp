import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Condutor } from './../../models/condutor';
import { Component, Input, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Subject } from "rxjs/Subject";


@Component({
  selector: 'detalhe-condutor',
  templateUrl: 'detalhe-condutor.html'
})
export class DetalheCondutorComponent {
  validoChanged: Subject<boolean>;

  @Input() condutor= {} as Condutor;
  @Output()
  onChangeValido = new EventEmitter<any>();  
  public form:FormGroup;

  

  constructor(public formBuilder: FormBuilder) {
      this.validoChanged= new Subject<boolean>();
      this.validoChanged.asObservable()
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(c=>{this.validar()});
      this.form = formBuilder.group({
                    nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
                    telefone: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.pattern('^[(][0-9]{2}[)][\\\s]?[0-9]{4,5}[-][0-9]{4}$')])],
                });
    
  }

  isValido(){
    return this.form.valid;
  }

  validar(){
    this.onChangeValido.next(this.form.valid);
  }

}
