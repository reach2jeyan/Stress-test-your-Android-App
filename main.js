console.log('mainprocess is running');
const electron =require('electron');
//for UI "app"
const app=electron.app;
const BrowerWindow=electron.BrowserWindow;
const path=require('path');
const url=require('url');
const {Menu} = require('electron')



let win; //reference to window

function createWindow(){
    win=new BrowerWindow({fullscreen: false});
    win.maximize()
    //win.webContents.openDevTools();
    win.loadURL(url.format({
        pathname:path.join(__dirname,'app/first.html'),
        protocol:'file',
        slashes:true
    }));


    win.on('closed',()=>{
        win=null;
    });
}
app.on('ready',createWindow);


app.on('window-all-closed',()=>{
    if(process.platform!=='darwin'){
        app.quit();
    }
});

app.on('activate',()=>{
    if(win==null){
        createWindow()
        createMenu
    }
});

    // Create the Application's main menu
    function createMenu() {
        const application = {
          label: "Application",
          submenu: [
            {
              label: "About Application",
              selector: "orderFrontStandardAboutPanel:"
            },
            {
              type: "separator"
            },
            {
              label: "Quit",
              accelerator: "Command+Q",
              click: () => {
                app.quit()
              }
            }
          ]
        }
      
        const edit = {
          label: "Edit",
          submenu: [
            {
              label: "Undo",
              accelerator: "CmdOrCtrl+Z",
              selector: "undo:"
            },
            {
              label: "Redo",
              accelerator: "Shift+CmdOrCtrl+Z",
              selector: "redo:"
            },
            {
              type: "separator"
            },
            {
              label: "Cut",
              accelerator: "CmdOrCtrl+X",
              selector: "cut:"
            },
            {
              label: "Copy",
              accelerator: "CmdOrCtrl+C",
              selector: "copy:"
            },
            {
              label: "Paste",
              accelerator: "CmdOrCtrl+V",
              selector: "paste:"
            },
            {
              label: "Select All",
              accelerator: "CmdOrCtrl+A",
              selector: "selectAll:"
            }
          ]
        }
      
        const template = [
          application,
          edit
        ]
      
        Menu.setApplicationMenu(Menu.buildFromTemplate(template))
      }