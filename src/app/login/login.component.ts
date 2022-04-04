import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { sha512 } from 'js-sha512';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  wasInactive: boolean = false;
  constructor(
    private userSrv: UserService, 
    private route: ActivatedRoute, 
    private router: Router,
    ) { }

  ngOnInit(): void {
    // if(this.userSrv.user) this.router.navigate(['dashboard']) 
    this.wasInactive = this.route.snapshot.queryParams["inactive"] ? true : false;
    console.log("wasInactive", this.wasInactive)
    if(this.wasInactive){
      this.router.navigate([], {queryParams: {}})
    }
  }

  login(form: NgForm){
    const username = form.value.username;
    const passwordHash = sha512.create().update(form.value.password).hex();
    
    this.userSrv.login(username, passwordHash);
  }

}
