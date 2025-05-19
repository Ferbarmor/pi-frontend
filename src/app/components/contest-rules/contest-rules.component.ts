import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Rally } from '../../models/rally';
import { RalliesService } from '../../services/rallies.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-contest-rules',
  imports: [RouterLink, DatePipe],
  templateUrl: './contest-rules.component.html',
  styleUrl: './contest-rules.component.css'
})
export class ContestRulesComponent {
  public rally: Rally = <Rally>{};

  constructor(private serrally: RalliesService) { }

  ngOnInit() {
    this.serrally.ObtenerRallyId(1).subscribe({
      next: res => {
        console.log("Resultado de los rallies ", res)
        this.rally = res;
      },
      error: error => console.log("Esto es un eror del servidor", error)
    });
  }

}
