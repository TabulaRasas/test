const { app, BrowserWindow, Tray, Menu, ipcMain, net, shell, safeStorage, screen} = require('electron')
const { print, getPrinters, getDefaultPrinter} = require("pdf-to-printer");
const Store = require('electron-store');
const path = require('path')
const fs = require("fs");
const https = require("https")
const FormData = require("form-data");
const axios = require('axios').default;
const agent = new https.Agent({  
    rejectUnauthorized: false
  });
const {find, compact} = require("lodash");
let mainWindow = null;
let notificationWindow = null;
let isQuiting = false;
let printers = null;
let tray = null;
let store = new Store();
let einsender;

if(process.defaultApp){
    if(process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("connector", process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('connector');
  }

  const gotTheLock = app.requestSingleInstanceLock();
  if(!gotTheLock){
    app.quit();
  } else {
    app.on('second-instance', async (event, argv, workingDirectory) => {
      if(mainWindow){
        if(mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
      const cmd = find(argv, cmd => {
        return cmd.indexOf('connector://') > -1
      })
      let actualCommands = "";
      if(cmd) {
        actualCommands = null;
      }
      console.log(actualCommands);
      let filesToPrint = actualCommands[1].replace(/_/g, " ").split(" ")
      
      if(filesToPrint.length > 1){
        if(!store.get("printer_settings")){
            let message = "Bitte wählen Sie vorab die gewünschten Drucker aus."
            createNotification(2, `message=${replaceWithespacesWithPlus(message)}`);
            goToPrinterSettings();
            return;
        }
        filesToPrint.pop();
        const promises = filesToPrint.map(dateiname => getPdfToPrint(`output\\${actualCommands[0]}\\` , dateiname.replace("/", "")));
        await Promise.all(promises).then(res => {console.log(res)});
      }
        
    })
  }
  
function createMainwindow(componentPath) {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 700,
        height: 550,
        transparent: true,
        // backgroundColor: '#ffffff',
        // logo path 
        icon: `${__dirname}/dist/connector/assets/icons/icon.ico`,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            backgroundThrottling: false,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        show: false
        // nodeIntegration: true
    });
    mainWindow.loadURL(`file://${__dirname}/dist/connector/index.html#/${componentPath}`);
    mainWindow.removeMenu()
    mainWindow.on("ready-to-show", (event) => {
        mainWindow.show()
    })
    //// uncomment below to open the DevTools.
    mainWindow.webContents.openDevTools();
    // Event when the window is closed.
    mainWindow.on('close', function (event) {
        if(!isQuiting && tray){
            event.preventDefault();
            mainWindow.hide();
        }else mainWindow.close()
    
        return false;
    });
    
}

// Create window on electron intialization
app.on('ready', () => {
    if(store.get("user")) createTrayApp()
    else createMainwindow("login");
});
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('before-quit', function () {
    isQuiting = true;
  });

ipcMain.on("user", (event, user)=> {
    if(user){
        store.set("user", user);
        let message = `Erfolgreich als ${user.username} authentifiziert!`
        createNotification(1, `message=${replaceWithespacesWithPlus(message)}`);
    }
    mainWindow.hide();
    createTrayApp();
})

ipcMain.on("savePrinterSettings", (event, selectedPrinters) => {
    store.set("printer_settings", selectedPrinters);
})
// app.on('activate', function () {
//     // macOS specific close process
//     if (mainWindow === null) {
//         createMainwindow()
//     }
// });


async function createTrayApp(){
    // try{
    //     printers = await getPrinters()
    //   } catch(e){
    //     console.error(e);
    //   }


      tray = new Tray(`${__dirname}/dist/connector/assets/icons/icon.ico`);
      let user = store.get("user");
      const contextMenu = Menu.buildFromTemplate([
        {label: `Einsender (${user.einsender})`, click: changeEinsender},
        {label: "Druckereinstellungen", click: goToPrinterSettings},
        {label: "Abmelden", click: logout},
        {label: "Beenden", click: quitApp},
      ])
    
      tray.setContextMenu(contextMenu);
    
      app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createLoginDialog()
      })
      tray.on("close", function(event){
        event.preventDefault();
      })
}

async function goToPrinterSettings(){
    createMainwindow("printer-settings")
    printers = await mainWindow.webContents.getPrintersAsync();
    // mainWindow.loadURL(`file://${__dirname}/dist/connector/index.html#/printer-settings`);
    mainWindow.setSize(600, 970);
    mainWindow.center();
    mainWindow.moveTop();
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("existing-printers", printers)
        if(store.get("printer_settings"))
            mainWindow.webContents.send("selected-printers", store.get("printer_settings"));
    })
    mainWindow.show();
}

function quitApp(){
    app.quit();
}

function logout(){
    store.delete("user");
    tray.destroy();
    createMainwindow("login")
}

function createNotification(type, params){
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width;
    let height = display.bounds.height
    notificationWindow = new BrowserWindow({
        width: 500,
        x: width - 500,
        y: height - 125,
        useContentSize: true,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        show:false
    })

    notificationWindow.loadURL(`file://${__dirname}/dist/connector/index.html#/notification?type=${type}&${params}`)
    notificationWindow.setSkipTaskbar(true);
    notificationWindow.on("ready-to-show", (event, isAlwaysOnTop) => {
        notificationWindow.show();
    })


    setTimeout(() => {
        if(notificationWindow)
            notificationWindow.close();
    }, 4000)


    // notification.openDevTools()
}
function changeEinsender(){

}

function getPdfToPrint(output, filename){
    return new Promise((resolve, reject) => {
        axios.get(`https://localhost:44320/api/EditOrder/getOrderPdf?output=${output}&dateiname=${filename}`, {responseType: "arraybuffer",headers: {
        'Accept': 'application/pdf'
    }, httpsAgent: agent})
    .then(async res => {
        let tmpFile = `${__dirname}/pdfs/${filename}`
        fs.writeFileSync(tmpFile, res.data, {encoding: "binary"});
        let printer_settings = store.get("printer_settings");
        // if(printer_settings){
        let printer = printer_settings["laborDrucker"];
        print(tmpFile, {printer: printer}).then(resolve("success")).catch(error => resolve(error))
        console.log(printer);
        // } else {
        //     let message = "Bitte wählen Sie vorab die gewünschten Drucker aus."
        //     createNotification(2, `message=${replaceWithespacesWithPlus(message)}`);
        //     goToPrinterSettings();
        // }

    }).catch(error => {console.error(error), reject(error.error)})
    })
}

function replaceWithespacesWithPlus(string){
    return string.replace(/\s+/g, '+');
}

function deleteteTempPDFs(){
    fs.readdir(__dirname + "/pdfs", (err, files) => {
        if(err) throw err;
    
        for(const file of files){
            fs.unlink(path.join(__dirname + "/pdfs", file), error => {
                if(error) throw error;
            })
        }
    })
}
