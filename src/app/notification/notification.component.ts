import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NotificationMessage, NotificationType } from '../_models/enum';
import { User } from '../_models/user.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  message: SafeHtml = "";
  notificationType = NotificationType;
  type!: NotificationType;
  // dialogType!: NotificationMessage;
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log("queryparams", this.route.snapshot.queryParams);
    this.type = +this.route.snapshot.queryParams["type"];
    let message = this.route.snapshot.queryParams["message"].replace(/\%2B/g," ")
    if(this.type == NotificationType.Success){
      let icon = '<i class="fas fa-check" style="margin-right: 0.5rem"></i>'
      this.message = this.sanitizer.bypassSecurityTrustHtml(icon + message)
    }
    if(this.type == NotificationType.Error){
      let icon = '<i class="fas fa-exclamation-circle" style="margin-right: 0.5rem"></i>'
      this.message = this.sanitizer.bypassSecurityTrustHtml(icon + message);
    }
    // if(this.dialogType == NotificationMessage.Authenticated){
    //   this.type = NotificationType.Success;
    //   this.message = this.sanitizer.bypassSecurityTrustHtml('<i class="fas fa-check" style="margin-right: 0.5rem"></i> Erfolgreich authentifiziert!');
    // }

    // if(this.dialogType == NotificationMessage.No_Printer_Selected){
    //   this.type = NotificationType.Error
    //   this.message = "Keine Drucker vorab ausgewählt. Bitte wählen Sie die Drucker aus, die Sie für die unterschiedlichen Druckaufträge verwenden wollen."
    // }

    // // this.message = "Herzilich Willkommen!"
    // // if(this.type == NotificationType.Success) {
    // //   let user: User = JSON.parse(<string>localStorage.getItem("user"));
    // //   this.message = this.sanitizer.bypassSecurityTrustHtml(`Erfolgreich als ${user.username} authentifiziert!`)
    // // }
  }

}
