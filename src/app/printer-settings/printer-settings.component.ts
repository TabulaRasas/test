import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-printer-settings',
  templateUrl: './printer-settings.component.html',
  styleUrls: ['./printer-settings.component.css']
})
export class PrinterSettingsComponent implements OnInit {
  form!: FormGroup;
  existingPrinters: any[] = [];
  selectedPrinters = [];
  constructor(private electronService: ElectronService, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.form = new FormGroup({
      laborDrucker: new FormControl(),
      laborSchacht: new FormControl(),
      eveDrucker: new FormControl(),
      eveSchacht: new FormControl(),
      bestellungDrucker: new FormControl(),
      bestellungSchacht: new FormControl(),
      mutterpassDrucker: new FormControl(),
      mutterpassSchacht: new FormControl(),
      etikettenDrucker: new FormControl(),
      etikettenSchacht: new FormControl()
    })
    this.electronService.ipcRenderer.on("existing-printers", (event, printers) => {
      console.log("existing Printers",printers);
      this.existingPrinters = printers;
      this.cdr.detectChanges();
    })

    this.electronService.ipcRenderer.on("selected-printers", (event,printers) => {
        if(printers){
          console.log("selected Printers", printers)
          this.form.controls["laborDrucker"].setValue(printers["laborDrucker"]);
          this.form.controls["laborSchacht"].setValue(printers["laborSchacht"]);
          this.form.controls["eveDrucker"].setValue(printers["eveDrucker"]);
          this.form.controls["eveSchacht"].setValue(printers["eveSchacht"]);
          this.form.controls["bestellungDrucker"].setValue(printers["bestellungDrucker"]);
          this.form.controls["bestellungSchacht"].setValue(printers["bestellungSchacht"]);
          this.form.controls["mutterpassDrucker"].setValue(printers["mutterpassDrucker"]);
          this.form.controls["mutterpassSchacht"].setValue(printers["mutterpassSchacht"]);
          this.form.controls["etikettenDrucker"].setValue(printers["etikettenDrucker"]);
          this.form.controls["etikettenSchacht"].setValue(printers["etikettenSchacht"]);
          this.cdr.detectChanges();
          
        }
    })
  }

  savePrinterSettings(){
    console.log(this.form.value);
    this.electronService.ipcRenderer.send("savePrinterSettings", this.form.value);
  }
}
