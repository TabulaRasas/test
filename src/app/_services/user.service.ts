import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { of, switchMap } from 'rxjs';
import { User } from '../_models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: any;
  private readonly api:string = "https://localhost:44320/api/"
  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private router: Router
  ) {}

  login(username: string, passwordHash: string) {
    return this.http.post(this.api + 'Authentication/login', {username, passwordHash}).pipe(
      switchMap(user => {
        if(user){
          console.log(user)
          this.user = user;
          this.user.einsender = String(this.user.einsender).trim();
          this.user.username = String(this.user.username).trim();
          this.electronService.ipcRenderer.send("user", user);
          localStorage.setItem("user", JSON.stringify(user));
          // this.electronService.ipcRenderer.send("user", user);
          return of("success")
        }
        else return of(null);
      })
    ).subscribe({
      next: (msg) => {
        // if(msg == "success")
        // else alert("Falsche Benutzerkennung")
      },
      error: (error) => {
        console.error(error)
        alert(error.error);
      }
    })
  }
}
