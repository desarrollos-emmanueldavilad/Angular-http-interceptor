import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'interceptor';

  constructor(public httpClient: HttpClient, public router: Router) {}

  sendGetRequest() {
      this.httpClient
        .get('https://jsonplaceholder.typicode.com/users1')
        .subscribe((res) => {
          console.log(res)
        });

        
  }






}
