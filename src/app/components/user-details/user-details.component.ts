import { Component } from '@angular/core';
import { UsuarioService } from '../../services/usuarios.service';
import { Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Usuario } from '../../models/usuario';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-user-details',
  imports: [DatePipe],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  @Input() usuario: Usuario = <Usuario>{}
  @Output() detailsClosed = new EventEmitter<{ success: boolean, message?: string, usuario?: Usuario }>();
  constructor(private seruser: UsuarioService) { }
  ngOnInit() {
    console.log("Este es el valor del usuario al empezar", this.usuario);
  }

  closeDetails(){
    this.detailsClosed.emit({success: true});
  }
}
