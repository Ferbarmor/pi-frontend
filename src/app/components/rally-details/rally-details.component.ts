import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Rally } from '../../models/rally';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rally-details',
  imports: [DatePipe],
  templateUrl: './rally-details.component.html',
  styleUrl: './rally-details.component.css'
})
export class RallyDetailsComponent {
  @Input() rally: Rally = <Rally>{}
  @Output() detailsClosed = new EventEmitter<{ success: boolean, message?: string, rally?: Rally }>();
  constructor() { }
  ngOnInit() {
    console.log("Este es el valor del rally al empezar", this.rally);
  }

  closeDetails(){
    this.detailsClosed.emit({success: true});
  }

}
