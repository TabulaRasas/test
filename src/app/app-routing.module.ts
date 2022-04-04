import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotificationComponent } from './notification/notification.component';
import { PrinterSettingsComponent } from './printer-settings/printer-settings.component';

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "printer-settings", component: PrinterSettingsComponent},
  {path: "notification", component: NotificationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
