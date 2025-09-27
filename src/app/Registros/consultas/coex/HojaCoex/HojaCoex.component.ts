import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../service/api.service';

@Component({
  selector: 'app-HojaCoex',
  templateUrl: './HojaCoex.component.html',
  styleUrls: ['./HojaCoex.component.css']
})
export class HojaCoexComponent implements OnInit {

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.api.ordenes$.subscribe(ordenes => {
      console.log("📊 Ordenes recibidas:", ordenes);
    });
  }

}
