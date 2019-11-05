console.log('index js.js');
//var cmd     = require('node-command-line'),Promise = require('bluebird');
var cmd=require('node-cmd');
const { exec } = require('child_process');
document.querySelector('#btnEd').addEventListener('click', runSingleCommandWithoutWait);
document.querySelector('#btnSubmit').addEventListener('click', runTestfunction);
document.querySelector("#btnreset").addEventListener('click', clearlocalstorage);
function selectFunction(data){  
    var devices=data.trim().split('\n');
    document.getElementById('deviceNames').innerHTML='';
    for(x=1;x<devices.length;x++){
    var option = "<option value='" + devices[x] + "'>" + devices[x] + "</option>";
    document.getElementById('deviceNames').innerHTML += option;   
    } 
} 

function runSingleCommandWithoutWait() {
    var androidSdkPath = localStorage.getItem('path');
    if(androidSdkPath == '') {
        alert("Android sdk path is required");
        return;
    }
    var command = androidSdkPath +" devices";
    try{
        exec(androidSdkPath+' devices', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              alert(error);
              return;
            }else{
                console.log(`stdout: ${stdout}`);
                selectFunction(stdout);
            }
          });
    }catch(e){
        alert(e);
        localStorage.removeItem('path');
        window.location="first.html";
    }
   }
   function runTestfunction(){
       let Packagename=document.getElementById("enterpackageName").value;
       let NoofInterrupts=document.getElementById("enterInterrupts").value;
       var SelectedValue=document.getElementById("deviceNames").value.trim().split(/(\s+)/);
       if(Packagename!='' && NoofInterrupts!='' && SelectedValue!=''){
        exec(localStorage.getItem('path')+' -s '+SelectedValue[0]+' shell monkey -p '+Packagename+' --ignore-crashes --ignore-timeouts --monitor-native-crashes -v '+NoofInterrupts+'', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              alert(error);
            }else{
                console.log(`stdout: ${stdout}`);
                alert("Test Complete. Crash if any notified via crashlytics")
            }
          });
       }else{
           alert("Input package name or Number of interrupts or Select device to run!!");
       }
   }

   function clearlocalstorage() {
       window.localStorage.clear();
       alert("Path reset. Please quit the app and relaunch")
   }

